import { useEffect, useState } from "react"
import { useOutletContext } from "react-router-dom"
import FetchData from "../../api/api"
import "./dashboard.css"

export default function Emails() {
  const {
    setAlertType,
    setAlertMessage,
    setShowAlert,
    setShowLoader,
    setLoaderMessage,
    authToken,
    myEmail,
  } = useOutletContext()

  const [emails, setEmails] = useState([])
  const [newEmail, setNewEmail] = useState("")
  const [editing, setEditing] = useState(null)
  const [loadingList, setLoadingList] = useState(false)

  const loadEmails = async () => {
    if (!authToken) return
    try {
      setLoadingList(true)
      const response = await FetchData("admin/emails/list", "GET", null, authToken, myEmail)
      if (response.status) {
        setEmails(response.emails || [])
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(response.message || "Failed to load emails")
        setShowAlert(true)
      }
    } catch (error) {
      console.error("Load emails error", error)
      setAlertType("error")
      setAlertMessage(error.message || "Failed to load emails")
      setShowAlert(true)
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadEmails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, myEmail])

  const addEmail = async () => {
    if (!newEmail.trim()) {
      setAlertType("warning")
      setAlertMessage("Enter email")
      setShowAlert(true)
      return
    }
    try {
      setLoaderMessage("Adding email...")
      setShowLoader(true)
      const response = await FetchData("admin/emails/add", "POST", { email: newEmail.trim() }, authToken, myEmail)
      if (response.status) {
        setNewEmail("")
        await loadEmails()
        setAlertType("success")
        setAlertMessage(response.message)
        setShowAlert(true)
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(response.message)
        setShowAlert(true)
      }
    } catch (error) {
      setAlertType("error")
      setAlertMessage(error.message || "Failed to add email")
      setShowAlert(true)
    } finally {
      setShowLoader(false)
    }
  }

  const updateEmail = async () => {
    if (!editing || !editing.email || !newEmail.trim()) return
    try {
      setLoaderMessage("Updating email...")
      setShowLoader(true)
      const response = await FetchData(
        "admin/emails/update",
        "PUT",
        { email_id: editing._id || editing.email, new_email: newEmail.trim() },
        authToken,
        myEmail
      )
      if (response.status) {
        setEditing(null)
        setNewEmail("")
        await loadEmails()
        setAlertType("success")
        setAlertMessage(response.message)
        setShowAlert(true)
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(response.message)
        setShowAlert(true)
      }
    } catch (error) {
      setAlertType("error")
      setAlertMessage(error.message || "Failed to update email")
      setShowAlert(true)
    } finally {
      setShowLoader(false)
    }
  }

  const deleteEmail = async (email) => {
    try {
      setLoaderMessage("Deleting email...")
      setShowLoader(true)
      const response = await FetchData("admin/emails/delete", "DELETE", { email }, authToken, myEmail)
      if (response.status) {
        await loadEmails()
        setAlertType("success")
        setAlertMessage(response.message)
        setShowAlert(true)
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(response.message)
        setShowAlert(true)
      }
    } catch (error) {
      setAlertType("error")
      setAlertMessage(error.message || "Failed to delete email")
      setShowAlert(true)
    } finally {
      setShowLoader(false)
    }
  }

  const sendCredentials = async () => {
    try {
      setLoaderMessage("Sending credentials...")
      setShowLoader(true)
      const response = await FetchData("admin/emails/send-credentials", "POST", {}, authToken, myEmail)
      setAlertType(response.status ? "success" : response.type || "warning")
      setAlertMessage(response.message || (response.status ? "Credentials sent" : "Failed to send"))
      setShowAlert(true)
    } catch (error) {
      setAlertType("error")
      setAlertMessage(error.message || "Failed to send credentials")
      setShowAlert(true)
    } finally {
      setShowLoader(false)
    }
  }

  return (
    <div className="dashboard-main-content">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Email Linkage</h1>
          <p className="page-subtitle">Manage admin notification emails</p>
        </div>
        <button className="btn btn-primary" onClick={sendCredentials}>Send Credentials</button>
      </div>

      <div className="report-panel">
        <h3>{editing ? "Update Email" : "Add Email"}</h3>
        <div className="form-row">
          <input
            type="email"
            value={newEmail}
            placeholder="admin@example.com"
            onChange={(e) => setNewEmail(e.target.value)}
            className="wide-input"
          />
          <button className="btn btn-primary" onClick={editing ? updateEmail : addEmail}>
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button className="btn btn-secondary" onClick={() => { setEditing(null); setNewEmail(""); }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="report-results">
        {loadingList ? (
          <p>Loading emails...</p>
        ) : emails.length === 0 ? (
          <div className="empty-state">
            <p className="empty-text">No emails yet</p>
            <p className="empty-subtext">Add your first admin email</p>
          </div>
        ) : (
          <div className="report-table">
            <div className="report-row report-head">
              <div>Email</div>
              <div style={{ textAlign: "right" }}>Actions</div>
            </div>
            {emails.map((em) => (
              <div className="report-row" key={em._id || em.email}>
                <div>{em.email}</div>
                <div className="actions" style={{ textAlign: "right" }}>
                  <button className="btn btn-secondary" onClick={() => { setEditing(em); setNewEmail(em.email); }}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteEmail(em.email)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


