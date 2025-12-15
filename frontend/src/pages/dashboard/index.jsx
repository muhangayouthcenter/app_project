"use client"

import { useEffect, useState, useRef, use } from "react"
import { Link, Outlet, useNavigate, useOutletContext, useLocation } from "react-router-dom"
import PermissionModal from "../../components/permission-modal/PermissionModal.jsx"
import api from "../../api/api.js"
import "./dashboard.css"

export default function Dashboard() {
  const {
    authToken,
    myEmail,
    setMyEmail,
    showAlert,
    setAlertType,
    setAlertMessage,
    setShowAlert,
    setShowLoader,
    setLoaderMessage,
    recordBooks,
    recordBookData,
    setRecordBookData,
    setRecordBooks,
    setAuthToken,
    sideBarLinksAndSvgIcons,
    activeSidebarLink,
    setActiveSidebarLink,
  } = useOutletContext()
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [isCheckingPermission, setIsCheckingPermission] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftStart, setScrollLeftStart] = useState(0)
  const recordBooksRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const pathParts = location.pathname.split('/')
  const currentId = pathParts[pathParts.length - 1]
  const activeIndex = recordBooks ? recordBooks.findIndex(rb => rb.id == currentId) : -1

  useEffect(() => {
    setActiveSidebarLink(location.pathname)
  }, [location.pathname, setActiveSidebarLink])

  useEffect(() => {
    if (activeIndex >= 0 && recordBooksRef.current) {
      const itemWidth = 176 // 160 + 16 gap
      recordBooksRef.current.scrollTo({
        left: activeIndex * itemWidth,
        behavior: 'smooth'
      })
    }

    
  }, [activeIndex])

  useEffect(() => {
    console.log("MyEmail:", myEmail)
    if (!myEmail) {
      setShowPermissionModal(true)
    }
  }, [authToken, myEmail])

  useEffect(() => {
    if (recordBooks && recordBooks.length > 0) {
      navigate(`/dashboard/recordbook/${recordBooks[0].id}`)
    }
  }, [])

  const handlePermissionRequest = async (email, emailError) => {
    try {
      if (showAlert) return

      if (emailError) {
        setAlertType("warning")
        setAlertMessage("Please enter a valid email address.")
        setShowAlert(true)
        return
      }
      setIsCheckingPermission(true)
      setLoaderMessage("Checking permissions...")
      setShowLoader(true)

      const response = await api(
        "admin/emails/check",
        "POST",
        {
          email,
        },
        authToken,
      )

      if (response.exists) {
        setMyEmail(email)
        setAlertType(response.type || "success")
        setAlertMessage(response.message || "Administrator access granted!")
        setShowAlert(true)
        setShowPermissionModal(false)
      } else {
        setAlertType(response.type || "warning")
        setAlertMessage(
          response.message ||
          "This email is not registered as an administrator. Please contact your system administrator.",
        )
        setShowAlert(true)
      }

      setShowLoader(false)
    } catch (error) {
      console.error("Permission check error:", error)
      setAlertType("error")
      setAlertMessage(error.message || "An error occurred while checking permissions")
      setShowAlert(true)
      setShowLoader(false)
    } finally {
      setIsCheckingPermission(false)
    }
  }

  const handlePermissionCancel = () => {
    setShowPermissionModal(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("myEmail")
    window.location.href = "/"
  }

  const scrollLeft = () => {
    if (recordBooksRef.current) {
      recordBooksRef.current.scrollBy({ left: -176, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (recordBooksRef.current) {
      recordBooksRef.current.scrollBy({ left: 176, behavior: 'smooth' })
    }
  }

  function stringToHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  function textToCustomGradient(text, angle = 90, stops = [0, 50, 100]) {
    if (!text || text.length === 0) {
      return `#e74c3c`;
    }

    const colors = [];
    for (let i = 0; i < 3; i++) {
      const hash = stringToHash(text + i);
      const color = `#${((hash >> 16) & 0xFF).toString(16).padStart(2, '0')}${((hash >> 8) & 0xFF).toString(16).padStart(2, '0')}${(hash & 0xFF).toString(16).padStart(2, '0')}`;
      colors.push(`${color} ${stops[i]}%`);
    }
    const color = `${colors[Math.floor(Math.random() * colors.length)].split(' ')[0]}`;
    return color;
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.clientX)
    setScrollLeftStart(recordBooksRef.current.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const delta = e.clientX - startX
    recordBooksRef.current.scrollLeft = scrollLeftStart - delta
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const isVisuallyExpanded = sidebarExpanded || isHovering

  return (
    <div className="dashboard-container">
      <PermissionModal
        show={showPermissionModal}
        onCancel={handlePermissionCancel}
        onRequest={handlePermissionRequest}
        isLoading={isCheckingPermission}
      />

      <div
        className={`dashboard-sidebar ${isVisuallyExpanded ? "expanded" : "collapsed"}`}
        onMouseEnter={() => !sidebarExpanded && setIsHovering(true)}
        onMouseLeave={() => !sidebarExpanded && setIsHovering(false)}
      >
        <div className="sidebar-header">
          <div className="sidebar-title">
            <span className="title-full">Muhanga Youth Center</span>
          </div>
        </div>

        <div className="sidebar-links">
          {sideBarLinksAndSvgIcons.map((link, index) => (
            <div className="sidebar-link-wrapper" key={index}>
              <Link
                to={link.path}
                className={`sidebar-link ${(activeSidebarLink === link.path) ||( activeSidebarLink.startsWith('/dashboard/recordbook/') && link.name === 'Home') ? "active" : ""}`}
                onClick={() => setActiveSidebarLink(link.path)}
              >
                <span className="sidebar-icon" dangerouslySetInnerHTML={{ __html: link.svgIcon }} />
                <span className="sidebar-text">{link.name}</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="logout-wrapper">
            <div className="sidebar-link logout-link" onClick={handleLogout} title="Logout">
              <span className="sidebar-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                  <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                </svg>
              </span>
              <span className="sidebar-text">Logout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="dashboard-input-header">
            <div className="search-container">
              <svg
                className="search-icon"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
              <input className="search-input" type="text" id="Search" name="search" placeholder={`Search from '${activeSidebarLink.split('/').pop()}' book`} />

              <button className="search-action" type="button" aria-label="View menu">
                <svg className="action-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10.83 5a3.001 3.001 0 0 0-5.66 0H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17ZM4 11h9.17a3.001 3.001 0 0 1 5.66 0H20a1 1 0 1 1 0 2h-1.17a3.001 3.001 0 0 1-5.66 0H4a1 1 0 1 1 0-2Zm1.17 6H4a1 1 0 1 0 0 2h1.17a3.001 3.001 0 0 0 5.66 0H20a1 1 0 1 0 0-2h-9.17a3.001 3.001 0 0 0-5.66 0Z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="record-books-container">
            <button className="scroll-button scroll-left" onClick={scrollLeft}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 0 .708-.708z" />
              </svg>
            </button>
            <div
              className="record-books"
              ref={recordBooksRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {(recordBooks || []).map((record, index) => {
                const to = `/dashboard/recordbook/${record.id}`
                const openRecord = () => {
                  navigate(to)
                }

                return (
                  <div onClick={openRecord} style={{
                    borderTop: `6px solid ${textToCustomGradient(record.name)}`
                  }} className={`record-book ${activeIndex === index ? 'active' : ''}`} key={record.id || index}>
                    <div className="record-book-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"
                        />
                      </svg>
                    </div>
                    <div className="record-book-content">
                      <div className="recordbook-name">{record.name}</div>
                      <div className="record-book-count">{record.total} records</div>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="scroll-button scroll-right" onClick={scrollRight}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 0-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 0 0-.708z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="dashboard-main-content">
          <Outlet
            context={{
              setAlertType,
              setAlertMessage,
              setShowAlert,
              setShowLoader,
              setLoaderMessage,
              authToken,
              myEmail,
              setMyEmail,
              recordBooks,
              recordBookData,
              setRecordBookData,
              setRecordBooks,
              setAuthToken,
            }}
          />
        </div>
      </div>
    </div>
  )
}
