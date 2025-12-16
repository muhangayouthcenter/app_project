"use client"

import { useParams, useOutletContext } from "react-router-dom"
import "./RecordsData.css"
import { useEffect, useState } from "react"
import FetchData from '../../api/api.js'

function EmptyState({ name }) {
  return (
    <div className="empty-state">
      <div className="empty-card">
        <svg
          className="empty-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z"
          />
        </svg>
        <h3>{name} is Empty</h3>
        <p>No records found in this book</p>
      </div>
    </div>
  )
}

export default function RecordsData() {
  const { recordbook_name } = useParams()
  const {
    setAlertType,
    setAlertMessage,
    setShowAlert,
    recordBooks,
    recordBookData,
    setRecordBookData,
    authToken,
    myEmail,
    activeRecordBook,
    setActiveRecordBook,
    recordSearchTerm,
    setRecordSearchTerm,
    recordSortBy,
    setRecordSortBy,
    recordSortOrder,
    setRecordSortOrder,
    recordLimit,
    setRecordLimit
  } = useOutletContext()

  const bookMeta = (recordBooks || []).find((b) => b.id === recordbook_name)
  const [records, setRecords] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [page, setPage] = useState(1)
  const [visibleRows, setVisibleRows] = useState([])
  const [loadingPage, setLoadingPage] = useState(true)

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportRow, setExportRow] = useState(null)
  const [pendingTarget, setPendingTarget] = useState(null)
  const [pendingMissing, setPendingMissing] = useState({})
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [editingValues, setEditingValues] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newRecordValues, setNewRecordValues] = useState({})

  const fetchRecords = async (targetPage = page) => {
    if (!bookMeta || !authToken || !myEmail) return
    try {
      setLoadingPage(true)
      const response = await FetchData(
        `recordbook/search/${bookMeta.name}`,
        'GET',
        {
          page: targetPage,
          limit: recordLimit,
          sort_by: recordSortBy,
          sort_order: recordSortOrder,
          q: recordSearchTerm
        },
        authToken,
        myEmail
      )
      if (response.status) {
        setRecords(response.records)
        setTotalRecords(response.pagination.total)
        setTotalPages(response.pagination.totalPages)
        setVisibleRows(response.records)
      } else {
        setAlertType('error')
        setAlertMessage(response.message || 'Failed to load records')
        setShowAlert(true)
        setRecords([])
        setVisibleRows([])
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      setAlertType('error')
      setAlertMessage('Error loading records')
      setShowAlert(true)
      setRecords([])
      setVisibleRows([])
    } finally {
      setLoadingPage(false)
    }
  }

  // Set active recordbook when component mounts
  useEffect(() => {
    if (bookMeta && setActiveRecordBook) {
      setActiveRecordBook(bookMeta)
    }
  }, [bookMeta, setActiveRecordBook])

  useEffect(() => {
    fetchRecords(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordbook_name, page, bookMeta, authToken, myEmail, recordLimit, recordSortBy, recordSortOrder, recordSearchTerm])

  const goToPage = (p) => {
    const pageNum = Math.max(1, Math.min(totalPages, p))
    setPage(pageNum)
  }

  if (!bookMeta) {
    return <div className="records-wrapper-mac">Unknown record book: {recordbook_name}</div>
  }

  const handleDelete = (rowId) => {
    if (!bookMeta) return
    const doDelete = async () => {
      try {
        setAlertType(null)
        setAlertMessage(null)
        setShowAlert(false)
        const response = await FetchData(
          `recordbook/${bookMeta.name}/${rowId}`,
          "DELETE",
          null,
          authToken,
          myEmail
        )
        if (response.status) {
          await fetchRecords(page)
          setAlertType("success")
          setAlertMessage(response.message || "Record deleted")
          setShowAlert(true)
        } else {
          setAlertType(response.type || "warning")
          setAlertMessage(response.message || "Failed to delete record")
          setShowAlert(true)
        }
      } catch (error) {
        console.error("Delete record error", error)
        setAlertType("error")
        setAlertMessage(error.message || "Failed to delete record")
        setShowAlert(true)
      }
    }
    doDelete()
  }

  const openEdit = (row) => {
    setEditingRow(row)
    setEditingValues(row)
    setShowEditModal(true)
  }

  const saveEdit = () => {
    if (!bookMeta || !editingRow) return
    const doUpdate = async () => {
      try {
        const payload = {
          record_id: editingRow._id,
          updated_fields: editingValues,
        }
        const response = await FetchData(
          `recordbook/${bookMeta.name}`,
          "PUT",
          payload,
          authToken,
          myEmail
        )
        if (response.status) {
          await fetchRecords(page)
          setShowEditModal(false)
          setAlertType("success")
          setAlertMessage(response.message || "Record updated")
          setShowAlert(true)
        } else {
          setAlertType(response.type || "warning")
          setAlertMessage(response.message || "Failed to update record")
          setShowAlert(true)
        }
      } catch (error) {
        console.error("Update record error", error)
        setAlertType("error")
        setAlertMessage(error.message || "Failed to update record")
        setShowAlert(true)
      }
    }
    doUpdate()
  }

  const openExport = (row) => {
    setExportRow(row)
    setPendingTarget(null)
    setPendingMissing({})
    setShowExportModal(true)
  }

  const openAddRecord = () => {
    // Initialize form values based on attributes and their types
    const initialValues = {}
    bookMeta.attributes.forEach(attr => {
      switch (attr.input_type) {
        case 'checkbox':
          initialValues[attr.field_name] = false
          break
        case 'number':
          initialValues[attr.field_name] = attr.required ? 0 : ''
          break
        case 'date':
          initialValues[attr.field_name] = attr.required ? new Date().toISOString().split('T')[0] : ''
          break
        case 'select':
        case 'radio':
          // For select/radio, use first option if available, otherwise empty
          initialValues[attr.field_name] = attr.data_if_isselect && attr.data_if_isselect.length > 0 ? attr.data_if_isselect[0] : ''
          break
        case 'textarea':
        case 'text':
        case 'email':
        case 'password':
        default:
          initialValues[attr.field_name] = ''
      }
    })
    setNewRecordValues(initialValues)
    setShowAddModal(true)
  }

  const handleAddRecord = async () => {
    if (!bookMeta) return

    // Enhanced validation for different input types
    const validationErrors = []

    bookMeta.attributes.forEach(attr => {
      const value = newRecordValues[attr.field_name]

      // Check required fields
      if (attr.required) {
        if (value === '' || value === null || value === undefined) {
          validationErrors.push(`${attr.field_name} is required`)
          return
        }
      }

      // Type-specific validation
      switch (attr.input_type) {
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            validationErrors.push(`${attr.field_name} must be a valid email address`)
          }
          break
        case 'number':
          if (value !== '' && value !== null && value !== undefined) {
            const numValue = Number(value)
            if (isNaN(numValue)) {
              validationErrors.push(`${attr.field_name} must be a valid number`)
            }
          }
          break
        case 'date':
          if (value && isNaN(Date.parse(value))) {
            validationErrors.push(`${attr.field_name} must be a valid date`)
          }
          break
        case 'select':
        case 'radio':
          if (attr.required && (!attr.data_if_isselect || attr.data_if_isselect.length === 0)) {
            validationErrors.push(`${attr.field_name} has no options configured`)
          }
          break
      }

      // Unique constraint validation (basic client-side check)
      if (attr.unique && value) {
        // This would need server-side validation for full uniqueness check
        // For now, just ensure it's not empty if required
      }
    })

    if (validationErrors.length > 0) {
      setAlertType('error')
      setAlertMessage(`Validation errors: ${validationErrors.join(', ')}`)
      setShowAlert(true)
      return
    }

    try {
      setAlertType(null)
      setAlertMessage(null)
      setShowAlert(false)

      // Prepare record data with proper types and validation
      const recordData = {}
      bookMeta.attributes.forEach(attr => {
        const value = newRecordValues[attr.field_name]

        // Skip empty optional fields
        if (!attr.required && (value === '' || value === null || value === undefined)) {
          return
        }

        switch (attr.input_type) {
          case 'number':
            recordData[attr.field_name] = Number(value)
            break
          case 'checkbox':
            recordData[attr.field_name] = Boolean(value)
            break
          case 'date':
            // Ensure date is in ISO format
            recordData[attr.field_name] = new Date(value).toISOString().split('T')[0]
            break
          case 'text':
          case 'email':
          case 'password':
          case 'textarea':
          case 'radio':
          case 'select':
          default:
            recordData[attr.field_name] = String(value).trim()
            break
        }
      })

      const response = await FetchData(
        `recordbook/${bookMeta.name}`,
        "POST",
        { record: recordData },
        authToken,
        myEmail
      )

      if (response.status) {
        await fetchRecords(page)
        setShowAddModal(false)
        // Reset form
        setNewRecordValues({})
        setAlertType("success")
        setAlertMessage(response.message || "Record added successfully")
        setShowAlert(true)
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(response.message || "Failed to add record")
        setShowAlert(true)
      }
    } catch (error) {
      console.error("Add record error", error)
      setAlertType("error")
      setAlertMessage(error.message || "Failed to add record")
      setShowAlert(true)
    }
  }

  const updateNewRecordValue = (fieldName, value) => {
    setNewRecordValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  const clearSearch = () => {
    if (setRecordSearchTerm) {
      setRecordSearchTerm('')
    }
    // Optionally reset other search-related state
    if (setRecordSortBy) setRecordSortBy('created_at')
    if (setRecordSortOrder) setRecordSortOrder('desc')
    if (setRecordLimit) setRecordLimit(10)
  }

  const doExportTo = (targetBookId, filledMissing) => {
    const targetMeta = recordBooks.find((b) => b.id === targetBookId)
    if (!targetMeta) return
    const targetAttrs = targetMeta.attributes || []

    const missingAttrs = targetAttrs.filter(attr => exportRow[attr.field_name] === undefined)
    const payload = { ...exportRow }

    missingAttrs.forEach(attr => {
      const v = filledMissing?.[attr.field_name] ?? ""
      payload[attr.field_name] = v
    })

    const perform = async () => {
      try {
        const response = await FetchData(
          `recordbook/${targetMeta.name}`,
          "POST",
          { record: payload, from_app: true },
          authToken,
          myEmail
        )
        if (response.status) {
          await FetchData(
            `recordbook/${bookMeta.name}/${exportRow._id}`,
            "DELETE",
            null,
            authToken,
            myEmail
          )
          await fetchRecords(page)
          setAlertType("success")
          setAlertMessage(response.message || "Record transferred successfully")
          setShowAlert(true)
          setShowExportModal(false)
          setPendingTarget(null)
          setPendingMissing({})
        } else {
          setAlertType(response.type || "warning")
          setAlertMessage(response.message || "Failed to transfer record")
          setShowAlert(true)
        }
      } catch (error) {
        console.error("Transfer record error", error)
        setAlertType("error")
        setAlertMessage(error.message || "Failed to transfer record")
        setShowAlert(true)
      }
    }
    perform()
  }

  // Check if there are active search filters
  const hasActiveSearch = recordSearchTerm ||
    (recordSortBy && recordSortBy !== 'created_at') ||
    (recordSortOrder && recordSortOrder !== 'desc') ||
    (recordLimit && recordLimit !== 10)

  return (
    <div className="records-wrapper-mac">

      {/* Clear Search Floating Button - Only visible when search is active */}
      {hasActiveSearch && (
        <button
          className="clear-search-fab"
          onClick={clearSearch}
          title="Clear Search & Filters"
        >
          <svg className="btn-icon-small-mac" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Clear Search
        </button>
      )}

      {/* Add Record Floating Button */}
      <button
        className="add-record-fab"
        onClick={openAddRecord}
        title="Add New Record"
      >
        <svg className="btn-icon-small-mac" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        Add Record
      </button>

      {/* Middle Section - Scrollable Content */}
      <div className="records-content-mac">
        {loadingPage ? (
          <div className="records-grid-mac">
            {Array.from({ length: Math.min(recordLimit, 6) }).map((_, sk) => (
              <div key={`skeleton-${sk}`} className="record-card-mac skeleton-card">
                <div className="card-header-mac">
                  <div className="skeleton skeleton-title" />
                  <div className="skeleton skeleton-actions" />
                </div>
                <div className="card-body-mac">
                  {Array.from({ length: Math.min(bookMeta.attributes.length, 6) }).map((_, i) => (
                    <div key={i} className="record-field-mac">
                      <div className="skeleton skeleton-key" />
                      <div className="skeleton skeleton-value" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState name={bookMeta.name} />
        ) : (
          <div className="records-grid-mac">
            {visibleRows.map((record, idx) => (
              <div key={record._id} className="record-card-mac" style={{ animationDelay: `${idx * 30}ms` }}>
                <div className="card-header-mac">
                  <div className="card-index">#{bookMeta.name}</div>
                  <div className="card-actions-mac">
                    <button
                      className="btn-icon-mac btn-icon-edit"
                      title="Edit this record"
                      onClick={() => openEdit(record)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z"
                          clipRule="evenodd"
                        />
                        <path
                          fillRule="evenodd"
                          d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      className="btn-icon-mac btn-icon-transfer"
                      title="Transfer this record"
                      onClick={() => openExport(record)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v9.293l-2-2a1 1 0 0 0-1.414 1.414l.293.293h-6.586a1 1 0 1 0 0 2h6.586l-.293.293A1 1 0 0 0 18 16.707l2-2V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      className="btn-icon-mac btn-icon-delete"
                      title="Delete this record"
                      onClick={() => handleDelete(record._id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="card-body-mac">
                  {bookMeta.attributes.map((attr) => (
                    <div key={attr.field_name} className="record-field-mac">
                      <div className="field-key-mac">{attr.field_name}</div>
                      <div className="field-value-mac" title={record[attr.field_name]}>
                        {record[attr.field_name]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Section - Fixed Pagination */}
      <div className="records-footer-mac">
        <div className="pagination-controls-mac">
          <button
            className="pagination-btn-mac pagination-first"
            onClick={() => goToPage(1)}
            disabled={page === 1}
            title="First page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.41 7.41L17 6l-6 6 6 6 1.41-1.41L13.83 12l4.58-4.59zM6 6h2v12H6V6z" />
            </svg>
          </button>
          <button
            className="pagination-btn-mac pagination-prev"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            title="Previous page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
            </svg>
          </button>
          <div className="pagination-info-mac">
            <span className="page-input-mac">{totalPages}</span>
            <span className="page-divider-mac">/</span>
            <span className="page-total-mac">{totalPages}</span>
          </div>
          <button
            className="pagination-btn-mac pagination-next"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            title="Next page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z" />
            </svg>
          </button>
          <button
            className="pagination-btn-mac pagination-last"
            onClick={() => goToPage(totalPages)}
            disabled={page === totalPages}
            title="Last page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.59 7.41L7 6l6 6-6 6-1.41-1.41L10.17 12 5.59 7.41zM16 6h2v12h-2V6z" />
            </svg>
          </button>
        </div>
        <div className="pagination-summary-mac">
          Showing {(page - 1) * recordLimit + 1} to {Math.min(page * recordLimit, totalRecords)} of {totalRecords}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay-mac" onClick={() => setShowEditModal(false)}>
          <div className="modal-mac" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-mac">
              <h3>Edit Record</h3>
              <button className="modal-close-mac" onClick={() => setShowEditModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body-mac">
              {bookMeta.attributes.map((attr) => (
                <div className="form-row-mac" key={attr.field_name}>
                  <label className="form-label-mac">{attr.field_name}</label>
                  <input
                    className="form-input-mac"
                    value={editingValues[attr.field_name] || ""}
                    onChange={(e) => setEditingValues((prev) => ({ ...prev, [attr.field_name]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <div className="modal-actions-mac">
              <button className="btn-mac btn-mac-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-mac btn-mac-primary" onClick={saveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay-mac" onClick={() => setShowExportModal(false)}>
          <div className="modal-mac" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-mac">
              <h3>Transfer Record</h3>
              <button className="modal-close-mac" onClick={() => setShowExportModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body-mac">
              <p className="modal-description-mac">Select a destination record book</p>
              <div className="export-targets-mac">
                {recordBooks
                  .filter((b) => b.id !== recordbook_name)
                  .map((tb) => {
                    const missing = (tb.attributes || []).filter(attr => exportRow && exportRow[attr.field_name] === undefined)
                    return (
                      <div
                        className="export-target-mac"
                        key={tb.id}
                        onClick={() => {
                          setPendingTarget(tb)
                          const initialMissing = {}
                          missing.forEach(attr => { initialMissing[attr.field_name] = "" })
                          setPendingMissing(initialMissing)
                        }}
                      >
                        <div className="target-info-mac">
                          <div className="target-name-mac">{tb.name}</div>
                          <div className="target-attrs-mac">{tb.attributes.map(a => a.field_name).join(", ")}</div>
                          {missing.length > 0 && (
                            <div className="target-attrs-mac" style={{ color: "#c2410c" }}>
                              Missing fields: {missing.map(m => m.field_name).join(", ")}
                            </div>
                          )}
                        </div>
                        <svg
                          className="target-arrow-mac"
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59z" />
                        </svg>
                      </div>
                    )
                  })}
              </div>
              {pendingTarget && (
                <div className="modal-body-mac" style={{ marginTop: 12 }}>
                  <p className="modal-description-mac">
                    Fill missing attributes for <strong>{pendingTarget.name}</strong>
                  </p>
                  {Object.keys(pendingMissing || {}).length === 0 ? (
                    <p className="muted">No missing fields. Click transfer to proceed.</p>
                  ) : (
                    Object.keys(pendingMissing).map((key) => (
                      <div className="form-row-mac" key={key}>
                        <label className="form-label-mac">{key}</label>
                        <input
                          className="form-input-mac"
                          value={pendingMissing[key]}
                          onChange={(e) => setPendingMissing(prev => ({ ...prev, [key]: e.target.value }))}
                        />
                      </div>
                    ))
                  )}
                  <div className="modal-actions-mac" style={{ marginTop: 10 }}>
                    <button className="btn-mac btn-mac-secondary" onClick={() => { setPendingTarget(null); setPendingMissing({}); }}>
                      Cancel
                    </button>
                    <button
                      className="btn-mac btn-mac-primary"
                      onClick={() => doExportTo(pendingTarget.id, pendingMissing)}
                    >
                      Transfer
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions-mac">
              <button className="btn-mac btn-mac-secondary" onClick={() => setShowExportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="modal-overlay-mac" onClick={() => setShowAddModal(false)}>
          <div className="modal-mac modal-large-mac" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-mac">
              <h3>Add New Record</h3>
              <button className="modal-close-mac" onClick={() => setShowAddModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="modal-body-mac">
              <div className="record-form-mac">
                {bookMeta.attributes.map((attr) => (
                  <div className="form-row-mac" key={attr.field_name}>
                    <label className="form-label-mac">
                      {attr.field_name}
                      {attr.required && <span className="required-indicator-mac">*</span>}
                      <span className="field-type-indicator-mac">({attr.input_type})</span>
                      {attr.unique && <span className="unique-indicator-mac">unique</span>}
                    </label>

                    {/* Textarea for long text input */}
                    {attr.input_type === 'textarea' && (
                      <textarea
                        className="form-input-mac"
                        value={newRecordValues[attr.field_name] || ''}
                        onChange={(e) => updateNewRecordValue(attr.field_name, e.target.value)}
                        placeholder={`Enter ${attr.field_name}`}
                        required={attr.required}
                        rows={3}
                        minLength={attr.required ? 1 : 0}
                      />
                    )}

                    {/* Checkbox for boolean values */}
                    {attr.input_type === 'checkbox' && (
                      <div className="checkbox-container-mac">
                        <input
                          type="checkbox"
                          checked={Boolean(newRecordValues[attr.field_name])}
                          onChange={(e) => updateNewRecordValue(attr.field_name, e.target.checked)}
                          className="form-checkbox-mac"
                        />
                        <span className="checkbox-label-mac">{attr.field_name}</span>
                      </div>
                    )}

                    {/* Select dropdown for predefined options */}
                    {attr.input_type === 'select' && (
                      <select
                        className="form-input-mac"
                        value={newRecordValues[attr.field_name] || ''}
                        onChange={(e) => updateNewRecordValue(attr.field_name, e.target.value)}
                        required={attr.required}
                      >
                        <option value="">Select {attr.field_name}</option>
                        {attr.data_if_isselect && attr.data_if_isselect.length > 0 ? (
                          attr.data_if_isselect.map((option, idx) => (
                            <option key={idx} value={option}>{option}</option>
                          ))
                        ) : (
                          <option value="" disabled>No options available</option>
                        )}
                      </select>
                    )}

                    {/* Radio buttons for single selection */}
                    {attr.input_type === 'radio' && (
                      <div className="radio-container-mac">
                        {attr.data_if_isselect && attr.data_if_isselect.length > 0 ? (
                          attr.data_if_isselect.map((option, idx) => (
                            <label key={idx} className="radio-option-mac">
                              <input
                                type="radio"
                                name={attr.field_name}
                                value={option}
                                checked={newRecordValues[attr.field_name] === option}
                                onChange={(e) => updateNewRecordValue(attr.field_name, e.target.value)}
                                required={attr.required}
                              />
                              <span className="radio-label-mac">{option}</span>
                            </label>
                          ))
                        ) : (
                          <div className="no-options-mac">No radio options configured</div>
                        )}
                      </div>
                    )}

                    {/* Standard input types */}
                    {['text', 'email', 'password'].includes(attr.input_type) && (
                      <input
                        type={attr.input_type}
                        className="form-input-mac"
                        value={newRecordValues[attr.field_name] || ''}
                        onChange={(e) => updateNewRecordValue(attr.field_name, e.target.value)}
                        placeholder={`Enter ${attr.field_name}`}
                        required={attr.required}
                        minLength={attr.input_type === 'email' ? 5 : (attr.required ? 1 : 0)}
                        pattern={attr.input_type === 'email' ? '[^@\\s]+@[^@\\s]+\\.[^@\\s]+' : undefined}
                      />
                    )}

                    {/* Number input with validation */}
                    {attr.input_type === 'number' && (
                      <input
                        type="number"
                        className="form-input-mac"
                        value={newRecordValues[attr.field_name] || ''}
                        onChange={(e) => updateNewRecordValue(attr.field_name, e.target.value)}
                        placeholder={`Enter ${attr.field_name} (number)`}
                        required={attr.required}
                        min={attr.required ? 0 : undefined}
                        step="any"
                      />
                    )}

                    {/* Date input */}
                    {attr.input_type === 'date' && (
                      <input
                        type="date"
                        className="form-input-mac"
                        value={newRecordValues[attr.field_name] || ''}
                        onChange={(e) => updateNewRecordValue(attr.field_name, e.target.value)}
                        required={attr.required}
                        min={attr.required ? new Date().toISOString().split('T')[0] : undefined}
                      />
                    )}

                    {/* Fallback for unknown input types */}
                    {!['textarea', 'checkbox', 'select', 'radio', 'text', 'email', 'password', 'number', 'date'].includes(attr.input_type) && (
                      <input
                        type="text"
                        className="form-input-mac"
                        value={newRecordValues[attr.field_name] || ''}
                        onChange={(e) => updateNewRecordValue(attr.field_name, e.target.value)}
                        placeholder={`Enter ${attr.field_name} (${attr.input_type})`}
                        required={attr.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions-mac">
              <button className="btn-mac btn-mac-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-mac btn-mac-primary" onClick={handleAddRecord}>
                Add Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
