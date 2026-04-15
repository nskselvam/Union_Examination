import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useDeleteAdminUserMutation } from '../../redux-slice/adminOperationApiSlice'

// Role Master data for mapping role IDs to names
const roleMaster = [
    { id: "0", name: "Admin" },
    { id: "1", name: "Chief Examiner" },
    { id: "2", name: "Examiner" },
    { id: "3", name: "Review" },
    { id: "4", name: "Camp Officer" },
    { id: "5", name: "Camp Officer Assistant" },
    { id: "6", name: "Section Staff" },
    { id: "7", name: "Chief Evaluation Examiner" },
];

// Helper function to get role names from IDs
const getRoleNames = (roleIds) => {
    if (!roleIds) return [];
    const ids = roleIds.split(',').map(id => id.trim());
    return ids.map(id => {
        const role = roleMaster.find(r => r.id === id);
        return { id, name: role ? role.name : id };
    });
};

/**
 * Delete User/Role Modal Component
 */
const DeleteUserModal = ({
    show = false,
    onHide = () => { },
    userData = null,
    onConfirm = () => { },
}) => {

    const [deleteAdminUser, { isLoading }] = useDeleteAdminUserMutation();
    const [deleteOption, setDeleteOption] = useState('user'); // 'user' or 'role'
    const [selectedRole, setSelectedRole] = useState('');
    const [userRoles, setUserRoles] = useState([]);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (show && userData) {
            const roles = getRoleNames(userData.Role);
            setUserRoles(roles);
            setDeleteOption('user');
            setSelectedRole('');
            setMessage({ type: '', text: '' });
        }
    }, [show, userData]);

    const handleConfirm = async () => {
        const deleteData = {
            deleteType: deleteOption === 'user' ? 1 : 2,
            userId: userData.Eva_Id,
            roleId: deleteOption === 'role' ? selectedRole : ''
        };

        console.log('Delete data:', deleteData);
        
        try {
            await deleteAdminUser(deleteData).unwrap();
            
            const successMessage = deleteOption === 'user' 
                ? 'User deleted successfully!' 
                : 'Role removed successfully!';
            
            setMessage({ type: 'success', text: successMessage });
            
            // Close modal after showing success message
            setTimeout(() => {
                onConfirm(deleteData);
                handleClose();
            }, 1500);
        } catch (error) {
            console.error('Delete failed:', error);
            setMessage({ 
                type: 'danger', 
                text: error?.data?.message || 'Failed to delete. Please try again.' 
            });
        }
    };

    const handleClose = () => {
        setDeleteOption('user');
        setSelectedRole('');
        setMessage({ type: '', text: '' });
        onHide();
    };

    const isConfirmDisabled = deleteOption === 'role' && !selectedRole;

    return (
        <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false} size="lg">
            <Modal.Header closeButton style={{ backgroundColor: '#dc3545', color: 'white' }}>
                <Modal.Title>Delete User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Success/Error Message */}
                {message.text && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                        {message.text}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setMessage({ type: '', text: '' })}
                        ></button>
                    </div>
                )}

                {userData && (
                    <div>
                        <div className="mb-3" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>User ID:</strong> {userData.Eva_Id}</p>
                            <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Name:</strong> {userData.FACULTY_NAME}</p>
                        </div>

                        <Form>
                            <Form.Group className="mb-3">
                                <div className="mb-2">
                                    <Form.Check
                                        type="radio"
                                        id="delete-user"
                                        name="deleteOption"
                                        label={<strong>Delete entire user</strong>}
                                        checked={deleteOption === 'user'}
                                        onChange={() => setDeleteOption('user')}
                                    />
                                </div>
                                <div>
                                    <Form.Check
                                        type="radio"
                                        id="delete-role"
                                        name="deleteOption"
                                        label={<strong>Delete specific role</strong>}
                                        checked={deleteOption === 'role'}
                                        onChange={() => setDeleteOption('role')}
                                        disabled={userRoles.length === 0}
                                    />
                                </div>
                            </Form.Group>

                            {deleteOption === 'role' && userRoles.length > 0 && (
                                <Form.Group className="mb-3">
                                    <Form.Label style={{ fontWeight: '600' }}>Select role to delete:</Form.Label>
                                    <Form.Select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="">-- Select Role --</option>
                                        {userRoles.map((role) => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            )}

                            {deleteOption === 'user' && (
                                <div className="alert alert-warning" style={{ marginTop: '15px', borderLeft: '4px solid #ff9800' }}>
                                    <strong>⚠️ Warning:</strong> This will permanently delete the user "<strong>{userData.FACULTY_NAME}</strong>" and all associated data.
                                </div>
                            )}

                            {deleteOption === 'role' && selectedRole && (
                                <div className="alert alert-info" style={{ marginTop: '15px', borderLeft: '4px solid #2196F3' }}>
                                    <strong>ℹ️ Info:</strong> This will remove the "<strong>{userRoles.find(r => r.id === selectedRole)?.name}</strong>" role from {userData.FACULTY_NAME}.
                                </div>
                            )}
                        </Form>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer style={{ borderTop: '2px solid #dee2e6' }}>
                <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
                    Cancel
                </Button>
                <Button 
                    variant="danger" 
                    onClick={handleConfirm}
                    disabled={isConfirmDisabled || isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Deleting...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-trash me-2"></i>
                            Delete
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteUserModal;
