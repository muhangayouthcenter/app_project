import { useState } from "react"
import { useNavigate, useOutletContext } from "react-router-dom"
import FetchData from "../../api/api"
import "./RecordBooks.css"

const backIcon = (
  <svg className="btn-icon-mac" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const bookIcon = (
  <svg className="btn-icon-mac" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const plusIcon = (
  <svg className="btn-icon-mac" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const trashIcon = (
  <svg className="btn-icon-mac" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const saveIcon = (
  <svg className="btn-icon-mac" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l4 4v12a2 2 0 0 1-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 3v6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function CreateRecordBook() {
  const { setAlertType, setAlertMessage, setShowAlert, setShowLoader, setLoaderMessage, authToken, myEmail, setRecordBooks } =
    useOutletContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    collection_name: "",
    type: "dailyrecord",
    fields: [
      {
        field_name: "",
        input_type: "text",
        required: false,
        unique: false,
        data_if_isselect: [],
      },
    ],
  })

  const inputTypes = ["text", "email", "password", "number", "date", "textarea", "checkbox", "radio", "select"]

  const addField = () => {
    setFormData((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { field_name: "", input_type: "text", required: false, unique: false, data_if_isselect: [] },
      ],
    }))
  }

  const removeField = (index) => {
    if (formData.fields.length === 1) {
      setAlertType("warning")
      setAlertMessage("At least one field is required")
      setShowAlert(true)
      return
    }
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }))
  }

  const updateField = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }))
  }

  const updateSelectData = (index, value) => {
    const options = value
      .split(",")
      .map((opt) => opt.trim())
      .filter((opt) => opt)
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f, i) => (i === index ? { ...f, data_if_isselect: options } : f)),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.collection_name.trim()) {
      setAlertType("warning")
      setAlertMessage("RecordBook name is required")
      setShowAlert(true)
      return
    }
    if (formData.fields.some((field) => !field.field_name.trim())) {
      setAlertType("warning")
      setAlertMessage("All field names are required")
      setShowAlert(true)
      return
    }
    try {
      setLoading(true)
      setLoaderMessage("Creating recordbook...")
      setShowLoader(true)
      const response = await FetchData("recordbook", "POST", formData, authToken, myEmail)
      if (response.status) {
        setAlertType("success")
        setAlertMessage(response.message || "RecordBook created successfully")
        setShowAlert(true)
        setRecordBooks?.((prev) => [
          ...prev,
          {
            id: response.inserted_id || formData.collection_name,
            name: formData.collection_name,
            attributes: formData.fields,
            total: 0,
            type: formData.type,
          },
        ])
        navigate("/dashboard/recordbooks")
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(response.message || "Failed to create RecordBook")
        setShowAlert(true)
      }
    } catch (error) {
      setAlertType("error")
      setAlertMessage(error.message || "Failed to create RecordBook")
      setShowAlert(true)
    } finally {
      setLoading(false)
      setShowLoader(false)
    }
  }

  return (
    <div className="record-books-page-mac">
      <div className="page-header-mac">
        <div className="header-content-mac" style={{ gap: 10, alignItems: "center" }}>
          <button className="btn-mac btn-mac-secondary-mac" onClick={() => navigate("/dashboard/recordbooks")}>
            {backIcon}
          </button>
          <div>
            <h1 className="page-title-mac">Create RecordBook</h1>
            <p className="page-subtitle-mac">Define a new collection with custom fields</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card-mac">
          <div className="card-header-mac">
            {bookIcon}
            <div>
              <h2 className="card-title-mac">Basic Information</h2>
              <p className="card-subtitle-mac">Name and type</p>
            </div>
          </div>
          <div className="grid-two-mac">
            <div className="form-group-mac">
              <label>RecordBook Name *</label>
              <input
                type="text"
                value={formData.collection_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, collection_name: e.target.value }))}
                placeholder="e.g., Customers, Inventory"
                required
              />
            </div>
            <div className="form-group-mac">
              <label>Record Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              >
                <option value="dailyrecord">Daily Record</option>
                <option value="onetimeentry">One-time Entry</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card-mac">
          <div className="card-header-mac">
            {plusIcon}
            <div>
              <h2 className="card-title-mac">Fields Definition</h2>
              <p className="card-subtitle-mac">Add attributes and input types</p>
            </div>
            <button type="button" className="btn-mac btn-mac-primary-mac" onClick={addField}>
              {plusIcon} Add Field
            </button>
          </div>

          <div className="field-list-mac">
            {formData.fields.map((field, index) => (
              <div key={index} className="field-card-mac">
                <div className="field-card-head-mac">
                  <h3>Field {index + 1}</h3>
                  <button type="button" className="btn-icon-only-mac" onClick={() => removeField(index)}>
                    {trashIcon}
                  </button>
                </div>
                <div className="grid-three-mac">
                  <div className="form-group-mac">
                    <label>Field Name *</label>
                    <input
                      type="text"
                      value={field.field_name}
                      onChange={(e) => updateField(index, "field_name", e.target.value)}
                      placeholder="e.g., name, email"
                      required
                    />
                  </div>
                  <div className="form-group-mac">
                    <label>Input Type</label>
                    <select
                      value={field.input_type}
                      onChange={(e) => updateField(index, "input_type", e.target.value)}
                    >
                      {inputTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-mac checkbox-row-mac">
                    <label className="checkbox-inline-mac">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, "required", e.target.checked)}
                      />
                      Required
                    </label>
                    <label className="checkbox-inline-mac">
                      <input
                        type="checkbox"
                        checked={field.unique}
                        onChange={(e) => updateField(index, "unique", e.target.checked)}
                      />
                      Unique
                    </label>
                  </div>
                </div>

                {(field.input_type === "select" || field.input_type === "radio") && (
                  <div className="form-group-mac">
                    <label>Options (comma-separated)</label>
                    <input
                      type="text"
                      value={field.data_if_isselect.join(", ")}
                      onChange={(e) => updateSelectData(index, e.target.value)}
                      placeholder="Option 1, Option 2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="action-row-mac">
          <button type="button" className="btn-mac btn-mac-secondary-mac" onClick={() => navigate("/dashboard/recordbooks")}>
            Cancel
          </button>
          <button type="submit" className="btn-mac btn-mac-primary-mac" disabled={loading}>
            {loading ? "Creating..." : <>{saveIcon} Create RecordBook</>}
          </button>
        </div>
      </form>
    </div>
  )
}


