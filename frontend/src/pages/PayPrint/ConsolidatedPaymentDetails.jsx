import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Modal, Table, Button, Form, Spinner } from 'react-bootstrap';
import DataTableBase from 'react-data-table-component';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaFileInvoiceDollar, FaInfoCircle, FaCheckCircle, FaSearch, FaPrint, FaTrash, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useGetexaminerPaymentDetailsQuery, usePostExaminerPaymentChallanMutation, useDeleteExaminerPaymentMutation } from '../../redux-slice/userDashboardSlice';

const DataTable = DataTableBase.default || DataTableBase;
 
const ConsolidatedPaymentDetails = () => {
    const userInfo = useSelector((state) => state.auth.userInfo);
    const Eva_Id = userInfo?.username || '';

    const [filterText, setFilterText] = useState('');
    const [valuationType, setValuationType] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [postExaminerPaymentChallan, { isLoading: isPosting }] = usePostExaminerPaymentChallanMutation();
    const [deleteExaminerPayment, { isLoading: isDeleting }] = useDeleteExaminerPaymentMutation();
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, row: null });

    const { data: paymentData, isLoading, isError, refetch } = useGetexaminerPaymentDetailsQuery({
        Eva_Id,
        Valuation_Type: valuationType || undefined,
        Role: userInfo?.selected_role || undefined,
    });

    useEffect(() => {
        if (Eva_Id) {
            refetch();
        }
    }, [Eva_Id, valuationType]);

    console.log("Fetched payment data:", paymentData);
    const records = Array.isArray(paymentData) ? paymentData : [];

    const filteredData = records.filter((item) =>
        (item.Evaluation_Id?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.Evaluation_Name?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.ChallanNumber?.toLowerCase() || '').includes(filterText.toLowerCase()) ||
        (item.Camp_Id?.toLowerCase() || '').includes(filterText.toLowerCase())
    );

    const handleViewSubjects = (row) => {
        setSelectedRecord(row);
        setShowModal(true);
    };

    const valuationLabel = (type) => {
        const map = { '1': 'First', '2': 'Second', '3': 'Third', '4': 'Fourth' };
        return map[type] ? `${map[type]} Valuation` : `Type ${type}`;
    };

    const handlePostExaminerPaymentChallan = async (row) => {
        try {
            const result = await postExaminerPaymentChallan({ paymentRecord: row }).unwrap();
            
            if (result instanceof Blob) {
                const fileURL = URL.createObjectURL(result);
                window.open(fileURL);
                setTimeout(() => URL.revokeObjectURL(fileURL), 100);
                toast.success('Challan generated successfully!');
            } else {
                toast.error('Error: Response is not a valid PDF');
            }
        } catch (error) {
            console.error("Error posting payment challan:", error);
            let errorMessage = 'Failed to generate payment challan';
            if (error.data?.message) {
                errorMessage = error.data.message;
            } else if (error.data?.error) {
                errorMessage = error.data.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(`Error: ${errorMessage}`);
        }
    };

    const examinerPaymentDelete = (row) => {
        setDeleteConfirm({ show: true, row });
    };

    const confirmDelete = async () => {
        const row = deleteConfirm.row;
        setDeleteConfirm({ show: false, row: null });
        try {
            await deleteExaminerPayment(row.id).unwrap();
            toast.success(`Challan "${row.ChallanNumber}" and ${row.subjects?.length || 0} subject record(s) deleted successfully.`);
            refetch();
        } catch (error) {
            const msg = error.data?.message || error.message || 'Failed to delete payment record';
            toast.error(`Delete failed: ${msg}`);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(amount || 0);

    const exportToExcel = () => {
        if (!filteredData.length) {
            toast.warning('No data to export.');
            return;
        }
        const rows = filteredData.map((item, index) => ({
            'S.No':             index + 1,
            'Challan Number':   item.ChallanNumber    || '',
            'Evaluator ID':     item.Evaluation_Id    || '',
            'Evaluator Name':   item.Evaluation_Name  || '',
            'Degree':           item.Degree_Name      || '',
            'Camp ID':          item.Camp_Id          || '',
            'Camp Officer ID':  item.Camp_Officer_Id  || '',
            'Report From':      item.Report_I_Date    || '',
            'Report To':        item.Report_E_Data    || '',
            'Examiner Type':    valuationLabel(item.Examiner_Type),
            'Examiner Status':  item.Examiner_Status  || '',
            'Subject Amount':   item.Subject_Amount   || 0,
            'DA Days':          item.Da_Days          || 0,
            'DA Per Day':       item.Da_Per_Day_Amt   || 0,
            'DA Amount':        item.Da_Amount        || 0,
            'DA Description':   item.Da_Descrption    || '',
            'Additional Amount':item.Additional_Amount|| 0,
            'Total Amount':     item.Total_Amount     || 0,
            'Account Number':   item.BANK_ACCOUNT_NUMBER || '',
            'IFSC Code':        item.IFSC             || '',
            'Bank Name':        item.BANK_NAME        || '',
            'Bank Address':     item.BANK_ADDRESS     || '',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Consolidated Payment Report');
        XLSX.writeFile(wb, `Consolidated_Payment_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success(`Exported ${rows.length} record(s) to Excel.`);
    };

    const exportToPDF = () => {
        try {
            if (!filteredData.length) {
                toast.warning('No data to export.');
                return;
            }

            console.log('Starting PDF export with', filteredData.length, 'records');

            // A3 size in mm: 297 x 420 (portrait) or 420 x 297 (landscape)
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a3'
            });
        
        // Add title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Consolidated Payment Details Report', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
        
        // Add date and count info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 25);
        doc.text(`Total Records: ${filteredData.length}`, doc.internal.pageSize.getWidth() - 14, 25, { align: 'right' });

        // Prepare table data
        const tableData = filteredData.map((item, index) => [
            index + 1,
            item.ChallanNumber || '',
            item.Evaluation_Id || '',
            item.Evaluation_Name || '',
            item.Camp_Id || '',
            item.campusName || '',
            item.Camp_Officer_Name || '',
            // item.Report_I_Date || '',
            // item.Report_E_Data || '',
            // valuationLabel(item.Examiner_Type),

   
            item.BANK_ACCOUNT_NUMBER || '',
            item.IFSC             || '',
            item.BANK_NAME        || '',

            item.Examiner_Status || '',
           // item.Subject_Amount || '',
            // item.Da_Days || '',
            // item.Da_Amount || '',
            // item.Additional_Amount || '',
            item.Total_Amount || '',
        ]);

        // Add table using autoTable
        autoTable(doc, {
            startY: 30,
            head: [[
                'S.No',
                'Challan Number',
                'Evaluator ID',
                'Evaluator Name',
                'Camp ID',
                'Campus Name',
                'Camp Officer Name',
                'Account No.',
                'IFSC Code',
                'Bank Name',
                 'Examiner Status',
                // 'From Date',
                // 'To Date',
                // 'Type',

                // 'Subject Amt',
                // 'DA Days',
                // 'DA Amt',
                // 'Add Amt',
                'Total Amt',
            ]],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [44, 82, 130],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center',
            },
            bodyStyles: {
                fontSize: 8,
                cellPadding: 3,
                fontStyle: 'bold',
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 69, halign: 'center' },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 40 },
                4: { cellWidth: 20, halign: 'center' },
                5: { cellWidth: 30, halign: 'center' },
                6: { cellWidth: 35, halign: 'center' },
                7: { cellWidth: 30, halign: 'center' },
                8: { cellWidth: 25, halign: 'center' },
                9: { cellWidth: 45, halign: 'center' },
                10: { cellWidth: 30, halign: 'center' },
                11: { cellWidth: 28, halign: 'right' },
                // 12: { cellWidth: 20, halign: 'center' },
                // 13: { cellWidth: 38, halign: 'right' },
                // 14: { cellWidth: 28, halign: 'right' },
                // 15: { cellWidth: 20, halign: 'right' },
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252],
            },
            margin: { top: 30, left: 14, right: 14 },
        });

        // Calculate and add Grand Total
        const grandTotal = filteredData.reduce((sum, item) => sum + (parseFloat(item.Total_Amount) || 0), 0);
        const finalY = doc.lastAutoTable.finalY + 10;
        
        // Add Grand Total row
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        // doc.setFillColor(44, 82, 130);
        // doc.setTextColor(255, 255, 255);
        // doc.rect(14, finalY, doc.internal.pageSize.getWidth() - 28, 10, 'F');
        doc.text('GRAND TOTAL:', doc.internal.pageSize.getWidth() - 90, finalY + 7);
        doc.text(grandTotal.toFixed(2), doc.internal.pageSize.getWidth() - 30, finalY + 7, { align: 'right' });
        doc.setTextColor(0, 0, 0);

        // Add footer with signature and page number
        const pageCount = doc.internal.getNumberOfPages();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            
            const footerY = pageHeight - 10;
            
            // Left side - Signature & Date
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Signature & Date: _____________________', 14, footerY);
            
            // Center - Page number
            doc.setFont('helvetica', 'italic');
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                footerY,
                { align: 'center' }
            );
        }

        // Save the PDF
            doc.save(`Consolidated_Payment_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
            toast.success(`Exported ${filteredData.length} record(s) to PDF.`);
            console.log('PDF export completed successfully');
        } catch (error) {
            console.error('PDF Export Error:', error);
            toast.error(`Failed to export PDF: ${error.message}`);
        }
    };

    const columns = [
        {
            name: 'S.No',
            cell: (row, index) => (currentPage - 1) * perPage + index + 1,
            width: '65px',
            center: true,
        },
        {
            name: 'Challan Number',
            selector: (row) => row.ChallanNumber,
            sortable: true,
            wrap: true,
            width: '230px',
            cell: (row) => (
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>
                    {row.ChallanNumber || '-'}
                </span>
            ),
        },
        {
            name: 'Evaluator',
            selector: (row) => row.Evaluation_Id,
            sortable: true,
            width: '200px',
            cell: (row) => (
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <div
                        style={{ fontWeight: 700, color: '#1e40af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleViewSubjects(row)}
                        title="Click to view subject details"
                    >
                        {row.Evaluation_Id || '-'}
                    </div>
                    <div style={{ color: '#4a5568' }}>{row.Evaluation_Name || '-'}</div>
                </div>
            ),
        },
        {
            name: 'Period',
            width: '160px',
            cell: (row) => (
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <div><strong>From:</strong> {row.Report_I_Date || '-'}</div>
                    <div><strong>To:</strong> {row.Report_E_Data || '-'}</div>
                </div>
            ),
        },
        {
            name: 'Camp',
            width: '140px',
            cell: (row) => (
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 600, color: '#1e40af' }}>{row.Camp_Id || '-'}</div>
                    <div style={{ color: '#4a5568' }}>Officer: {row.Camp_Officer_Id || '-'}</div>
                </div>
            ),
        },
        {
            name: 'Campus Name',
            selector: (row) => row.campusName,
            sortable: true,
            width: '150px',
            cell: (row) => (
                <span style={{ fontSize: '12px', color: '#4a5568' }}>
                    {row.campusName || '-'}
                </span>
            ),
        },
        {
            name: 'Camp Officer',
            selector: (row) => row.Camp_Officer_Name,
            sortable: true,
            width: '180px',
            cell: (row) => (
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 600, color: '#1e40af' }}>{row.Camp_Officer_Id || '-'}</div>
                    <div style={{ color: '#4a5568' }}>{row.Camp_Officer_Name || '-'}</div>
                </div>
            ),
        },
        {
            name: 'Examiner Status',
            selector: (row) => row.Examiner_Status,
            sortable: true,
            width: '140px',
            center: true,
            cell: (row) => (
                <Badge 
                    bg={row.Examiner_Status === 'Chief Examiner' ? 'primary' : 'success'}
                    style={{ fontSize: '11px', padding: '6px 12px', fontWeight: 600 }}
                >
                    {row.Examiner_Status || 'Examiner'}
                </Badge>
            ),
        },
        {
            name: 'Subjects',
            width: '80px',
            center: true,
            cell: (row) => (
                <Badge bg="info" style={{ fontSize: '12px', padding: '5px 10px', cursor: 'pointer' }}
                    onClick={() => handleViewSubjects(row)}>
                    {row.subjects?.length || 0}
                </Badge>
            ),
        },
        {
            name: 'DA / Additional',
            width: '150px',
            cell: (row) => (
                <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                    <div>DA: <strong>{formatCurrency(row.Da_Amount)}</strong></div>
                    <div>Add: <strong>{formatCurrency(row.Additional_Amount)}</strong></div>
                </div>
            ),
        },
        {
            name: 'Total Amount',
            selector: (row) => row.Total_Amount,
            sortable: true,
            width: '130px',
            right: true,
            cell: (row) => (
                <strong style={{ color: '#16a34a', fontSize: '13px' }}>
                    {formatCurrency(row.Total_Amount)}
                </strong>
            ),
        },
        {
            name: 'Action',
            width: '200px',
            center: true,
            cell: (row) => (
                <div className="d-flex gap-1">
                    <Button size="sm" variant="outline-primary" style={{ fontSize: '11px' }}
                        onClick={() => handlePostExaminerPaymentChallan(row)}>
                        <FaPrint className="me-1" /> Print
                    </Button>
                    <Button size="sm" variant="outline-danger" style={{ fontSize: '11px' }}
                        onClick={() => examinerPaymentDelete(row)}>
                        <FaTrash className="me-1" /> Delete
                    </Button>
                </div>
            ),
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#2c5282',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                minHeight: '48px',
            },
        },
        rows: {
            style: {
                minHeight: '58px',
                fontSize: '12px',
                '&:hover': { backgroundColor: '#f0f4f8', cursor: 'pointer' },
            },
            stripedStyle: { backgroundColor: '#f8fafc' },
        },
        cells: {
            style: {
                paddingLeft: '8px',
                paddingRight: '8px',
                borderRight: '1px solid #e2e8f0',
                '&:last-child': { borderRight: 'none' },
            },
        },
    };

    return (
        <Container fluid className="p-4">
            <ToastContainer position="bottom-right" autoClose={3000} />

            <Row className="mb-3">
                <Col>
                    <h3 style={{ color: '#2c5282', fontWeight: '600' }}>
                        <FaFileInvoiceDollar className="me-2" />
                        Consolidated Payment Details
                    </h3>
                </Col>
            </Row>

            <Card className="mb-3">
                <Card.Body>
                    {/* Filters */}
                    <Row className="mb-3 align-items-center">
                        <Col md={4}>
                            <div className="d-flex gap-2 flex-wrap">
                                {[
                                    { value: '', label: 'All', color: '#6c757d' },
                                    { value: '1', label: 'Chief Examiner', color: '#0066cc' },
                                    { value: '2', label: 'Examiner', color: '#28a745' },
                                ].map((type) => (
                                    <Button
                                        key={type.value}
                                        size="sm"
                                        variant={valuationType === type.value ? 'primary' : 'outline-secondary'}
                                        onClick={() => setValuationType(type.value)}
                                        style={{
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            border: valuationType === type.value ? `2px solid ${type.color}` : '2px solid #dee2e6',
                                            backgroundColor: valuationType === type.value ? type.color : '#ffffff',
                                            color: valuationType === type.value ? '#ffffff' : '#6c757d',
                                        }}
                                    >
                                        {type.label}
                                    </Button>
                                ))}
                            </div>
                        </Col>
                        <Col md={4} className="ms-auto">
                            <div className="input-group">
                                <span className="input-group-text"><FaSearch /></span>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by Evaluator, Challan, Camp..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md="auto">
                            <Badge bg="danger" style={{ fontSize: '14px', padding: '8px 14px' }}>
                                Total: {filteredData.length}
                            </Badge>
                        </Col>
                        <Col md="auto">
                            <Button size="sm" variant="success" onClick={exportToExcel}
                                style={{ fontSize: '12px', fontWeight: 600 }}>
                                <FaFileExcel className="me-1" /> Export Excel
                            </Button>
                        </Col>
                        <Col md="auto">
                            <Button size="sm" variant="danger" onClick={exportToPDF}
                                style={{ fontSize: '12px', fontWeight: 600 }}>
                                <FaFilePdf className="me-1" /> Export PDF (A3)
                            </Button>
                        </Col>
                    </Row>

                    {isLoading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">Loading payment records...</p>
                        </div>
                    ) : isError ? (
                        <div className="text-center py-5 text-danger">
                            <FaInfoCircle size={36} className="mb-2" />
                            <p>Failed to load payment data. Please try again.</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredData}
                            pagination
                            paginationPerPage={10}
                            paginationRowsPerPageOptions={[10, 20, 50, 100]}
                            onChangePage={(page) => setCurrentPage(page)}
                            onChangeRowsPerPage={(newPerPage) => setPerPage(newPerPage)}
                            highlightOnHover
                            striped
                            responsive
                            customStyles={customStyles}
                            noDataComponent={
                                <div className="text-center py-5 text-muted">
                                    <FaFileInvoiceDollar size={40} className="mb-2" style={{ opacity: 0.4 }} />
                                    <p>No payment records found</p>
                                </div>
                            }
                        />
                    )}
                </Card.Body>
            </Card>

            {/* Subject Details Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Modal.Title style={{ fontWeight: 700 }}>
                        <FaFileInvoiceDollar className="me-2" />
                        Payment Details — {selectedRecord?.Evaluation_Id} ({selectedRecord?.Evaluation_Name})
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedRecord && (
                        <>
                            {/* Summary */}
                            <Row className="mb-3 g-2">
                                {[
                                    { label: 'Challan No', value: selectedRecord.ChallanNumber },
                                    { label: 'Period', value: `${selectedRecord.Report_I_Date} → ${selectedRecord.Report_E_Data}` },
                                    { label: 'Camp ID', value: selectedRecord.Camp_Id },
                                    { label: 'DA Amount', value: formatCurrency(selectedRecord.Da_Amount) },
                                    { label: 'DA Days', value: selectedRecord.Da_Days || '-' },
                                    { label: 'Additional', value: formatCurrency(selectedRecord.Additional_Amount) },
                                    { label: 'Total Amount', value: formatCurrency(selectedRecord.Total_Amount) },
                                ].map((item, i) => (
                                    <Col xs={6} md={3} key={i}>
                                        <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '10px', textAlign: 'center', height: '100%' }}>
                                            <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: 600 }}>{item.label}</div>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#2c5282', marginTop: '4px' }}>{item.value}</div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {/* Banking Details */}
                            <div className="mb-3 p-3" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderRadius: '10px', border: '1px solid #2196f3' }}>
                                <h6 style={{ color: '#1565c0', fontWeight: 700, marginBottom: '12px' }}>💳 Banking Details</h6>
                                <Row className="g-2">
                                    <Col xs={12} md={6}>
                                        <div style={{ fontSize: '13px' }}>
                                            <strong style={{ color: '#0d47a1' }}>Account Number:</strong>
                                            <span className="ms-2">{selectedRecord.BANK_ACCOUNT_NUMBER || 'N/A'}</span>
                                        </div>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <div style={{ fontSize: '13px' }}>
                                            <strong style={{ color: '#0d47a1' }}>IFSC Code:</strong>
                                            <span className="ms-2">{selectedRecord.IFSC || 'N/A'}</span>
                                        </div>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <div style={{ fontSize: '13px' }}>
                                            <strong style={{ color: '#0d47a1' }}>Bank Name:</strong>
                                            <span className="ms-2">{selectedRecord.BANK_NAME || 'N/A'}</span>
                                        </div>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <div style={{ fontSize: '13px' }}>
                                            <strong style={{ color: '#0d47a1' }}>Bank Address:</strong>
                                            <span className="ms-2">{selectedRecord.BANK_ADDRESS || 'N/A'}</span>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Subject Table */}
                            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                <Table responsive className="mb-0">
                                    <thead style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                        <tr>
                                            <th style={{ padding: '12px 15px', fontWeight: 600, fontSize: '13px', width: '50px' }}>S.No</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 600, fontSize: '13px' }}>Subject Code</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 600, fontSize: '13px' }}>Subject Name</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 600, fontSize: '13px', textAlign: 'center' }}>Papers</th>
                                           {selectedRecord.Examiner_Type === '2' && (
                                            <>
                                            <th style={{ padding: '12px 15px', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>Rate/Paper (₹)</th>
                                            <th style={{ padding: '12px 15px', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>Total (₹)</th>
                                            </>
                                           )}
                                            </tr>
                                    </thead>
                                    <tbody>
                                        {selectedRecord.subjects?.length > 0 ? (
                                            <>
                                                {selectedRecord.subjects.map((sub, idx) => (
                                                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                                        <td style={{ padding: '12px 15px', textAlign: 'center' }}>{idx + 1}</td>
                                                        <td style={{ padding: '12px 15px' }}>
                                                            <Badge bg="primary" style={{ fontSize: '12px', padding: '5px 10px' }}>{sub.Subcode}</Badge>
                                                        </td>
                                                        <td style={{ padding: '12px 15px', fontSize: '13px' }}>{sub.Subname}</td>
                                                        <td style={{ padding: '12px 15px', textAlign: 'center', fontWeight: 600 }}>{sub.No_Paper}</td>
                                                        {selectedRecord.Examiner_Type === '2' && (
                                                            <>
                                                        <td style={{ padding: '12px 15px', textAlign: 'right' }}>₹ {sub.Paper_Amount}</td>
                                                        <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 700, color: '#667eea' }}>
                                                            ₹ {sub.Total?.toLocaleString('en-IN')}
                                                        </td>
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                                    <td colSpan={5} style={{ padding: '12px 15px', fontWeight: 700, textAlign: 'right' }}>
                                                        <FaCheckCircle className="me-2" />{selectedRecord.Examiner_Type === '2' ? 'Grand Total' : ''} 
                                                    </td>
                                                    <td style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 700, fontSize: '14px' }}>
                                                        {selectedRecord.Examiner_Type === '2' && formatCurrency(selectedRecord.Total_Amount)}
                                                    </td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-4 text-muted">No subject records found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={deleteConfirm.show} onHide={() => setDeleteConfirm({ show: false, row: null })} centered>
                <Modal.Header closeButton style={{ background: '#fff3cd', borderBottom: '1px solid #ffc107' }}>
                    <Modal.Title style={{ fontWeight: 700, color: '#856404', fontSize: '16px' }}>
                        ⚠️ Confirm Delete
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteConfirm.row && (
                        <>
                            <p className="mb-2">Are you sure you want to permanently delete this payment record?</p>
                            <div className="p-3 rounded" style={{ background: '#f8f9fa', fontSize: '13px' }}>
                                <div><strong>Challan Number:</strong> {deleteConfirm.row.ChallanNumber || '—'}</div>
                                <div><strong>Evaluator:</strong> {deleteConfirm.row.Evaluation_Id} — {deleteConfirm.row.Evaluation_Name}</div>
                                <div><strong>Degree:</strong> {deleteConfirm.row.Degree_Name}</div>
                                <div><strong>Subject Records:</strong> {deleteConfirm.row.subjects?.length || 0} subcode(s) will also be deleted</div>
                                <div><strong>Total Amount:</strong> ₹{deleteConfirm.row.Total_Amount}</div>
                            </div>
                            <p className="mt-2 mb-0 text-danger" style={{ fontSize: '12px' }}>
                                This action cannot be undone. All associated subject records will be removed.
                            </p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-secondary" onClick={() => setDeleteConfirm({ show: false, row: null })}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
                        {isDeleting ? <Spinner animation="border" size="sm" className="me-1" /> : null}
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ConsolidatedPaymentDetails;