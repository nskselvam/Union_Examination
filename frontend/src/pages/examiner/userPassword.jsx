import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Badge, Spinner, Form, Row, Col } from 'react-bootstrap'
import DataTable from 'react-data-table-component/dist/index.es.js'
import { useGetExaminerPasswordDetailsQuery,useSendExaminerPasswordMutation } from '../../redux-slice/examinerApiSlice'
import * as XLSX from 'xlsx'
import { toast } from 'react-toastify'

const UserPassword = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [sendingSMS, setSendingSMS] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
    const { data: apiData, isLoading, error ,refetch} = useGetExaminerPasswordDetailsQuery()
    const [sendExaminerPassword, { refetch: refetchSend }] = useSendExaminerPasswordMutation()

  // Fetch user data - replace with actual API call
  useEffect(() => {
    fetchUsers()
  }, [])

    useEffect(() => {
        if (apiData && apiData.data) {
            setData(apiData.data)
        }
    }, [apiData])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      await refetch()
      console.log('Data refreshed successfully')
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendAllSMS = () => {
    setSendingSMS(true)
    sendExaminerPassword(
      {
         Dep_Name: "01",
         Eva_Mon_Year: "Nov_2025"
      }
    )
      .unwrap()
      .then((response) => {
        toast.success('SMS sent to all users successfully!')
        refetch() // Refresh data after sending SMS
      })
      .catch((error) => {
        console.error('Error sending SMS:', error)
        toast.error('Failed to send SMS to all users.')
      })
      .finally(() => {
        setSendingSMS(false)
      })
    // if (window.confirm('Are you sure you want to send SMS to all users?')) {
    //   console.log('Sending SMS to all users')
    //   // TODO: Implement SMS sending API call
    //   alert('SMS sent to all users successfully!')
    // }
  }

  const handleExportToExcel = () => {
    // Get current date and time
    const now = new Date()
    const dateTime = now.toLocaleString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
    
    // Prepare data for export
    const exportData = data.map((row, index) => ({
      'S.No': index + 1,
      'Evaluation ID': row.Eva_Id,
      'Candidate Name': row.FACULTY_NAME,
      'Email ID': row.Email_Id,
      'Password': row.Temp_Password,
      'Mobile Number': row.Mobile_Number,
      'SMS Status': row.sms_status
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    // Add combined header with title and date/time in single column
    const headerText = `Password Details\n${dateTime}`
    XLSX.utils.sheet_add_aoa(ws, [[headerText]], { origin: 'A1' })
    
    // Merge cells for header across all columns
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } } // Merge A1 to G1
    ]
    
    // Style the header with text wrapping to show on multiple lines
    if (!ws['A1'].s) ws['A1'].s = {}
    ws['A1'].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      fill: { fgColor: { rgb: '4472C4' } }
    }

    // Set row height for header to accommodate two lines
    ws['!rows'] = [{ hpt: 35 }]

    // Add data starting from row 3
    const dataWithHeader = data.map((row, index) => ({
      'S.No': index + 1,
      'Evaluation ID': row.Eva_Id,
      'Candidate Name': row.FACULTY_NAME,
      'Email ID': row.Email_Id,
      'Password': row.Temp_Password,
      'Mobile Number': row.Mobile_Number,
      'SMS Status': row.sms_status
    }))
    
    XLSX.utils.sheet_add_json(ws, dataWithHeader, { origin: 'A2' })

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },  // S.No
      { wch: 15 }, // Evaluation ID
      { wch: 20 }, // Candidate Name
      { wch: 30 }, // Email ID
      { wch: 12 }, // Password
      { wch: 15 }, // Mobile Number
      { wch: 12 }  // SMS Status
    ]

    // Add page setup with header and footer
    ws['!pageSetup'] = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
    
    // Add print settings with header and footer
    ws['!margins'] = {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }

    // Note: XLSX library has limited support for headers/footers
    // For full print headers with page numbers, you may need to use a library like exceljs
    // Adding custom properties for header/footer
    if (!ws['!header']) ws['!header'] = {}
    ws['!header'] = '&C&"Arial,Bold"&16Password Details'
    
    if (!ws['!footer']) ws['!footer'] = {}
    ws['!footer'] = `&LPrinted: ${dateTime}&CPage &P of &N&R${dateTime}`

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Password Details')

    // Generate filename with current date
    const date = now.toISOString().split('T')[0]
    const filename = `Password_Details_${date}.xlsx`

    // Save file
    XLSX.writeFile(wb, filename)
  }

  const getSmsStatusBadge = (status) => {
    const statusColors = {
      'Sent': { bg: 'success', text: 'white' },
      'Pending': { bg: 'warning', text: 'dark' },
      'Failed': { bg: 'danger', text: 'white' }
    }
    return statusColors[status] || { bg: 'secondary', text: 'white' }
  }

  // Filter data based on search
  const filteredData = data?.filter(item => 
    item.Eva_Id?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.FACULTY_NAME?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.Email_Id?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.Mobile_Number?.includes(filterText)
  )

  const columns = [
    {
      name: 'S.No',
      cell: (row, index) => (currentPage - 1) * perPage + index + 1,
      sortable: false,
      width: '70px',
      center: true
    },
    {
      name: 'Evaluation ID',
      selector: row => row.Eva_Id,
      sortable: true,
      width: '130px'
    },
    {
      name: 'Candidate Name',
      selector: row => row.FACULTY_NAME,
      sortable: true,
      width: '180px',
      wrap: true
    },
    {
      name: 'Email ID',
      selector: row => row.Email_Id,
      sortable: true,
      width: '220px',
      wrap: true
    },
    {
      name: 'Password',
      selector: row => row.Temp_Password,
      sortable: true,
      width: '120px',
      center: true,
      cell: row => (
        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
          {row.Temp_Password}
        </span>
      )
    },
    {
      name: 'Mobile Number',
      selector: row => row.Mobile_Number,
      sortable: true,
      width: '140px',
      center: true
    },
    {
      name: 'SMS Status',
      selector: row => row.sms_status,
      sortable: true,
      width: '130px',
      center: true,
      cell: row => {
        const colors = getSmsStatusBadge(row.sms_status)
        return (
          <Badge 
            bg={colors.bg} 
            text={colors.text}
            style={{ fontSize: '12px', padding: '5px 10px' }}
          >
            {row.sms_status}
          </Badge>
        )
      }
    }
  ]

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#2c5282',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '14px',
        borderBottom: '2px solid #1a365d'
      }
    },
    headCells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRight: '1px solid #cbd5e0',
        '&:last-child': {
          borderRight: 'none'
        }
      }
    },
    rows: {
      style: {
        minHeight: '60px',
        borderBottom: '1px solid #e2e8f0',
        '&:hover': {
          backgroundColor: '#f7fafc',
          cursor: 'pointer'
        }
      }
    },
    cells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRight: '1px solid #e2e8f0',
        '&:last-child': {
          borderRight: 'none'
        }
      }
    }
  }

  return (
    <Container fluid className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: '#2c5282', fontWeight: '600', margin: 0 }}>
          Password Details
        </h3>
        <Button
          variant="success"
          size="lg"
          onClick={handleSendAllSMS}
          disabled={sendingSMS || loading}
        >
          {sendingSMS ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Sending SMS...
            </>
          ) : (
            <>
              <i className="bi bi-send-fill me-2"></i>
              SMS Send
            </>
          )}
        </Button>
      </div>
      <Card>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by Evaluation ID, Name, Email, or Mobile..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <Button
                  variant="info"
                  onClick={handleExportToExcel}
                  disabled={loading || data.length === 0}
                >
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  Export Excel
                </Button>
                <Button
                  variant="primary"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Refresh'}
                </Button>
              </div>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading users...</p>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              onChangePage={(page) => setCurrentPage(page)}
              onChangeRowsPerPage={(newPerPage) => setPerPage(newPerPage)}
              highlightOnHover
              striped
              responsive
              customStyles={customStyles}
              noDataComponent={
                <div className="text-center py-5">
                  <p>No users found</p>
                </div>
              }
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default UserPassword