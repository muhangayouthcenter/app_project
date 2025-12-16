import { useEffect, useState } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import FetchData from "../../api/api"
import "./Reports.css"

export default function Reports() {
  const {
    recordBooks = [],
    setAlertType,
    setAlertMessage,
    setShowAlert,
    setShowLoader,
    setLoaderMessage,
    authToken,
    myEmail,
  } = useOutletContext()

  const navigate = useNavigate()
  const [selectedCollections, setSelectedCollections] = useState([])
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reports, setReports] = useState([])
  const [metadata, setMetadata] = useState({})
  const [running, setRunning] = useState(false)
  const [allAttributes, setAllAttributes] = useState([])
  const [collectionAttributes, setCollectionAttributes] = useState({})
  const [availableAttributes, setAvailableAttributes] = useState([])

  useEffect(() => {
    if (recordBooks.length > 0 && selectedCollections.length === 0) {
      setSelectedCollections([recordBooks[0].name])
    }
  }, [recordBooks, selectedCollections.length])

  useEffect(() => {
    const fetchAttributes = async () => {
      if (!authToken || !myEmail) return
      try {
        const response = await FetchData("reports/attributes", "GET", null, authToken, myEmail)
        if (response.status) {
          setAllAttributes(response.attributes || [])
        }
      } catch (error) {
        console.error("Failed to fetch attributes:", error)
      }
    }
    fetchAttributes()
  }, [authToken, myEmail])

  useEffect(() => {
    const fetchCollectionAttributes = async () => {
      if (!authToken || !myEmail || selectedCollections.length === 0) return

      try {
        const response = await FetchData(
          "reports/collection-attributes",
          "POST",
          { collections: selectedCollections },
          authToken,
          myEmail
        )

        if (response.status) {
          setCollectionAttributes(response.collections || {})

          const allAvailable = new Set()
          selectedCollections.forEach(collection => {
            const attrs = response.collections[collection]?.fields || []
            attrs.forEach(field => {
              allAvailable.add(field.field_name)
            })
          })

          setAvailableAttributes(Array.from(allAvailable))
          setSelectedAttributes(prev => prev.filter(attr => allAvailable.has(attr)))
        }
      } catch (error) {
        console.error("Failed to fetch collection attributes:", error)
      }
    }

    if (selectedCollections.length > 0) {
      fetchCollectionAttributes()
    } else {
      setCollectionAttributes({})
      setAvailableAttributes([])
      setSelectedAttributes([])
    }
  }, [selectedCollections, authToken, myEmail])

  const toggleCollection = (name) => {
    const newCollections = selectedCollections.includes(name)
      ? selectedCollections.filter(n => n !== name)
      : [...selectedCollections, name]

    setSelectedCollections(newCollections)
  }

  const toggleAttribute = (attributeName) => {
    setSelectedAttributes(prev =>
      prev.includes(attributeName)
        ? prev.filter(name => name !== attributeName)
        : [...prev, attributeName]
    )
  }

  const clearAll = () => {
    setSelectedCollections([])
    setSelectedAttributes([])
    setDateFrom("")
    setDateTo("")
    setReports([])
    setMetadata({})
    setCollectionAttributes({})
    setAvailableAttributes([])
  }

  const runReport = async () => {
    if (!authToken || !myEmail) {
      setAlertType("warning")
      setAlertMessage("Login and set email to run reports")
      setShowAlert(true)
      return
    }
    if (selectedCollections.length === 0) {
      setAlertType("warning")
      setAlertMessage("Select at least one collection")
      setShowAlert(true)
      return
    }

    try {
      setRunning(true)
      setLoaderMessage("Generating report...")
      setShowLoader(true)

      const payload = {
        collections: selectedCollections,
        date_range: {
          from: dateFrom || null,
          to: dateTo || null
        },
        group_by: selectedAttributes.length > 0 ? selectedAttributes.join(',') : null,
      }

      const response = await FetchData("reports/generate", "POST", payload, authToken, myEmail)

      if (response.status) {
        setReports(response.reports || [])
        setMetadata(response.metadata || {})

        if (response.warnings) {
          setAlertType("warning")
          setAlertMessage(response.warnings)
          setShowAlert(true)
        } else {
          setAlertType("success")
          setAlertMessage(`Report generated: ${response.metadata?.total_records || 0} records analyzed`)
          setShowAlert(true)
        }

        // Navigate to results page instead of showing modal
        navigate('/dashboard/reports/results', {
          state: {
            reports: response.reports || [],
            metadata: response.metadata || {},
            selectedAttributes,
            dateRange: { from: dateFrom, to: dateTo },
            selectedCollections
          }
        })
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(response.message || "Failed to generate report")
        setShowAlert(true)
      }
    } catch (error) {
      console.error("Report error", error)
      setAlertType("error")
      setAlertMessage(error.message || "Failed to generate report")
      setShowAlert(true)
    } finally {
      setRunning(false)
      setShowLoader(false)
    }
  }

  const getAttributeType = (fieldName) => {
    const attr = allAttributes.find(a => a.field_name === fieldName)
    return attr ? attr.input_type : 'unknown'
  }

  const getCollectionsForAttribute = (attributeName) => {
    const attr = allAttributes.find(a => a.field_name === attributeName)
    return attr ? attr.collections : []
  }

  const isAttributeAvailable = (attributeName) => {
    return availableAttributes.includes(attributeName)
  }

  const getCollectionFieldCount = (collectionName) => {
    return collectionAttributes[collectionName]?.total_fields || 0
  }

  return (
    <div className="dashboard-main-content">
      <div className="page-header">
        <div className="header-content">
          <div className="page-icon">
            <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
          <div>
            <h1 className="page-title">Reports</h1>
            <p className="page-subtitle">Generate detailed analytics from your data</p>
          </div>
        </div>
      </div>

      <div className="reports-container">
        {/* Collections Selection */}
        <div className="report-section">
          <div className="section-header">
            <h3>Data Sources</h3>
            <p>Select collections to analyze</p>
            <button
              className="btn-secondary"
              onClick={() => setSelectedCollections([])}
              disabled={selectedCollections.length === 0}
            >
              Clear All
            </button>
          </div>

          <div className="selection-list">
            {recordBooks.map(book => (
              <label key={book.name} className="selection-item">
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(book.name)}
                  onChange={() => toggleCollection(book.name)}
                />
                <div className="selection-content">
                  <div className="selection-title">{book.name}</div>
                  <div className="selection-meta">
                    <span>{book.total || 0} records</span>
                    <span>{getCollectionFieldCount(book.name) || book.attributes?.length || 0} fields</span>
                    {collectionAttributes[book.name] && <span className="status-loaded">✓ Loaded</span>}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedCollections.length === 0 && (
            <div className="empty-notice warning">
              Select at least one collection to continue
            </div>
          )}

          {selectedCollections.length > 0 && (
            <div className="selection-summary">
              <div className="summary-stat">
                <span className="stat-label">Collections selected:</span>
                <span className="stat-value">{selectedCollections.length}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Available fields:</span>
                <span className="stat-value">{availableAttributes.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Attributes Selection */}
        <div className="report-section">
          <div className="section-header">
            <h3>Group By Attributes</h3>
            <p>Select attributes to group data by</p>
            <button
              className="btn-secondary"
              onClick={() => setSelectedAttributes([])}
              disabled={selectedAttributes.length === 0}
            >
              Clear All
            </button>
          </div>

          {selectedCollections.length === 0 ? (
            <div className="empty-notice info">
              Select collections above to see available attributes
            </div>
          ) : availableAttributes.length === 0 ? (
            <div className="empty-notice warning">
              No common attributes found across selected collections
            </div>
          ) : (
            <>
              <div className="selection-list">
                {allAttributes
                  .filter(attr => isAttributeAvailable(attr.field_name))
                  .map(attr => {
                    const isSelected = selectedAttributes.includes(attr.field_name)
                    const collectionsUsing = attr.collections.filter(c =>
                      selectedCollections.includes(c)
                    ).length

                    return (
                      <label key={attr.field_name} className="selection-item">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleAttribute(attr.field_name)}
                        />
                        <div className="selection-content">
                          <div className="selection-title">
                            {attr.field_name}
                            <span className={`field-type type-${attr.input_type}`}>
                              {attr.input_type}
                            </span>
                          </div>
                          <div className="selection-meta">
                            <span>Used in {collectionsUsing}/{selectedCollections.length} collections</span>
                          </div>
                        </div>
                      </label>
                    )
                  })}
              </div>

              {selectedAttributes.length > 0 && (
                <div className="selected-summary">
                  <h4>Selected Attributes ({selectedAttributes.length})</h4>
                  <div className="selected-tags">
                    {selectedAttributes.map(attr => {
                      const type = getAttributeType(attr)
                      return (
                        <span key={attr} className="selected-tag" onClick={() => toggleAttribute(attr)}>
                          {attr}
                          <span className="tag-type">{type}</span>
                          <span className="tag-remove">×</span>
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedAttributes.length === 0 && (
                <div className="help-notice">
                  <strong>Tips:</strong>
                  <ul>
                    <li>Select attributes to group your data</li>
                    <li>Multiple attributes can be combined</li>
                    <li>No selection gives simple record counts</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Date Range */}
        <div className="report-section">
          <div className="section-header">
            <h3>Time Filter</h3>
            <p>Optional date range for analysis</p>
          </div>

          <div className="date-inputs">
            <div className="form-group">
              <label>From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                max={dateTo || undefined}
              />
            </div>
            <div className="form-group">
              <label>To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                min={dateFrom || undefined}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="report-actions">
          <div className="action-buttons">
            <button
              className="btn-secondary"
              onClick={clearAll}
              disabled={running}
            >
              Clear All
            </button>
            <button
              className="btn-primary"
              onClick={runReport}
              disabled={running || selectedCollections.length === 0}
            >
              {running ? (
                <>
                  <div className="loading-spinner"></div>
                  Generating Report...
                </>
              ) : (
                'Generate Report'
              )}
            </button>
          </div>

          <div className="report-summary">
            <div className="summary-item">
              <span>Collections: {selectedCollections.length}</span>
            </div>
            <div className="summary-item">
              <span>Attributes: {selectedAttributes.length}</span>
            </div>
            <div className="summary-item">
              <span>Date Filter: {dateFrom || dateTo ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}