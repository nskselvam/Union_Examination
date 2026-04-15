import React, { useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Table, Button, Pagination } from 'react-bootstrap'
import * as XLSX from 'xlsx'

const ErrorLogExcel = ({error}) => {

    const errData =  useSelector((state) => state.errinfo.errInfo);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Extract table data from errData
    const tableData = useMemo(() => {
        if (!errData) return [];
        
        // Check if Error_responseData exists
        if (errData.Error_responseData && Array.isArray(errData.Error_responseData)) {
            return errData.Error_responseData;
        }
        
        // If errData is an array, use it directly
        if (Array.isArray(errData)) {
            return errData;
        }
        
        return [];
    }, [errData]);

    // Pagination calculations
    const totalPages = Math.ceil(tableData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

    // Get table headers dynamically
    const tableHeaders = useMemo(() => {
        if (tableData.length === 0) return [];
        return Object.keys(tableData[0]);
    }, [tableData]);

    // Export to Excel
    const exportToExcel = () => {
        if (tableData.length === 0) return;
        
        const worksheet = XLSX.utils.json_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Error Log');
        XLSX.writeFile(workbook, `ErrorLog_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    // Export to CSV
    const exportToCSV = () => {
        if (tableData.length === 0) return;

        const headers = Object.keys(tableData[0]);
        const csvContent = [
            headers.join(','),
            ...tableData.map(row => 
                headers.map(header => {
                    const value = row[header];
                    const stringValue = String(value || '');
                    // Escape quotes and wrap in quotes if contains comma or quotes
                    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                        return `"${stringValue.replace(/"/g, '""')}"`;
                    }
                    return stringValue;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ErrorLog_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Generate pagination items
    const renderPaginationItems = () => {
        const items = [];
        const maxPagesToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        if (startPage > 1) {
            items.push(
                <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
                    1
                </Pagination.Item>
            );
            if (startPage > 2) {
                items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
            }
        }

        for (let number = startPage; number <= endPage; number++) {
            items.push(
                <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
            }
            items.push(
                <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
                    {totalPages}
                </Pagination.Item>
            );
        }

        return items;
    };

  return (
    <>
    {errData && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid red', backgroundColor: '#ffe6e6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h5 style={{ color: 'red', margin: 0 }}>Error in Imported File:</h5>
                {tableData.length > 0 && (
                    <div>
                        <Button 
                            variant="success" 
                            size="sm" 
                            onClick={exportToExcel}
                            style={{ marginRight: '10px' }}
                        >
                            Export to Excel
                        </Button>
                        <Button 
                            variant="info" 
                            size="sm" 
                            onClick={exportToCSV}
                        >
                            Export to CSV
                        </Button>
                    </div>
                )}
            </div>

            {tableData.length > 0 ? (
                <>
                    <Table striped bordered hover responsive size="sm">
                        <thead style={{ backgroundColor: '#dc3545', color: 'white' }}>
                            <tr>
                                <th>Slno</th>
                                {tableHeaders.map((header, index) => (
                                    <th key={index} style={{ textTransform: 'capitalize' }}>
                                        {header.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    <td>{indexOfFirstItem + rowIndex + 1}</td>
                                    {tableHeaders.map((header, colIndex) => (
                                        <td key={colIndex}>
                                            {typeof row[header] === 'object' && row[header] !== null
                                                ? JSON.stringify(row[header]) 
                                                : String(row[header] || '')}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'left', marginTop: '15px' }}>
                            <Pagination>
                                <Pagination.First 
                                    onClick={() => handlePageChange(1)} 
                                    disabled={currentPage === 1}
                                />
                                <Pagination.Prev 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1}
                                />
                                {renderPaginationItems()}
                                <Pagination.Next 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages}
                                />
                                <Pagination.Last 
                                    onClick={() => handlePageChange(totalPages)} 
                                    disabled={currentPage === totalPages}
                                />
                            </Pagination>
                        </div>
                    )}

                    <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, tableData.length)} of {tableData.length} entries
                    </div>
                </>
            ) : (
                <p style={{ textAlign: 'center', color: '#666' }}>No error data available</p>
            )}
        </div>
    )}
    </>
  )
}

export default ErrorLogExcel
