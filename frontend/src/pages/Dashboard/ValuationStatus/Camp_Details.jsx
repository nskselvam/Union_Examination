import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Form, Row, Col, Badge, Button } from 'react-bootstrap';
import DataTableBase from 'react-data-table-component';
import { useGetCampDetailsQuery } from '../../../redux-slice/valuationStatusApiSlice'
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
// import axios from 'axios';

const DataTable = DataTableBase.default || DataTableBase;

const Camp_Details = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Fetch camp details on mount
  const userDegree = useSelector((state) => state.auth.degreeInfo);
  const userCourse = useSelector((state) => state.auth.userInfo.selected_course);
  const userRole = useSelector((state) => state.auth.userInfo.selected_role);
  console.log('User degree info:', userDegree);
  console.log('User selected course:', userCourse);
  const { data: campData, isLoading: campLoading } = useGetCampDetailsQuery(
    userCourse ? { course: userCourse ,
      role: userRole
    } : {}
  );

  useEffect(() => {
    if (campData?.campResults) {
      setData(campData.campResults);
    }
  }, [campData]);

  // const fetchCampDetails = async () => {
  //   setIsLoading(true);
  //   try {
  //     const response = await axios.get('/api/valuationstatus/camp-details');
  //     if (response.data?.campResults) {
  //       setData(response.data.campResults);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching camp details:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Filter data based on search
  const filteredData = data.filter(
    (item) =>
      (item.FACULTY_NAME?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (item.Eva_Id?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (item.Email_d?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (item.MobileNumber?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
      (item.department?.toLowerCase() || '').includes(filterText.toLowerCase())
  );

  // Export to Excel function
  const handleExportToExcel = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const exportData = filteredData.map((item, index) => ({
      'S.No': index + 1,
      'Camp Officer ID': item.Eva_Id,
      'Name': item.FACULTY_NAME,
      'Camp ID': `${item.Camp_id_Camp} ( Val - ${item.valuationType})`,
      'Department': userDegree && item.department ? userDegree.find(d => d.D_Code === item.department)?.Degree_Name || item.department : item.department || '-',
      'Email': item.Email_d || '-',
      'Mobile': item.MobileNumber || '-',
      'Overall Count': item.overallCount,
      'Checked Count': item.checkedCount,
      'Pending Count': item.pendingCount,
      'Percentage': item.Percentage
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Camp Details');
    XLSX.writeFile(workbook, `Camp_Valuation_Details_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Table columns
  const columns = [
    {
      name: 'S.No',
      cell: (row, index) => (currentPage - 1) * perPage + index + 1,
      sortable: false,
      width: '40px',
      center: true
    },
    {
      name: 'Camp Officer ID',
      selector: (row) => row.Eva_Id,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Name',
      selector: (row) => `${row.FACULTY_NAME} (${row.Email_d} | ${row.MobileNumber})`,
      sortable: true,
      minWidth: '200px',
      wrap: true
    },
    {
      name: 'Camp Id',
      selector: (row) => `${row.Camp_id_Camp} ( Val - ${row.valuationType})`,
      sortable: true,
      minWidth: '100px',
      wrap: true
    },
    {
      name: 'Department',
      selector: (row) => userDegree && row.department ? userDegree.find(d => d.D_Code === row.department)?.Degree_Name || row.department : row.department || '-',
      sortable: true,
      width: '120px',
      center: true
    },

    {
      name: 'Overall Count',
      selector: (row) => row.overallCount,
      sortable: true,
      width: '130px',
      center: true,
      cell: (row) => (
        <Badge bg="primary" style={{ fontSize: '13px', padding: '6px 12px' }}>
          {row.overallCount}
        </Badge>
      ),
    },
    {
      name: 'Checked Count',
      selector: (row) => row.checkedCount,
      sortable: true,
      width: '130px',
      center: true,
      cell: (row) => (
        <Badge bg="success" style={{ fontSize: '13px', padding: '6px 12px' }}>
          {row.checkedCount}
        </Badge>
      ),
    },
    {
      name: 'Pending Count',
      selector: (row) => row.pendingCount,
      sortable: true,
      width: '130px',
      center: true,
      cell: (row) => (
        <Badge bg="warning" style={{ fontSize: '13px', padding: '6px 12px' }}>
          {row.pendingCount}
        </Badge>
      ),
    },
    {
      name: 'Percentage',
      selector: (row) => row.Percentage,
      sortable: true,
      width: '120px',
      center: true,
      cell: (row) => (
        <span style={{ fontWeight: '600', color: '#2c5282' }}>
          {row.Percentage}%
        </span>
      ),
    },
  ];

  // Custom styles for the table
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#2c5282',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '13px',
        borderBottom: '2px solid #1a365d'
      },
    },
    headCells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRight: '1px solid #cbd5e0',
        '&:last-child': {
          borderRight: 'none'
        }
      },
    },
    rows: {
      style: {
        minHeight: '75px',
        borderBottom: '1px solid #e2e8f0',
        fontSize: '13px',
        '&:hover': {
          backgroundColor: '#f7fafc',
          cursor: 'pointer'
        }
      },
    },
    cells: {
      style: {
        paddingLeft: '8px',
        paddingRight: '8px',
        borderRight: '1px solid #e2e8f0',
        fontSize: '13px',
        '&:last-child': {
          borderRight: 'none'
        }
      },
    }
  };

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4" style={{ color: '#2c5282', fontWeight: '600' }}>
        Camp Valuation Details
      </h3>
      
      <Card>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search by Name, Camp Officer ID, Email, Mobile, or Department..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="text-end d-flex align-items-center justify-content-end gap-3">
              <div style={{ fontSize: '14px', color: '#2c5282' }}>
                <strong>Total Records:</strong> {filteredData.length}
              </div>
              <Button
                variant="success"
                size="sm"
                onClick={handleExportToExcel}
                disabled={filteredData.length === 0}
              >
                <i className="bi bi-file-earmark-excel me-2"></i>
                Export to Excel
              </Button>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading camp details...</p>
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
                  <p>No camp details found</p>
                </div>
              }
            />
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Camp_Details;
