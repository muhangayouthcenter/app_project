import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Reports.css"

export default function ReportResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [metadata, setMetadata] = useState({})
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [dateRange, setDateRange] = useState({ from: "", to: "" })
  const [selectedCollections, setSelectedCollections] = useState([])
  useEffect(() => {
    if (location.state) {
      const { reports: stateReports, metadata: stateMetadata, selectedAttributes: stateAttrs, dateRange: stateDateRange, selectedCollections: stateCollections } = location.state
      setReports(stateReports || [])
      setMetadata(stateMetadata || {})
      setSelectedAttributes(stateAttrs || [])
      setDateRange(stateDateRange || { from: "", to: "" })
      setSelectedCollections(stateCollections || [])
    } else {
      // No state, redirect back to reports
      navigate('/dashboard/reports')
    }
  }, [location.state, navigate])

  const exportReport = () => {
    // Basic export functionality
    const dataStr = JSON.stringify({ reports, metadata, selectedAttributes, dateRange }, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `report_${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (reports.length === 0) {
    return (
      <div className="dashboard-main-content">
        <div className="page-header">
          <div className="header-content">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard/reports')}
              style={{ marginRight: '16px' }}
            >
              ← Back to Reports
            </button>
            <div>
              <h1 className="page-title">Report Results</h1>
              <p className="page-subtitle">No report data available</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-main-content">
      <div className="page-header">
        <div className="header-content">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard/reports')}
            style={{ marginRight: '16px' }}
          >
            ← Back to Reports
          </button>
        </div>
      </div>

    

      {/* Detailed Reports */}
      <div className="detailed-reports">
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Detailed Results</h3>

        {reports.map((report, index) => (
          <div key={index} className="report-detail-card" style={{
            background: 'white',
            border: '1px solid var(--report-border)',
            borderRadius: '8px',
            marginBottom: '16px',
            overflow: 'hidden'
          }}>
            <div
              className="report-header-bar"
              style={{
                padding: '16px',
                background: 'var(--report-secondary)',
                borderBottom: '1px solid var(--report-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600' }}>
                  {report.collection_name}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--report-text-secondary)' }}>
                  {report.total_records?.toLocaleString()} records •
                  {report.group_by_fields?.length > 0
                    ? ` ${report.group_by_fields.length} group field(s)`
                    : ' Simple count'
                  }
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`report-status ${report.error ? 'status-error' : 'status-success'}`} style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  background: report.error ? 'rgba(255, 59, 48, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                  color: report.error ? 'var(--report-error)' : 'var(--report-success)'
                }}>
                  {report.error ? 'Error' : 'Success'}
                </span>
              </div>
            </div>

            <div className="report-content" style={{ padding: '16px' }}>
                {report.error ? (
                  <div style={{ color: 'var(--report-error)', fontSize: '13px' }}>
                    <strong>Error:</strong> {report.message}
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="report-stats" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '12px',
                      marginBottom: '16px'
                    }}>
                      <div className="stat-item" style={{
                        background: 'var(--report-secondary)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--report-primary)' }}>
                          {report.total_records?.toLocaleString()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--report-text-secondary)' }}>
                          Total Records
                        </div>
                      </div>

                      {report.unique_groups_count && (
                        <div className="stat-item" style={{
                          background: 'var(--report-secondary)',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--report-primary)' }}>
                            {report.unique_groups_count}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--report-text-secondary)' }}>
                            Unique Groups
                          </div>
                        </div>
                      )}

                      {report.summary && (
                        <>
                          <div className="stat-item" style={{
                            background: 'var(--report-secondary)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--report-success)' }}>
                              {report.summary.largest_group}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--report-text-secondary)' }}>
                              Largest Group
                            </div>
                          </div>

                          <div className="stat-item" style={{
                            background: 'var(--report-secondary)',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--report-text)' }}>
                              {report.summary.average_per_group}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--report-text-secondary)' }}>
                              Avg per Group
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Groups Data */}
                    {report.groups && report.groups.length > 0 && (
                      <div className="groups-section">
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                          Group Breakdown
                        </h5>
                        <div className="groups-table" style={{
                          border: '1px solid var(--report-border)',
                          borderRadius: '6px',
                          overflow: 'hidden'
                        }}>
                          <div className="table-header" style={{
                            background: 'var(--report-secondary)',
                            padding: '8px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--report-text-secondary)',
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr 1fr',
                            gap: '12px'
                          }}>
                            <div>Group</div>
                            <div>Count</div>
                            <div>Percentage</div>
                          </div>
                          <div className="table-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {report.groups.map((group, groupIndex) => (
                              <div
                                key={groupIndex}
                                className="table-row"
                                style={{
                                  padding: '8px 12px',
                                  borderBottom: groupIndex < report.groups.length - 1 ? '1px solid var(--report-border)' : 'none',
                                  display: 'grid',
                                  gridTemplateColumns: '2fr 1fr 1fr',
                                  gap: '12px',
                                  fontSize: '13px',
                                  alignItems: 'center'
                                }}
                              >
                                <div style={{ fontWeight: '500' }}>
                                  {typeof group.key === 'object'
                                    ? Object.entries(group.key).map(([k, v]) => `${k}: ${v}`).join(', ')
                                    : group.key
                                  }
                                  {group.field_values && (
                                    <div style={{ fontSize: '11px', color: 'var(--report-text-secondary)', marginTop: '2px' }}>
                                      {Object.entries(group.field_values).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </div>
                                  )}
                                </div>
                                <div>{group.count.toLocaleString()}</div>
                                <div>{group.percentage}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date Distribution */}
                    {report.date_distribution && report.date_distribution.length > 0 && (
                      <div className="date-distribution" style={{ marginTop: '16px' }}>
                        <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
                          Date Distribution (Last 7 Days)
                        </h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {report.date_distribution.map((day, dayIndex) => (
                            <div
                              key={dayIndex}
                              style={{
                                background: 'var(--report-secondary)',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                fontSize: '12px'
                              }}
                            >
                              <div style={{ fontWeight: '500' }}>{day.date}</div>
                              <div style={{ color: 'var(--report-text-secondary)' }}>{day.count} records</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    {report.message && (
                      <div className="report-message" style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: 'rgba(255, 149, 0, 0.05)',
                        border: '1px solid rgba(255, 149, 0, 0.1)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'var(--report-text-secondary)'
                      }}>
                        <strong>Note:</strong> {report.message}
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}