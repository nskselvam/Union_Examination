import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import SubjectTableExample from '../SubjectDataTable/SubjectTableExample';
import { useUpdateGeneralBioDataMutation } from '../../redux-slice/adminOperationApiSlice';

// Role Master data for mapping role IDs to names
const roleMaster = [
    { id: "0", name: "Admin" },
    { id: "1", name: "Chief Examiner" },
    { id: "2", name: "Examiner" },
    { id: "3", name: "Review" },
    { id: "4", name: "Camp Officer" },
    { id: "5", name: "Camp Officer Assistant" },
    { id: "6", name: "Section Staff" },
];

/**
 * User Edit Modal Component
 */

const UserEditModalf = ({
    show = false,
    currentRow = { id: '', Eva_Id: '', FACULTY_NAME: '', Email_Id: '', Mobile_Number: '', Role: '' },
    mode = 'edit', // 'add' or 'edit'
    onSave = () => { },
    onHide = () => { },
}) => {
    const [formData, setFormData] = useState(currentRow);
    const [selectedRole, setSelectedRole] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [campInput, setCampInput] = useState('');
    const [updateGeneralBioData] = useUpdateGeneralBioDataMutation();
    // Update form data when currentRow changes
    console.log("Current Row in Modal:", currentRow);

    let RoleName = currentRow.Role ? currentRow.Role.split(',') : [];

    // Derived camp tags from formData.Camp_Name (comma-separated string)
    const campTags = formData.Camp_id_Camp
        ? formData.Camp_id_Camp.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const addCampTag = (value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        const newTags = [...new Set([...campTags, trimmed])];
        setFormData({ ...formData, Camp_id_Camp: newTags.join(',') });
        setCampInput('');
    };

    const removeCampTag = (tag) => {
        const newTags = campTags.filter(t => t !== tag);
        setFormData({ ...formData, Camp_id_Camp: newTags.join(',') });
    };

    const handleCampKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addCampTag(campInput);
        } else if (e.key === 'Backspace' && !campInput && campTags.length > 0) {
            removeCampTag(campTags[campTags.length - 1]);
        }
    };



    useEffect(() => {
        if (show) {
            setFormData(currentRow);
            setSelectedRole(currentRow.Role || '');
            setErrors({});
            setMessage({ type: '', text: '' });
            setCampInput('');
        }
    }, [show, currentRow]);

    // Handle Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    // Handle Role Select Change
    const handleRoleChange = (e) => {
        const roleId = e.target.value;
        setSelectedRole(roleId);
        setFormData({ ...formData, Role: roleId });
        if (errors.Role) {
            setErrors({ ...errors, Role: '' });
        }
    };

    // Validate Form
    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!selectedRole) {
            newErrors.Role = 'Role is required';
        }

        // if (!formData.Dep_Name?.trim() && (! (selectedRole == 1 || selectedRole == 2))) {
        //     newErrors.Dep_Name = 'Department Name is required';
        // }
        if (!formData.Eva_Id?.trim()) {
            newErrors.Eva_Id = 'User ID is required';
        }
        if (!formData.FACULTY_NAME?.trim()) {
            newErrors.FACULTY_NAME = 'Name is required';
        }

        // Email validation
        if (!formData.Email_Id?.trim()) {
            newErrors.Email_Id = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.Email_Id)) {
                newErrors.Email_Id = 'Please enter a valid email address';
            }
        }

        // Mobile number validation
        if (!formData.Mobile_Number?.trim()) {
            newErrors.Mobile_Number = 'Mobile number is required';
        } else {
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(formData.Mobile_Number)) {
                newErrors.Mobile_Number = 'Mobile number must be 10 digits';
            }
        }

        if (selectedRole == 4 && campTags.length === 0) {
            newErrors.Camp_id_Camp = 'At least one Camp Name is required for Camp Officer role';
        }

        // Role-specific validations
        if (!formData.Max_Paper?.trim() && selectedRole === '2') {
            newErrors.Max_Paper = 'Maximum Paper in Day is required';
        } else if ((isNaN(formData.Max_Paper) || parseInt(formData.Max_Paper) < 0) && selectedRole === '2') {
            newErrors.Max_Paper = 'Please enter a valid number for Maximum Paper in Day';
        }


        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Save
    const handleSave = async () => {
        console.log('Form Data on Save:', formData); // Debug log to check form data before saving
        if (!validateForm()) {
            setMessage({ type: 'danger', text: 'Please fill all required fields correctly.' });
            return;
        }

        setIsLoading(true);
        try {
            await updateGeneralBioData(formData).unwrap();
            setMessage({ type: 'success', text: 'User updated successfully!' });

            // Close modal after short delay
            setTimeout(() => {
                setIsLoading(false);
                handleClose();
            }, 1000);
        } catch (error) {
            setIsLoading(false);
            setMessage({ type: 'danger', text: 'Failed to save. Please try again.' });
        }
    };

    // Handle Modal Close
    const handleClose = () => {
        setFormData(currentRow);
        setSelectedRole('');
        setErrors({});
        setMessage({ type: '', text: '' });
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            backdrop="static"
            keyboard={false}
            size="xl"
        >
            <Modal.Header
                closeButton
                style={{ backgroundColor: '#335e8a', color: 'white' }}
            >
                <Modal.Title>
                    {mode === 'add' ? 'Add New User' : 'Edit Information'}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4 py-4">
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

                <Form>
                    {/* Role Selection */}
                    <Form.Group className="mb-4">
                        <Form.Label>
                            Role <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Select
                            name="Role"
                            value={selectedRole}
                            onChange={handleRoleChange}
                            isInvalid={!!errors.Role}
                        >
                            <option value="">-- Select Role --</option>
                            {RoleName && RoleName.map((roleId) => {
                                if (roleId === "7") return null;
                                const roleInfo = roleMaster.find(r => r.id === roleId);
                                return (
                                    <option key={roleId} value={roleId}>
                                        {roleInfo ? roleInfo.name : roleId}
                                    </option>
                                );
                            })}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.Role}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="row">


                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Evaluation Month/Year
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Eva_Mon_Year"
                                    value={formData.Eva_Mon_Year || ''}
                                    onChange={handleInputChange}
                                    placeholder="e.g., May_2026"
                                    disabled={mode === 'edit'}
                                />
                            </Form.Group>
                        </div>


                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    User ID <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    name="Eva_Id"
                                    value={String(formData.Eva_Id || '').replace(/[\r\n\t\s]/g, '')}
                                    onChange={handleInputChange}
                                    placeholder="Enter user ID"
                                    isInvalid={!!errors.Eva_Id}
                                    disabled={mode === 'edit'}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.Eva_Id}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                    </div>

                    {/* Basic User Information */}

                    <div>
                        <div className="row">

                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Name <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="FACULTY_NAME"
                                        value={formData.FACULTY_NAME || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                        isInvalid={!!errors.FACULTY_NAME}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.FACULTY_NAME}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>




                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Email <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="Email_Id"
                                        value={formData.Email_Id || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter email"
                                        isInvalid={!!errors.Email_Id}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.Email_Id}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">

                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Mobile Number <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="Mobile_Number"
                                        value={formData.Mobile_Number || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter mobile number"
                                        isInvalid={!!errors.Mobile_Number}
                                        maxLength="10"
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.Mobile_Number}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>



                            {selectedRole == 4 && (

                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Camp Name</Form.Label>
                                        {/* Tag display */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: '4px',
                                                border: '1px solid #ced4da',
                                                borderRadius: '6px',
                                                padding: '6px 8px',
                                                minHeight: '42px',
                                                backgroundColor: '#fff',
                                                cursor: 'text',
                                            }}
                                            onClick={() => document.getElementById('campTagInput').focus()}
                                        >
                                            {campTags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        background: '#0d6efd',
                                                        color: '#fff',
                                                        borderRadius: '4px',
                                                        padding: '2px 8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        gap: '4px',
                                                    }}
                                                >
                                                    {tag}
                                                    <span
                                                        style={{ cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}
                                                        onClick={(e) => { e.stopPropagation(); removeCampTag(tag); }}
                                                    >&times;</span>
                                                </span>
                                            ))}
                                            <input
                                                id="campTagInput"
                                                type="text"
                                                value={campInput}
                                                onChange={(e) => setCampInput(e.target.value)}
                                                onKeyDown={handleCampKeyDown}
                                                onBlur={() => addCampTag(campInput)}
                                                placeholder={campTags.length === 0 ? 'Type and press Enter or comma' : ''}
                                                style={{
                                                    border: 'none',
                                                    outline: 'none',
                                                    flex: 1,
                                                    minWidth: '120px',
                                                    fontSize: '0.9rem',
                                                    padding: '2px 4px',
                                                }}
                                            />
                                        </div>
                                        {errors.Camp_id_Camp && (
                                            <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: '4px' }}>
                                                {errors.Camp_id_Camp}
                                            </div>
                                        )}
                                        <Form.Text className="text-muted" style={{ fontSize: '0.78rem' }}>
                                            Press <kbd>Enter</kbd> or <kbd>,</kbd> to add. E.g. FSH12, FSH13
                                        </Form.Text>
                                    </Form.Group>
                                </div>

                            )}


                            {selectedRole == 2 && (

                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            Maximum Paper in Day
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="Max_Paper"
                                            value={formData.Max_Paper || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter maximum paper in day"
                                        />
                                    </Form.Group>
                                </div>


                            )}
                        </div>
                    </div>


                    {/* Chief Examiner and Examiner specific fields */}


                    {/* Examiner specific fields */}
                    {(selectedRole == 2 || selectedRole == 1) && (
                        <div className="row">
                            <div className="col-md-12">
                                <SubjectTableExample currentRow={formData} selectedRole={selectedRole} />
                            </div>
                        </div>)}

                </Form>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: '#f8f9fa' }}>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    style={{ minWidth: '100px' }}
                >
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isLoading}
                    style={{ minWidth: '100px' }}
                >
                    {isLoading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                            />
                            Saving...
                        </>
                    ) : (
                        mode === 'add' ? 'Add User' : 'Save Changes'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UserEditModalf;