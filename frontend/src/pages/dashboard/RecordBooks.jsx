"use client"

import { useState } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import "./RecordBooks.css"
import FetchData from "../../api/api"


export default function RecordBooks() {
  const {
    recordBooks = [],
    setRecordBooks,
    recordBookData = {},
    setRecordBookData,
    setAlertType,
    setAlertMessage,
    setShowAlert,
    setShowLoader,
    setLoaderMessage,
    authToken,
    myEmail,
  } = useOutletContext()

  const navigate = useNavigate()

  const [editingBook, setEditingBook] = useState(null)
  const [deletingBook, setDeletingBook] = useState(null)
  const [creatingBook, setCreatingBook] = useState(false)
  const [newBookName, setNewBookName] = useState("")
  const [newBookType, setNewBookType] = useState("dailyrecord")
  const [rawOptionInputs, setRawOptionInputs] = useState({}) // Store raw input values
  const [newBookFields, setNewBookFields] = useState([
    {
      field_name: "",
      input_type: "text",
      required: false,
      unique: false,
      data_if_isselect: []
    }
  ])
  const inputTypes = ["text", "email", "password", "number", "date", "textarea", "checkbox", "radio", "select"]

  function showAlert(type, message) {
    if (setAlertType) setAlertType(type)
    if (setAlertMessage) setAlertMessage(message)
    if (setShowAlert) setShowAlert(true)
  }

  const addField = () => {
    setNewBookFields([...newBookFields, { field_name: "", input_type: "text", required: false, unique: false, data_if_isselect: [] }])
  }

  const removeField = (index) => {
    if (newBookFields.length === 1) {
      showAlert("warning", "At least one field is required")
      return
    }
    setNewBookFields(newBookFields.filter((_, i) => i !== index))
  }

  const updateField = (index, key, value) => {
    setNewBookFields(newBookFields.map((f, i) => i === index ? { ...f, [key]: value } : f))
  }

  const updateSelectData = (index, value) => {
    // Store raw input
    setRawOptionInputs(prev => ({ ...prev, [index]: value }))

    // Parse options
    const options = value
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt)

    setNewBookFields(newBookFields.map((f, i) => (i === index ? { ...f, data_if_isselect: options } : f)))
  }

  const getRawOptionInput = (index) => {
    return rawOptionInputs[index] !== undefined ? rawOptionInputs[index] : ""
  }

  const openRecordBook = (id) => {
    navigate(`/dashboard/recordbook/${id}`)
  }

  const handleCreateBook = async () => {
    if (!newBookName.trim()) {
      showAlert("error", "RecordBook name is required")
      return
    }
    if (newBookFields.some(f => !f.field_name.trim())) {
      showAlert("error", "All field names are required")
      return
    }
    try {
      setLoaderMessage("Creating recordbook...")
      setShowLoader(true)

      const payload = {
        collection_name: newBookName.trim(),
        type: newBookType,
        fields: newBookFields.filter(f => f.field_name.trim()),
      }

      const response = await FetchData("recordbook", "POST", payload, authToken, myEmail)
      if (response.status) {
        const newBook = {
          id: response.inserted_id || Date.now().toString(),
          name: payload.collection_name,
          attributes: payload.fields,
          total: 0,
          type: newBookType,
        }
        setRecordBooks([...recordBooks, newBook])
        setRecordBookData({ ...recordBookData, [newBook.id]: [] })
        showAlert("success", response.message || "RecordBook created successfully")
      } else {
        showAlert(response.type || "warning", response.message || "Failed to create RecordBook")
      }
    } catch (error) {
      console.error("Create recordbook error", error)
      showAlert("error", error.message || "Failed to create RecordBook")
    } finally {
      setShowLoader(false)
      setCreatingBook(false)
      setNewBookName("")
      setNewBookType("dailyrecord")
      setNewBookFields([
        {
          field_name: "",
          input_type: "text",
          required: false,
          unique: false,
          data_if_isselect: []
        }
      ])
      setRawOptionInputs({})
    }
  }

  const handleRenameBook = async () => {
    if (!editingBook?.name.trim()) {
      showAlert("error", "Please enter a valid name")
      return
    }
    try {
      setLoaderMessage("Renaming record book...")
      setShowLoader(true)
      const oldName = editingBook.originalName || editingBook.name
      const response = await FetchData(
        `recordbook/meta/${oldName}`,
        "PUT",
        { new_collection_name: editingBook.name.trim() },
        authToken,
        myEmail,
      )
      if (response.status) {
        const updated = response.recordbook || {}
        setRecordBooks((prev) =>
          prev.map((rb) =>
            rb.id === editingBook.id
              ? { ...rb, name: updated.collection_name || editingBook.name.trim() }
              : rb,
          ),
        )
        showAlert("success", response.message || "Record book renamed successfully")
      } else {
        showAlert(response.type || "warning", response.message || "Failed to rename record book")
      }
    } catch (error) {
      console.error("Rename recordbook error", error)
      showAlert("error", error.message || "Failed to rename record book")
    } finally {
      setShowLoader(false)
      setEditingBook(null)
    }
  }

  const handleDeleteBook = async () => {
    if (!deletingBook) return
    try {
      const target = recordBooks.find((rb) => rb.id === deletingBook)
      if (!target) return
      setLoaderMessage("Deleting record book...")
      setDeletingBook(null);
      setShowLoader(true)
      const response = await FetchData(`recordbook/${target.name}`, "DELETE", null, authToken, myEmail)
      if (response.status) {
        setRecordBooks((prev) => prev.filter((rb) => rb.id !== deletingBook))
        setRecordBookData((prev) => {
          const copy = { ...prev }
          delete copy[deletingBook]
          return copy
        })
        showAlert("success", response.message || "Record book deleted successfully")
      } else {
        showAlert(response.type || "warning", response.message || "Failed to delete record book")
      }
    } catch (error) {
      console.error("Delete recordbook error", error)
      showAlert("error", error.message || "Failed to delete record book")
    } finally {
      setShowLoader(false)
      setDeletingBook(null)
    }
  }

  
  return (
    <div className="record-books-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Record Books</h1>
          <p className="page-subtitle">Manage all your record books in one place</p>
        </div>
        <button className="btn btn-primary btn-create" onClick={() => setCreatingBook(true)} title="Create New Record Book">
          <svg className="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                      {book.total || 0} records • {(book.attributes || []).length} attributes • {book.type || 'dailyrecord'}
                    </p>
                  </div>
                </div>

                <div className="book-actions">
                  <button
                    className="action-btn"
                  onClick={() => setEditingBook({ id: book.id, name: book.name, originalName: book.name })}
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
                <h2 className="modal-title">Create New RecordBook</h2>
                <p className="modal-subtitle">Define a new collection with custom fields</p>
              </div>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); handleCreateBook(); }}>
                <div className="form-section-mac">
                  <h3 className="section-title-mac">Basic Information</h3>
                  <div className="form-grid-mac">
                    <div className="form-group-mac">
                      <label>RecordBook Name *</label>
                      <input type="text" value={newBookName} onChange={(e) => setNewBookName(e.target.value)} placeholder="e.g., Customers, Inventory" required autoFocus />
                    </div>
                    <div className="form-group-mac">
                      <label>Record Type</label>
                      <select value={newBookType} onChange={(e) => setNewBookType(e.target.value)}>
                        <option value="dailyrecord">Daily Record</option>
                        <option value="onetimeentry">One-time Entry</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="form-section-mac">
                  <h3 className="section-title-mac">Fields Definition</h3>
                  <div className="fields-list-mac">
                    {newBookFields.map((field, index) => (
                      <div key={index} className="field-card-mac">
                        <div className="field-header-mac">
                          <h4>Field {index + 1}</h4>
                          <button type="button" className="btn-icon-mac" onClick={() => removeField(index)} title="Remove Field">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                          </button>
                        </div>
                        <div className="field-grid-mac">
                          <div className="form-group-mac">
                            <label>Field Name *</label>
                            <input type="text" value={field.field_name} onChange={(e) => updateField(index, "field_name", e.target.value)} placeholder="e.g., name, email" required />
                          </div>
                          <div className="form-group-mac">
                            <label>Input Type</label>
                            <select value={field.input_type} onChange={(e) => updateField(index, "input_type", e.target.value)}>
                              {inputTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                          </div>
                          <div className="form-group-mac checkbox-group-mac">
                            <label className="checkbox-mac">
                              <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, "required", e.target.checked)} />
                              Required
                            </label>
                            <label className="checkbox-mac">
                              <input type="checkbox" checked={field.unique} onChange={(e) => updateField(index, "unique", e.target.checked)} />
                              Unique
                            </label>
                          </div>
                        </div>
                        {(field.input_type === "select" || field.input_type === "radio") && (
                          <div className="form-group-mac">
                            <label>Options (comma-separated)</label>
                            <input
                              type="text"
                              value={getRawOptionInput(index)}
                              onChange={(e) => {
                                const value = e.target.value
                                setRawOptionInputs(prev => ({ ...prev, [index]: value }))
                              }}
                              onBlur={(e) => updateSelectData(index, e.target.value)}
                              placeholder="Option 1, Option 2, Option 3"
                              style={{ marginBottom: field.data_if_isselect.length > 0 ? '8px' : '0' }}
                            />
                            {field.data_if_isselect.length > 0 && (
                              <div style={{
                                background: '#f8f9fa',
                                border: '1px solid #e9ecef',
                                borderRadius: '6px',
                                padding: '8px',
                                fontSize: '12px',
                                color: '#6c757d'
                              }}>
                                <div style={{ fontWeight: '500', marginBottom: '4px', color: '#495057' }}>
                                  Parsed Options ({field.data_if_isselect.length}):
                                </div>
                                <div style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '6px'
                                }}>
                                  {field.data_if_isselect.map((option, optIndex) => (
                                    <span
                                      key={optIndex}
                                      style={{
                                        background: 'white',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '4px',
                                        padding: '2px 6px',
                                        fontSize: '11px',
                                        color: '#495057',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      {option}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newOptions = field.data_if_isselect.filter((_, i) => i !== optIndex);
                                          setNewBookFields(newBookFields.map((f, i) => i === index ? { ...f, data_if_isselect: newOptions } : f));
                                        }}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#dc3545',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          padding: '0',
                                          width: '12px',
                                          height: '12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          borderRadius: '50%',
                                          marginLeft: '2px'
                                        }}
                                        title="Remove option"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div style={{
                                  marginTop: '6px',
                                  fontSize: '10px',
                                  color: '#868e96',
                                  fontStyle: 'italic'
                                }}>
                                  💡 Type options separated by commas above, or click × to remove individual options
                                </div>
                              </div>
                            )}
                            {field.data_if_isselect.length === 0 && (
                              <div style={{
                                marginTop: '4px',
                                fontSize: '11px',
                                color: '#868e96',
                                fontStyle: 'italic'
                              }}>
                                💡 Enter multiple options separated by commas (e.g., "Small, Medium, Large")
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn-mac btn-mac-secondary-mac" onClick={addField}>Add Field</button>
                </div>
                <div className="modal-actions-mac">
                  <button type="button" className="btn-mac btn-mac-secondary-mac" onClick={() => setCreatingBook(false)}>Cancel</button>
                  <button type="submit" className="btn-mac btn-mac-primary-mac">Create RecordBook</button>
                </div>
              </form>
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
                <h2 className="modal-title-mac">Delete Record Book</h2>
                <p className="modal-subtitle-mac">This action cannot be undone</p>
              </div>
            </div>
            <div className="modal-body-mac">
              <p className="warning-text-mac">
                Are you sure you want to delete this record book? All records and data associated with it will be
                permanently removed.
              </p>
            </div>
            <div className="modal-actions-mac">
              <button className="btn-mac btn-mac-secondary-mac" onClick={() => setDeletingBook(null)}>
                Cancel
              </button>
              <button className="btn-mac btn-mac-danger-mac" onClick={handleDeleteBook}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
