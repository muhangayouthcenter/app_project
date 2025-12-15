"use client"

import { useState } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import "./RecordBooks.css"

export default function RecordBooks() {
  const {
    recordBooks = [],
    setRecordBooks,
    recordBookData = {},
    setRecordBookData,
    setAlertType,
    setAlertMessage,
    setShowAlert,
  } = useOutletContext()

  const navigate = useNavigate()

  const [editingBook, setEditingBook] = useState(null)
  const [deletingBook, setDeletingBook] = useState(null)
  const [attributesBook, setAttributesBook] = useState(null)
  const [creatingBook, setCreatingBook] = useState(false)
  const [newBookName, setNewBookName] = useState("")

  function showAlert(type, message) {
    if (setAlertType) setAlertType(type)
    if (setAlertMessage) setAlertMessage(message)
    if (setShowAlert) setShowAlert(true)
  }

  const openRecordBook = (id) => {
    navigate(`/dashboard/recordbook/${id}`)
  }

  const handleCreateBook = () => {
    if (!newBookName.trim()) {
      showAlert("error", "Please enter a record book name")
      return
    }
    const newBook = {
      id: Date.now().toString(),
      name: newBookName.trim(),
      attributes: [],
      total: 0,
    }
    setRecordBooks([...recordBooks, newBook])
    setRecordBookData({ ...recordBookData, [newBook.id]: [] })
    showAlert("success", "Record book created successfully")
    setCreatingBook(false)
    setNewBookName("")
  }

  const handleRenameBook = () => {
    if (!editingBook?.name.trim()) {
      showAlert("error", "Please enter a valid name")
      return
    }
    setRecordBooks((prev) =>
      prev.map((rb) => (rb.id === editingBook.id ? { ...rb, name: editingBook.name.trim() } : rb)),
    )
    showAlert("success", "Record book renamed successfully")
    setEditingBook(null)
  }

  const handleDeleteBook = () => {
    if (!deletingBook) return
    setRecordBooks((prev) => prev.filter((rb) => rb.id !== deletingBook))
    setRecordBookData((prev) => {
      const copy = { ...prev }
      delete copy[deletingBook]
      return copy
    })
    showAlert("success", "Record book deleted successfully")
    setDeletingBook(null)
  }

  const handleSaveAttributes = () => {
    if (!attributesBook) return
    const { id, attributes } = attributesBook
    setRecordBooks((prev) => prev.map((rb) => (rb.id === id ? { ...rb, attributes } : rb)))
    showAlert("success", "Attributes updated successfully")
    setAttributesBook(null)
  }

  const handleAddAttribute = (key) => {
    if (!key.trim()) return
    setAttributesBook((prev) => ({
      ...prev,
      attributes: [...prev.attributes, {
        field_name: key.trim(),
        input_type: 'text',
        required: false,
        unique: false,
        data_if_isselect: []
      }],
    }))
  }

  const handleDeleteAttribute = (index) => {
    setAttributesBook((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="record-books-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Record Books</h1>
          <p className="page-subtitle">Manage all your record books in one place</p>
        </div>
        <button
          className="btn btn-primary btn-create"
          onClick={() => setCreatingBook(true)}
          title="Create New Record Book"
        >
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 9v6M9 12h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          New Record Book
        </button>
      </div>

      <div className="books-container">
        {recordBooks.length === 0 ? (
          <div className="empty-state">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="empty-text">No record books yet</p>
            <p className="empty-subtext">Create your first record book to get started</p>
          </div>
        ) : (
          <div className="books-list">
            {recordBooks.map((book) => (
              <div key={book.id} className="book-card">
                <div className="book-main" onClick={() => openRecordBook(book.id)} title={book.name}>
                  <div className="book-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="book-info">
                    <h3 className="book-name" title={book.name}>
                      {book.name}
                    </h3>
                    <p className="book-meta">
                      {book.total || 0} records • {(book.attributes || []).length} attributes
                    </p>
                  </div>
                </div>

                <div className="book-actions">
                  <button
                    className="action-btn"
                    onClick={() => setEditingBook({ id: book.id, name: book.name })}
                    title="Rename"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="action-label">Rename</span>
                  </button>

                  <button
                    className="action-btn"
                    onClick={() =>
                      setAttributesBook({ id: book.id, name: book.name, attributes: [...(book.attributes || [])] })
                    }
                    title="Manage Attributes"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="action-label">Attributes</span>
                  </button>

                  <button
                    className="action-btn action-btn-danger"
                    onClick={() => setDeletingBook(book.id)}
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <line
                        x1="10"
                        y1="11"
                        x2="10"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1="14"
                        y1="11"
                        x2="14"
                        y2="17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="action-label">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Book Modal */}
      {creatingBook && (
        <div className="modal-overlay" onClick={() => setCreatingBook(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon modal-icon-primary">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9v6M9 12h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="modal-title">Create New Record Book</h2>
                <p className="modal-subtitle">Enter a name for your new record book</p>
              </div>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="modal-input"
                placeholder="e.g. Student Attendance"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCreateBook()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCreatingBook(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateBook}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {editingBook && (
        <div className="modal-overlay" onClick={() => setEditingBook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon modal-icon-primary">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="modal-title">Rename Record Book</h2>
                <p className="modal-subtitle">Update the name of your record book</p>
              </div>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="modal-input"
                value={editingBook.name}
                onChange={(e) => setEditingBook({ ...editingBook, name: e.target.value })}
                onKeyPress={(e) => e.key === "Enter" && handleRenameBook()}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingBook(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRenameBook}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <div className="modal-overlay" onClick={() => setDeletingBook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon modal-icon-danger">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h2 className="modal-title">Delete Record Book</h2>
                <p className="modal-subtitle">This action cannot be undone</p>
              </div>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                Are you sure you want to delete this record book? All records and data associated with it will be
                permanently removed.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeletingBook(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteBook}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attributes Management Modal */}
      {attributesBook && (
        <div className="modal-overlay" onClick={() => setAttributesBook(null)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon modal-icon-primary">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="modal-title">Manage Attributes</h2>
                <p className="modal-subtitle">{attributesBook.name}</p>
              </div>
            </div>
            <div className="modal-body">
              {attributesBook.attributes.length === 0 ? (
                <div className="empty-attributes">
                  <svg className="empty-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p className="empty-attr-text">No attributes defined yet</p>
                  <p className="empty-attr-subtext">Add attributes below to structure your records</p>
                </div>
              ) : (
                <div className="attributes-list">
                  {attributesBook.attributes.map((attr, index) => (
                    <div key={index} className="attribute-item">
                      <div className="attribute-number">{index + 1}</div>
                      <div className="attribute-name">{attr.field_name}</div>
                      <button
                        className="attribute-delete"
                        onClick={() => handleDeleteAttribute(index)}
                        title="Delete Attribute"
                      >
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M18 6L6 18M6 6l12 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="add-attribute-section">
                <input
                  type="text"
                  className="modal-input"
                  placeholder="Enter attribute name (e.g., studentId, name, date)"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddAttribute(e.target.value)
                      e.target.value = ""
                    }
                  }}
                />
                <button
                  className="btn btn-secondary btn-add-attr"
                  onClick={(e) => {
                    const input = e.target.previousElementSibling
                    handleAddAttribute(input.value)
                    input.value = ""
                  }}
                >
                  <svg className="btn-icon-small" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add Attribute
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setAttributesBook(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveAttributes}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
