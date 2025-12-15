"use client"

import { useParams, useOutletContext } from "react-router-dom"
import "./RecordsData.css"
import { useEffect, useMemo, useState } from "react"
import FetchData from '../../api/api.js'

const PAGE_SIZE = 20

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
  const { setAlertType, setAlertMessage, setShowAlert, recordBooks, recordBookData, setRecordBookData, authToken, myEmail } =
    useOutletContext()

  const bookMeta = (recordBooks || []).find((b) => b.id === recordbook_name)
  const [records, setRecords] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [page, setPage] = useState(1)
  const [visibleRows, setVisibleRows] = useState([])
  const [loadingPage, setLoadingPage] = useState(true)

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportRow, setExportRow] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [editingValues, setEditingValues] = useState({})

  useEffect(() => {
    if (!bookMeta || !authToken || !myEmail) return
    const fetchRecords = async () => {
      try {
        setLoadingPage(true)
        const response = await FetchData(`recordbook/${bookMeta.name}`, 'GET', { page: page, limit: PAGE_SIZE }, authToken, myEmail)
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
        setLoadingPage(false)
      } catch (error) {
        console.error('Error fetching records:', error)
        setAlertType('error')
        setAlertMessage('Error loading records')
        setShowAlert(true)
        setRecords([])
        setVisibleRows([])
        setLoadingPage(false)
      }
    }
    fetchRecords()
  }, [recordbook_name, page, bookMeta, authToken, myEmail])

  const goToPage = (p) => {
    const pageNum = Math.max(1, Math.min(totalPages, p))
    setPage(pageNum)
  }

  if (!bookMeta) {
    return <div className="records-wrapper-mac">Unknown record book: {recordbook_name}</div>
  }

  const handleDelete = (rowId) => {
    setRecordBookData((prev) => {
      const copy = { ...prev }
      copy[recordbook_name] = (copy[recordbook_name] || []).filter((r) => r._id !== rowId)
      return copy
    })
    setAlertType("success")
    setAlertMessage("Record deleted")
    setShowAlert(true)
  }

  const openEdit = (row) => {
    setEditingRow(row)
    setEditingValues(row)
    setShowEditModal(true)
  }

  const saveEdit = () => {
    setRecordBookData((prev) => {
      const copy = { ...prev }
      copy[recordbook_name] = (copy[recordbook_name] || []).map((r) =>
        r._id === editingRow._id ? { ...editingValues } : r,
      )
      return copy
    })
    setShowEditModal(false)
    setAlertType("success")
    setAlertMessage("Record updated")
    setShowAlert(true)
  }

  const openExport = (row) => {
    setExportRow(row)
    setShowExportModal(true)
  }

  const doExportTo = (targetBookId) => {
    setShowExportModal(false)
    const sourceAttrs = bookMeta.attributes || []
    const targetMeta = recordBooks.find((b) => b.id === targetBookId)
    if (!targetMeta) return
    const targetAttrs = targetMeta.attributes || []

    const same = JSON.stringify(sourceAttrs) === JSON.stringify(targetAttrs)
    if (!same) {
      setAlertType("warning")
      setAlertMessage("Target record book attributes do not match. Transfer aborted.")
      setShowAlert(true)
      return
    }

    setRecordBookData((prev) => {
      const copy = { ...prev }
      const targetArr = Array.isArray(copy[targetBookId]) ? [...copy[targetBookId]] : []
      const newRow = { ...exportRow, _id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}` }
      targetArr.push(newRow)
      copy[targetBookId] = targetArr
      return copy
    })

    setAlertType("success")
    setAlertMessage("Record transferred successfully")
    setShowAlert(true)
  }

  return (
    <div className="records-wrapper-mac">


      {/* Middle Section - Scrollable Content */}
      <div className="records-content-mac">
        {loadingPage ? (
          <div className="records-grid-mac">
            {Array.from({ length: Math.min(PAGE_SIZE, 6) }).map((_, sk) => (
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
          Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, totalRecords)} of {totalRecords}
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
                  .map((tb) => (
                    <div className="export-target-mac" key={tb.id} onClick={() => doExportTo(tb.id)}>
                      <div className="target-info-mac">
                        <div className="target-name-mac">{tb.name}</div>
                        <div className="target-attrs-mac">{tb.attributes.map(a => a.field_name).join(", ")}</div>
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
                  ))}
              </div>
            </div>
            <div className="modal-actions-mac">
              <button className="btn-mac btn-mac-secondary" onClick={() => setShowExportModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
