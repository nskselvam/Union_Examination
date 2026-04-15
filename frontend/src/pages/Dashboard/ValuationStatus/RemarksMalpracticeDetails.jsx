import React, { useState, useEffect } from 'react';
import { Container, Card, Spinner, Form, Row, Col, Badge, Button } from 'react-bootstrap';
import DataTableBase from 'react-data-table-component';
import { useGetRemarksMalpracticeDetailsQuery } from '../../../redux-slice/valuationStatusApiSlice';
import axios from 'axios';
import * as XLSX from 'xlsx';

const DataTable = DataTableBase.default || DataTableBase;

const RemarksMalpracticeDetails = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [remarksType, setRemarksType] = useState('1');
    const { data: apiData, error, isLoading: apiLoading } = useGetRemarksMalpracticeDetailsQuery({ 
        
     });

    const getTodayDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Fetch remarks/malpractice details
    // const fetchRemarksDetails = async () => {
    //     setIsLoading(true);
    //     try {
    //         const response = await axios.post('/api/valuation-status/remarks-malpractice-details', {
    //             Remarks_Type: remarksType
    //         });

    //         if (response.data.success) {
    //             setData(response.data.data || []);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching remarks details:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    useEffect(() => {
        if (apiData) {
            const filtered = apiData.data.filter(item => item.Remarks_Type === remarksType);
            setData(filtered || []);
        }
    }, [apiData,remarksType]);

    // Filter data
    const filteredData = data.filter((item) =>
        (item.evaluator_id?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.evaluator_name?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.Dummy_Number?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.evaluator_subject?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.msg?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.Campid?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.remarks_reasons?.toLowerCase() || '').includes(filterText.toLowerCase())
    );

    // Export to Excel
    const handleExportToExcel = () => {
        if (filteredData.length === 0) {
            alert('No data to export');
            return;
        }

        const exportData = filteredData.map((item, index) => ({
            'S.No': index + 1,
            'Evaluator ID': item.evaluator_id,
            'Evaluator Name': item.evaluator_name,
            'Remarks Type': item.Remarks_Type,
            'Examiner Type': item.Examiner_Type,
            'Message': item.msg,
            'Subject': item.evaluator_subject,
            'Dummy Number': item.Dummy_Number,
            'Remarks Subject': item.RemarksSubject,
            'Camp Officer ID': item.Campofficerid,
            'Camp ID': item.Campid,
            'Department Name': item.Dep_Name,
            'Remarks Reasons': item.remarks_reasons
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Remarks Details');
        XLSX.writeFile(workbook, `Remarks_Malpractice_Details_Type${remarksType}_${new Date().toLocaleDateString()}.xlsx`);
    };

    // Get badge color based on examiner type
    const getExaminerTypeBadge = (type) => {
        const typeMap = {
            '1': { label: 'First Examiner', color: 'primary' },
            '2': { label: 'Second Examiner', color: 'success' },
            '3': { label: 'Third Examiner', color: 'warning' },
            '4': { label: 'Fourth Examiner', color: 'info' }
        };
        return typeMap[type] || { label: `Type ${type}`, color: 'secondary' };
    };

    // Get badge color based on remarks type
    const getRemarksTypeBadge = (type) => {
        const typeMap = {
            '1': { label: 'General Remark', color: 'warning' },
            '2': { label: 'Malpractice', color: 'danger' },
            '3': { label: 'Query', color: 'info' }
        };
        return typeMap[type] || { label: `Type ${type}`, color: 'secondary' };
    };

    // Table columns
    const columns = [
        {
            name: 'S.No',
            cell: (row, index) => (currentPage - 1) * perPage + index + 1,
            sortable: false,
            width: '70px',
            center: true
        },
        {
            name: 'Camp Details',
            selector: (row) => row.Campid,
            sortable: true,
            width: '180px',
            wrap: true,
            cell: (row) => (
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '14px', marginBottom: '4px' }}>
                        {row.Campid || '-'}
                    </div>
                    <div style={{ color: '#4a5568', fontWeight: '500' }}>
                        Officer ID: {row.Campofficerid || '-'}
                    </div>
                    <div style={{ color: '#718096', fontSize: '11px' }}>
                        Dept: {row.Dep_Name || '-'}
                    </div>
                </div>
            ),
        },
        {
            name: 'Evaluator Details',
            selector: (row) => row.evaluator_id,
            sortable: true,
            width: '200px',
            wrap: true,
            cell: (row) => (
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: '700', color: '#1e40af', fontSize: '14px', marginBottom: '4px' }}>
                        {row.evaluator_id || '-'}
                    </div>
                    <div style={{ color: '#4a5568', fontWeight: '500' }}>
                        {row.evaluator_name || '-'}
                    </div>
                </div>
            ),
        },
        {
            name: 'Dummy Number',
            selector: (row) => row.Dummy_Number,
            sortable: true,
            width: '120px',
            center: true,
            cell: (row) => (
                <Badge bg="dark" style={{ fontSize: '13px', padding: '6px 12px' }}>
                    {row.Dummy_Number || '-'}
                </Badge>
            ),
        },
        {
            name: 'Subject',
            selector: (row) => row.evaluator_subject,
            sortable: true,
            width: '250px',
            wrap: true,
            cell: (row) => (
                <div style={{ fontSize: '12px', color: '#4a5568', fontWeight: '500' }}>
                    {row.evaluator_subject || '-'}
                </div>
            ),
        },
        {
            name: 'Remarks Type',
            selector: (row) => row.Remarks_Type,
            sortable: true,
            width: '150px',
            center: true,
            cell: (row) => {
                const badge = getRemarksTypeBadge(row.Remarks_Type);
                return (
                    <Badge bg={badge.color} style={{ fontSize: '12px', padding: '6px 12px' }}>
                        {badge.label}
                    </Badge>
                );
            },
        },
        // {
        //     name: 'Examiner Type',
        //     selector: (row) => row.Examiner_Type,
        //     sortable: true,
        //     width: '150px',
        //     center: true,
        //     cell: (row) => {
        //         const badge = getExaminerTypeBadge(row.Examiner_Type);
        //         return (
        //             <Badge bg={badge.color} style={{ fontSize: '12px', padding: '6px 12px' }}>
        //                 {badge.label}
        //             </Badge>
        //         );
        //     },
        // },
        {
            name: 'Message',
            selector: (row) => row.msg,
            sortable: true,
            width: '250px',
            wrap: true,
            cell: (row) => (
                <div style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.4' }}>
                    {row.msg || '-'}
                </div>
            ),
        },
        {
            name: 'Remarks Subject',
            selector: (row) => row.RemarksSubject,
            sortable: true,
            width: '250px',
            wrap: true,
            cell: (row) => (
                <div style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.4' }}>
                    {row.RemarksSubject || '-'}
                </div>
            ),
        },
        {
            name: 'Remarks Reason',
            selector: (row) => row.remarks_reasons,
            sortable: true,
            width: '250px',
            wrap: true,
            cell: (row) => (
                <div style={{ fontSize: '12px', color: '#4a5568', lineHeight: '1.4' }}>
                    {row.remarks_reasons || '-'}
                </div>
            ),
        }
    ];

    // Custom styles for DataTable
    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#2c5282',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px 8px 0 0',
                minHeight: '52px',
            },
        },
        rows: {
            style: {
                fontSize: '13px',
                minHeight: '60px',
                '&:hover': {
                    backgroundColor: '#f0f4f8',
                    cursor: 'pointer',
                },
            },
            stripedStyle: {
                backgroundColor: '#f8fafc',
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #e2e8f0',
                minHeight: '56px',
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
                Remarks & Malpractice Details
            </h3>

            {/* Remarks Type Selector and Controls */}
            <Card className="mb-3">
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <div className="d-flex gap-2">
                                {[
                                    { value: '1', label: 'General Remarks', color: '#ffc107' },
                                    { value: '2', label: 'Malpractice', color: '#dc3545' },
                                    // { value: '3', label: 'Queries', color: '#17a2b8' }
                                ].map((type) => (
                                    <Button
                                        key={type.value}
                                        variant={remarksType === type.value ? 'primary' : 'outline-secondary'}
                                        onClick={() => setRemarksType(type.value)}
                                        style={{
                                            borderRadius: '8px',
                                            padding: '10px 20px',
                                            fontWeight: '600',
                                            fontSize: '14px',
                                            border: remarksType === type.value ? `2px solid ${type.color}` : '2px solid #dee2e6',
                                            backgroundColor: remarksType === type.value ? type.color : '#ffffff',
                                            color: remarksType === type.value ? '#ffffff' : '#6c757d',
                                            transition: 'all 0.3s ease',
                                            boxShadow: remarksType === type.value ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        {type.label}
                                    </Button>
                                ))}
                            </div>
                        </Col>
                        <Col md={6} className="d-flex align-items-center justify-content-end gap-3">
                            <Form.Control
                                type="text"
                                placeholder="Search by Evaluator, Dummy Number, Subject..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                style={{ maxWidth: '350px' }}
                            />
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
                            <p className="mt-3">Loading remarks details...</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
                            onChangePage={(page) => setCurrentPage(page)}
                            onChangeRowsPerPage={(newPerPage) => setPerPage(newPerPage)}
                            highlightOnHover
                            striped
                            responsive
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="text-center py-5">
                                    <p>No remarks details found</p>
                                </div>
                            }
                        />
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RemarksMalpracticeDetails;