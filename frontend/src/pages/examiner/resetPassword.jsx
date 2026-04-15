import React, { useState, useEffect } from 'react'
import { Container, Card, Button, Badge, Spinner, Form, Row, Col } from 'react-bootstrap'
import DataTable from 'react-data-table-component/dist/index.es.js'
import { useGetExaminerResetPasswordQuery , useResetExaminerPasswordMutation} from '../../redux-slice/examinerApiSlice'
import masterData from '../../json/master.json'
import { toast } from 'react-toastify'



const ResetPassword = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [filterText, setFilterText] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [perPage, setPerPage] = useState(10)

    const [resetExaminerPassword] = useResetExaminerPasswordMutation();
    // Fetch user data - replace with actual API call
    useEffect(() => {
        fetchUsers()
    }, [])

    const { data: resetPasswordData, isLoading, isError, error, refetch } = useGetExaminerResetPasswordQuery(

        {
            Dep_Name: "01",
            Eva_Mon_Year: "Nov_2025"
        }
    );

    console.log("Reset Password API Response:", resetPasswordData, "Loading:", isLoading, "Error:", isError, "Error Details:", error);
    console.log("Master Data:", masterData, "Is Array:", Array.isArray(masterData), "Type:", typeof masterData);

    // Sync API data with local state
    useEffect(() => {
        if (resetPasswordData?.data && Array.isArray(resetPasswordData.data)) {
            setData(resetPasswordData.data);
            setLoading(false);
        } else if (resetPasswordData && Array.isArray(resetPasswordData)) {
            setData(resetPasswordData);
            setLoading(false);
        } else {
            setData([]);
            setLoading(false);
        }
    }, [resetPasswordData]);

    const fetchUsers = async () => {
        setLoading(true)
        try {
            await refetch()
            console.log('Data refetched successfully')
        } catch (error) {
            console.error('Error refetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = (row) => {
        const passwordResetData = {
            id: row.id
        };
        resetExaminerPassword(passwordResetData)
            .unwrap()
            .then((response) => {
                console.log('Password reset successful:', response);
                toast.success(`Password reset successful for ${row.FACULTY_NAME}. SMS Status: ${response.smsStatus || 'N/A'}`);
                // Refetch the user list to reflect changes
                refetch();
            })
            .catch((error) => {
                console.error('Error resetting password:', error);
                toast.error(error?.data?.message || 'Failed to reset password');
            });
    }

    const getRoleBadgeColor = (role) => {
        const roleColors = {
            '0': { bg: 'primary', text: 'white' },
            '1': { bg: 'success', text: 'white' },
            '2': { bg: 'danger', text: 'white' },
            '3': { bg: 'dark', text: 'white' },
            '4': { bg: 'warning', text: 'dark' },
            '5': { bg: 'info', text: 'dark' }
        }
        return roleColors[role] || { bg: 'secondary', text: 'white' }
    }

    // Filter data based on search
    const filteredData = (Array.isArray(data) ? data : []).filter(item =>
        item.Eva_Id?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.FACULTY_NAME?.toLowerCase().includes(filterText.toLowerCase()) ||
        String(item.Role)?.toLowerCase().includes(filterText.toLowerCase()) ||
        item.id?.toString().includes(filterText) ||
        item.updatedAt?.toLowerCase().includes(filterText.toLowerCase())
    )

    const columns = [
        {
            name: 'S.No',
            cell: (row, index) => (currentPage - 1) * perPage + index + 1,
            sortable: false,
            width: '80px',
            center: true
        },
        {
            name: 'Evaluation ID',
            selector: row => row.Eva_Id,
            sortable: true,
            width: '150px'
        },
        {
            name: 'Candidate Name',
            selector: row => row.FACULTY_NAME,
            sortable: true,
            minWidth: '200px',
            wrap: true
        },
        {
            name: 'Role',
            selector: row => row.RoleName || row.Role,
            sortable: true,
            minWidth: '200px',
            center: true,
            wrap: true,
            cell: row => {
                //const roleName = row.RoleName || row.Role;
                const roles = (row.Role).includes(',') ? ( row.Role).split(',').map(r => r.trim()) : [ row.Role];
                
                return (
                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                        {roles.map((role, index) => {
                            const colors = getRoleBadgeColor(role);
                            return (
                                <Badge
                                    key={index}
                                    bg={colors.bg}
                                    text={colors.text}
                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                    {
                                    masterData.examinerRoles.find(r => String(r.id) === String(role))?.name
                                  
                                    }
                                </Badge>
                            );
                        })}
                    </div>
                );
            }
        },
        {
            name: 'Last Login',
            selector: row => row.updatedAt,
            sortable: true,
            width: '180px',
            cell: row => {
                if (!row.updatedAt) return 'Never';
                const date = new Date(row.updatedAt);
                return date.toLocaleDateString('en-GB', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                }) + ' ' + date.toLocaleTimeString('en-GB', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
        },
        {
            name: 'Actions',
            width: '150px',
            center: true,
            cell: row => (
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handlePasswordReset(row)}
                >
                    Password Reset
                </Button>
            )
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
                minHeight: '85px',
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
            <h3 className="mb-4" style={{ color: '#2c5282', fontWeight: '600' }}>
                Reset Password
            </h3>
            <Card>
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={9}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by Evaluation ID, Name, or Role..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3} className="text-end">
                            <Button
                                variant="primary"
                                onClick={fetchUsers}
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Refresh'}
                            </Button>
                        </Col>
                    </Row>

                    {(loading || isLoading) ? (
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

export default ResetPassword