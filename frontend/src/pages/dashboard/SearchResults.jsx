import { useEffect, useState } from "react"
import { useOutletContext, useSearchParams } from "react-router-dom"
import FetchData from "../../api/api"
import "./dashboard.css"

export default function SearchResults() {
  const {
    setAlertType,
    setAlertMessage,
    setShowAlert,
    setShowLoader,
    setLoaderMessage,
    authToken,
    myEmail,
    recordBooks = [],
  } = useOutletContext()

  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get("q") || "")
  const [collections, setCollections] = useState(params.get("collections") || "")
  const [limit, setLimit] = useState(Number(params.get("limit")) || 10)
  const [sortOrder, setSortOrder] = useState(params.get("sort_order") || "desc")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const runSearch = async () => {
    if (!query.trim()) {
      setResults([])
      return
    }
    try {
      setLoading(true)
      setLoaderMessage("Searching...")
      setShowLoader(true)
      const payload = {
        q: query.trim(),
        collections: collections.trim(),
        limit,
        sort_order: sortOrder,
      }
      const res = await FetchData("search", "GET", payload, authToken, myEmail)
      if (res.status) {
        setResults(res.results || [])
      } else {
        setResults([])
        setAlertType(res.type || "warning")
        setAlertMessage(res.message || "Search failed")
        setShowAlert(true)
      }
    } catch (error) {
      console.error("Search page error", error)
      setAlertType("error")
      setAlertMessage(error.message || "Search failed")
      setShowAlert(true)
      setResults([])
    } finally {
      setLoading(false)
      setShowLoader(false)
    }
  }

  useEffect(() => {
    runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const availableCollections = recordBooks.map((rb) => rb.name).join(", ")

  return (
    <div className="dashboard-main-content">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Search Results</h1>
          <p className="page-subtitle">Search across recordbooks with filters</p>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-panel">
          <h3>Search Filters</h3>
          <div className="form-group">
            <label>Query</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search term" />
          </div>
          <div className="form-group">
            <label>Collections (comma-separated)</label>
            <input
              value={collections}
              onChange={(e) => setCollections(e.target.value)}
              placeholder={availableCollections || "all collections"}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Limit</label>
              <input
                type="number"
                min={1}
                max={50}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || 10)}
              />
            </div>
            <div className="form-group">
              <label>Sort order</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={runSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="report-results">
          {loading ? (
            <p>Loading results...</p>
          ) : results.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No results</p>
              <p className="empty-subtext">Adjust filters and search again</p>
            </div>
          ) : (
            results.map((res) => (
              <div key={res.collection_name} className="report-card">
                <div className="report-card-header">
                  <div>
                    <h4>{res.collection_name}</h4>
                    <p className="muted">{res.total} records matched</p>
                  </div>
                </div>
                <div className="report-table">
                  <div className="report-row report-head">
                    <div>Sample</div>
                    <div style={{ textAlign: "right" }}>Count</div>
                  </div>
                  {(res.sample || []).map((row, idx) => (
                    <div className="report-row" key={idx}>
                      <div style={{ whiteSpace: "normal" }}>
                        {Object.entries(row)
                          .filter(([k]) => k !== "_id")
                          .slice(0, 4)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(" • ")}
                      </div>
                      <div style={{ textAlign: "right" }}>—</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


