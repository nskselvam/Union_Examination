import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useAddNewUserMutation } from '../../redux-slice/adminOperationApiSlice';
import { useGetSubjectDataQuery } from '../../redux-slice/SubjectMasterApiSlice';
import { useGetExaminerUserDetailsQuery } from '../../redux-slice/examinerApiSlice';
//import { useGetServerTimeQuery } from '../../redux-slice/generalApiSlice';
import { useSelector } from 'react-redux';

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
 * User Role Add/Edit Modal Component
 */
const UserRoleModal = ({
    show = false,
    onHide = () => { },
    mode = 'add',
    initialData = { Eva_Id: '', FACULTY_NAME: '', Email_Id: '', Mobile_Number: '', Role: '' },
    onSave = () => { },
}) => {
    const [formData, setFormData] = useState(initialData);
    const [selectedRole, setSelectedRole] = useState('');
    const [errors, setErrors] = useState({});
    const [subjectSearch, setSubjectSearch] = useState('');
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
    const [checkEvaId, setCheckEvaId] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const evaIdRef = useRef(null);
    const degreeInfo = useSelector(state => state.auth.degreeInfo);
    const Month_Year_Info = useSelector(state => state.auth.monthyearInfo);

    const [addNewUser, { isLoading: isAdding }] = useAddNewUserMutation();
    const { data: subjectData, error: subjectError } = useGetSubjectDataQuery();
    const { data: userExistData, error: userExistError, refetch: refetchUserExist } = useGetExaminerUserDetailsQuery(
        { Eva_Id: checkEvaId, 
          Role: selectedRole ,
          Dep_Name: formData.Dep_Name
        },
        {
            skip: !checkEvaId || checkEvaId.trim() === '',
            refetchOnMountOrArgChange: true
        }
    );

    // const { data: DegreeData, error: degreeError, isLoading: degreeLoading, refetch: refetchDegree } = useGetServerTimeQuery(undefined, {
    //     pollingInterval: 0,
    //     refetchOnMountOrArgChange: false,
    //     refetchOnReconnect: true,
    // });

    console.log('Degree Data:', degreeInfo);

    console.log('Subject Data:', subjectData);
    console.log('Subject Data Error:', subjectError);
    console.log('Check Eva ID State:', checkEvaId);
    console.log('User Exist Data:', userExistData);

    const DegreeData = Array.isArray(degreeInfo) ? degreeInfo : Array.isArray(degreeInfo?.data) ? degreeInfo.data : [];
    const MonthYearData = Array.isArray(Month_Year_Info) ? Month_Year_Info : Array.isArray(Month_Year_Info?.data) ? Month_Year_Info.data : [];

    // const DegreeData = degreeMaster.filter(degree => degree.Flg === 'Y');

    console.log('Degree Master Array:', Month_Year_Info);

    // Check if user exists when data arrives
    useEffect(() => {
        if (userExistData && checkEvaId) {
            console.log('User Existence Check - Eva_Id:', checkEvaId);
            console.log('User Existence Check - Response:', userExistData);
            console.log('User Existence Check - Data Array:', userExistData.data);
            console.log('User Existence Check - Data Length:', userExistData.data?.length);

            if (userExistData.data && Array.isArray(userExistData.data) && userExistData.data.length > 0) {
                console.log('User EXISTS - Setting error');
                setErrors(prev => ({ ...prev, Eva_Id: `User ID "${checkEvaId}" already exists! Please enter a different User ID.` }));
                setFormData(prev => ({ ...prev, Eva_Id: '' }));
                // Set focus to User ID field
                setTimeout(() => {
                    if (evaIdRef.current) {
                        evaIdRef.current.focus();
                    }
                }, 100);
            } else {
                console.log('User DOES NOT exist - Clearing any previous errors');
                // Only clear Eva_Id error, not all errors
                if (errors.Eva_Id && errors.Eva_Id.includes('already exists')) {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.Eva_Id;
                        return newErrors;
                    });
                }
            }
            // Clear check state after processing
            setCheckEvaId('');
        }
    }, [userExistData]);

    // useEffect(() => {
    //     if (userExistError) {
    //         console.error('Error checking user existence:', userExistError);
    //         setErrors(prev => ({ ...prev, Eva_Id: 'Error checking user ID' }));
    //     }
    // }, [userExistError]);

    // Update form data when initialData changes (for edit mode)
    useEffect(() => {
        if (show) {
            // Clear all fields when modal opens
            if (mode === 'add') {
                setFormData({ Eva_Id: '', FACULTY_NAME: '', Email_Id: '', Mobile_Number: '', Role: '' });
                setSelectedRole('');
                setSelectedSubjects([]);
                setSubjectSearch('');
                setShowSubjectDropdown(false);
                setErrors({});
                setCheckEvaId(''); // Clear the user existence check state
            } else {
                // For edit mode, load existing data
                setFormData(initialData);
                if (initialData.Role) {
                    setSelectedRole(initialData.Role);
                } else {
                    setSelectedRole('');
                }
                setErrors({});
                setCheckEvaId(''); // Clear the user existence check state
            }
        }
    }, [show, mode, initialData]);

    // Console log selected role whenever it changes
    useEffect(() => {
        if (selectedRole) {
            const roleName = roleMaster.find(r => r.id === selectedRole)?.name || selectedRole;
            console.log('Selected Role:', selectedRole, '-', roleName);
        }
    }, [selectedRole]);

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
    };

    // Trigger user existence check
    const checkUserExistence = (Eva_Id) => {
        if (Eva_Id && Eva_Id.trim()) {
            setCheckEvaId(Eva_Id);
        } else {
            setCheckEvaId('');
            setErrors(prev => ({ ...prev, Eva_Id: '' }));
        }
    };

    // Handle Subject Selection
    const handleSubjectToggle = (subject) => {
        const isSelected = selectedSubjects.find(s => s.Subcode === subject.Subcode);
        let updatedSubjects;

        if (isSelected) {
            updatedSubjects = selectedSubjects.filter(s => s.Subcode !== subject.Subcode);
        } else {
            updatedSubjects = [...selectedSubjects, subject];
        }

        setSelectedSubjects(updatedSubjects);
        setFormData({
            ...formData,
            Subject_Codes: updatedSubjects.map(s => s.Subcode).join(','),
            Subject_Names: updatedSubjects.map(s => s.SUBNAME).join(', ')
        });

        // Clear Subject_Codes error if subjects are selected
        if (updatedSubjects.length > 0 && errors.Subject_Codes) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.Subject_Codes;
                return newErrors;
            });
        }

        // Close dropdown after selection
        setShowSubjectDropdown(false);
        setSubjectSearch('');
    };

    // Remove selected subject
    const removeSubject = (subcode) => {
        const updatedSubjects = selectedSubjects.filter(s => s.Subcode !== subcode);
        setSelectedSubjects(updatedSubjects);
        setFormData({
            ...formData,
            Subject_Codes: updatedSubjects.map(s => s.Subcode).join(','),
            Subject_Names: updatedSubjects.map(s => s.SUBNAME).join(', ')
        });

        // Clear Subject_Codes error if subjects are still selected after removal
        if (updatedSubjects.length > 0 && errors.Subject_Codes) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.Subject_Codes;
                return newErrors;
            });
        }
    };

    // Filter subjects based on search
    const getFilteredSubjects = () => {
        const subjects = Array.isArray(subjectData) ? subjectData :
            Array.isArray(subjectData?.data) ? subjectData.data : [];

        if (!subjectSearch.trim()) return subjects;

        return subjects.filter(subject =>
            subject.Subcode?.toLowerCase().includes(subjectSearch.toLowerCase()) ||
            subject.SUBNAME?.toLowerCase().includes(subjectSearch.toLowerCase())
        );
    };

    // Validate Form
    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!selectedRole) {
            newErrors.Role = 'Role is required';
        }
        if (!formData.Dep_Name) {
            newErrors.Dep_Name = 'Department Name is required';
        }
        if (!formData.Eva_Mon_Month) {
            newErrors.Eva_Mon_Month = 'Evaluation Month is required';
        }
        if (!formData.Eva_Mon_Year) {
            newErrors.Eva_Mon_Year = 'Evaluation Year is required';
        }
        if (!formData.Eva_Id?.trim()) {
            newErrors.Eva_Id = 'User ID is required';
        }
        if (!formData.FACULTY_NAME?.trim()) {
            newErrors.FACULTY_NAME = 'Name is required';
        }

        // Email validation - now required
        if (!formData.Email_Id?.trim()) {
            newErrors.Email_Id = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.Email_Id)) {
                newErrors.Email_Id = 'Please enter a valid email address';
            }
        }

        // Mobile number validation - now required
        if (!formData.Mobile_Number?.trim()) {
            newErrors.Mobile_Number = 'Mobile number is required';
        } else {
            const mobileRegex = /^[0-9]{10}$/;
            if (!mobileRegex.test(formData.Mobile_Number)) {
                newErrors.Mobile_Number = 'Mobile number must be 10 digits';
            }
        }
        if (selectedRole == 1 && !formData.Subject_Code) {
            newErrors.Subject_Code = 'Subject Code is required for Chief Examiner role';
        }
        if (selectedRole == 2 && selectedSubjects.length === 0) {
            newErrors.Subject_Codes = 'At least one Subject Code is required for Examiner role';
        }
        if((selectedRole == 1 || selectedRole == 2 || selectedRole == 4) && !formData.Camp_Id){
            newErrors.Camp_Id = 'Camp ID is required for Chief Examiner, Examiner, and another role';
        }
        if((selectedRole == 1 || selectedRole == 2) && !formData.Camp_Officer_Id){
            newErrors.Camp_Officer_Id = 'Camp Officer ID is required for Chief Examiner and Examiner roles';
        }
        if(selectedRole == 1  && !formData.Examiner_Id){
            newErrors.Examiner_Id = 'Examiner ID is required for Chief Examiner role';
        }
        if((selectedRole ==1 || selectedRole == 2) && !formData.Evaluation_Type){
            newErrors.Evaluation_Type = 'Evaluation Type is required for Chief Examiner and Examiner roles';
        }
        if(selectedRole == 2 && !formData.Maximum_Paper_in_Day){
            newErrors.Maximum_Paper_in_Day = 'Maximum Paper in Day is required for Examiner role';
        }
        if(selectedRole == 2 && !formData.Total_Paper_In_Each_Subject){
            newErrors.Total_Paper_In_Each_Subject = 'Total Paper in Each Subject is required for Examiner role';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle Save
    const handleSave = async () => {
       // formData.Dep_Name = '01';

        // Check if user already exists error is present
        if (errors.Eva_Id && errors.Eva_Id.includes('already exists')) {
            setMessage({ type: 'danger', text: 'Cannot add user. User ID already exists. Please enter a different User ID.' });
            if (evaIdRef.current) {
                evaIdRef.current.focus();
            }
            return;
        }

        if (!validateForm()) {
            setMessage({ type: 'danger', text: 'Please fill all required fields correctly.' });
            return;
        }
        
        try {
            console.log("data before submitted", formData);
            const result = await addNewUser(formData).unwrap();
            console.log("data when submitted", result);
            
            // Show success message
            setMessage({ type: 'success', text: 'User added successfully!' });
            
            // Clear form and close modal after 1.5 seconds
            setTimeout(() => {
                setFormData(initialData);
                setSelectedRole('');
                setSelectedSubjects([]);
                setSubjectSearch('');
                setErrors({});
                setMessage({ type: '', text: '' });
                onHide();
            }, 1500);
            
        } catch (error) {
            console.error('Error adding user:', error);
            setMessage({ 
                type: 'danger', 
                text: error?.data?.message || 'Failed to add user. Please try again.' 
            });
        }
    };

    // Handle Modal Close
    const handleClose = () => {
        setFormData(initialData);
        setSelectedRole('');
        setSelectedSubjects([]);
        setSubjectSearch('');
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
                    {mode === 'add' ? 'Add New User' : 'Edit User'}
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
                            {roleMaster.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.Role}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="row">
                        <div className="col-md-6">

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Department Name <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="Dep_Name"
                                    value={formData.Dep_Name || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter department name"
                                    isInvalid={!!errors.Dep_Name}
                                >
                                    <option value="">-- Select Department --</option>
                                    {Array.isArray(DegreeData) && DegreeData.map((dept) => dept.Flg === 'Y' && (
                                        <option key={dept.D_Code} value={dept.D_Code}>
                                            {dept.Degree_Name}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.Degree_Name}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </div>

                        <div className="col-md-3">

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Evaluation Month <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="Eva_Mon_Month"
                                    value={formData.Eva_Mon_Month || ''}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.Eva_Mon_Month}
                                >
                                    <option value="">-- Select Month --</option>
                                {Array.isArray(MonthYearData) &&
                                    MonthYearData
                                        .filter(item => item.Month_Year_Status === 'Y')
                                        .filter((item, idx, arr) => arr.findIndex(x => x.Eva_Month === item.Eva_Month) === idx)
                                        .map((item) => (
                                            <option key={item.Eva_Month} value={item.Eva_Month}>
                                                {item.Eva_Month}
                                            </option>
                                        ))
                                }
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.Eva_Mon_Month}
                                </Form.Control.Feedback>
                            </Form.Group>

                        </div>

                        <div className="col-md-3">

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    Evaluation Year <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    name="Eva_Mon_Year"
                                    value={formData.Eva_Mon_Year || ''}
                                    onChange={handleInputChange}
                                    isInvalid={!!errors.Eva_Mon_Year}
                                >
                                    <option value="">-- Select Year --</option>
                                {Array.isArray(MonthYearData) &&
                                    MonthYearData
                                        .filter(item => item.Month_Year_Status === 'Y')
                                        .filter((item, idx, arr) => arr.findIndex(x => x.Eva_Year === item.Eva_Year) === idx)
                                        .map((item) => (
                                            <option key={item.Eva_Year} value={item.Eva_Year}>
                                                {item.Eva_Year_Desc}
                                            </option>
                                        ))
                                }
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">
                                    {errors.Eva_Mon_Year}
                                </Form.Control.Feedback>
                            </Form.Group>

                        </div>

                    </div>


                    {/* Basic User Information */}
                    {(selectedRole == 0 || selectedRole == 6 || selectedRole == 5 || selectedRole == 4 || selectedRole == 1 || selectedRole == 2) && (
                        <div>
                            <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            User ID <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Eva_Id"
                                            value={formData.Eva_Id || ''}
                                            onChange={handleInputChange}
                                            onBlur={(e) => checkUserExistence(e.target.value)}
                                            placeholder="Enter user ID"
                                            isInvalid={!!errors.Eva_Id}
                                            ref={evaIdRef}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.Eva_Id}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>

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
                            </div>

                            <div className="row">
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
                                            maxLength="10"
                                            isInvalid={!!errors.Mobile_Number}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.Mobile_Number}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </div>

                            {
                                (selectedRole == 4 ) && (
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>
                                                    Camp ID <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="Camp_Id"
                                                    value={formData.Camp_Id || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter Camp ID"
                                                    isInvalid={!!errors.Camp_Id}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.Camp_Id}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>
                                    </div>
                            )}

                            {/* <div className="row">
                                <div className="col-md-6">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="Date"
                                            value={formData.Date || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter date"
                                        />
                                    </Form.Group>
                                </div>
                            </div> */}

                            {/* Examiner/Chief Examiner Additional Fields */}
                            {(selectedRole == 1 || selectedRole == 2) && (
                                <>
                                    <hr className="my-4" />

                                    <div className="row ">
                                        <div className="col-md-6">
                                            {/* Chief Examiner (Role 1) - Single Selection with Search */}
                                            {selectedRole == 1 && (
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Subject Code</Form.Label>

                                                    {/* Search Input */}
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Search subjects..."
                                                            value={subjectSearch}
                                                            onChange={(e) => setSubjectSearch(e.target.value)}
                                                            onFocus={() => setShowSubjectDropdown(true)}
                                                            onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                                                        />

                                                        {/* Display selected subject */}
                                                        {formData.Subject_Code && !showSubjectDropdown && (
                                                            <div className="mt-2 p-2 border rounded bg-light d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <small className="text-muted">Selected: </small>
                                                                    <span className="fw-bold">{formData.Subject_Code}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => {
                                                                        setFormData({ ...formData, Subject_Code: '' });
                                                                        setSubjectSearch('');
                                                                    }}
                                                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                                                >
                                                                    <i className="bi bi-x-circle"></i> Remove
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Dropdown List */}
                                                        {showSubjectDropdown && (
                                                            <div
                                                                className="border rounded bg-white position-absolute w-100 shadow-sm"
                                                                style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
                                                            >
                                                                {getFilteredSubjects().length > 0 ? (
                                                                    getFilteredSubjects().map((subject) => (
                                                                        <div
                                                                            key={subject.Subcode}
                                                                            className="p-2 border-bottom cursor-pointer hover-bg-light"
                                                                            onClick={() => {
                                                                                setFormData({ ...formData, Subject_Code: subject.Subcode });
                                                                                setShowSubjectDropdown(false);
                                                                                setSubjectSearch('');
                                                                                // Clear Subject_Code error
                                                                                if (errors.Subject_Code) {
                                                                                    setErrors(prev => {
                                                                                        const newErrors = { ...prev };
                                                                                        delete newErrors.Subject_Code;
                                                                                        return newErrors;
                                                                                    });
                                                                                }
                                                                            }}
                                                                            style={{ cursor: 'pointer' }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                                        >
                                                                            <span className="small">{subject.Subcode} - {subject.SUBNAME}</span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-2 text-muted text-center">No subjects found</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {errors.Subject_Code && (
                                                        <Form.Control.Feedback type="invalid" className="d-block">
                                                            {errors.Subject_Code}
                                                        </Form.Control.Feedback>
                                                    )}
                                                </Form.Group>
                                            )}

                                            {/* Examiner (Role 2) - Multiple Selection */}
                                            {selectedRole == 2 && (
                                                <Form.Group className="mb-3">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <Form.Label className="mb-0">Subject Code (Multiple Selection)</Form.Label>
                                                        {selectedSubjects.length > 0 && (
                                                            <small className="text-primary fw-bold">
                                                                {selectedSubjects.length} selected
                                                            </small>
                                                        )}
                                                    </div>

                                                    {/* Selected Subjects Display */}
                                                    {selectedSubjects.length > 0 && (
                                                        <div className="mb-2 p-2 border rounded bg-light">
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {selectedSubjects.map((subject) => (
                                                                    <span
                                                                        key={subject.Subcode}
                                                                        className="badge bg-primary d-inline-flex align-items-center gap-1 py-1 px-2"
                                                                        style={{ fontSize: '0.85rem' }}
                                                                    >
                                                                        <span>{subject.Subcode}</span>
                                                                        <button
                                                                            type="button"
                                                                            className="btn-close btn-close-white"
                                                                            style={{ fontSize: '0.6rem', width: '0.5rem', height: '0.5rem' }}
                                                                            onClick={() => removeSubject(subject.Subcode)}
                                                                            aria-label="Remove"
                                                                        ></button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Search Input */}
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={selectedSubjects.length > 0 ? "Click to add more subjects..." : "Search subjects..."}
                                                            value={subjectSearch}
                                                            onChange={(e) => setSubjectSearch(e.target.value)}
                                                            onFocus={() => setShowSubjectDropdown(true)}
                                                            onBlur={() => setTimeout(() => setShowSubjectDropdown(false), 200)}
                                                        />

                                                        {/* Dropdown List */}
                                                        {showSubjectDropdown && (
                                                            <div
                                                                className="border rounded bg-white position-absolute w-100 shadow-sm"
                                                                style={{ maxHeight: '200px', overflowY: 'auto', zIndex: 1000 }}
                                                            >
                                                                {getFilteredSubjects().length > 0 ? (
                                                                    getFilteredSubjects().map((subject) => (
                                                                        <div
                                                                            key={subject.Subcode}
                                                                            className="p-2 border-bottom cursor-pointer hover-bg-light d-flex align-items-center"
                                                                            onClick={() => handleSubjectToggle(subject)}
                                                                            style={{ cursor: 'pointer' }}
                                                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                                        >
                                                                            <Form.Check
                                                                                type="checkbox"
                                                                                checked={selectedSubjects.some(s => s.Subcode === subject.Subcode)}
                                                                                onChange={() => { }}
                                                                                className="me-2"
                                                                            />
                                                                            <span className="small">{subject.Subcode} - {subject.SUBNAME}</span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-2 text-muted text-center">No subjects found</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {errors.Subject_Codes && (
                                                        <Form.Control.Feedback type="invalid" className="d-block">
                                                            {errors.Subject_Codes}
                                                        </Form.Control.Feedback>
                                                    )}
                                                    {!errors.Subject_Codes && selectedSubjects.length === 0 && (
                                                        <small className="text-muted d-block mt-1">No subjects selected</small>
                                                    )}
                                                </Form.Group>
                                            )}
                                        </div>

                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Evaluation Type</Form.Label>
                                                <Form.Select
                                                    name="Evaluation_Type"
                                                    value={formData.Evaluation_Type || ''}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="">-- Select Type --</option>
                                                    <option value="1">Evaluation - 1</option>
                                                    <option value="2">Evaluation - 2</option>
                                                    <option value="3">Evaluation - 3</option>
                                                    <option value="4">Evaluation - 4</option>
                                                </Form.Select>
                                                {errors.Evaluation_Type && (
                                                    <Form.Control.Feedback type="invalid" className="d-block">
                                                        {errors.Evaluation_Type}
                                                    </Form.Control.Feedback>
                                                )}
                                            </Form.Group>
                                        </div>

                                    </div>

                                    {selectedRole == 2 && (
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Maximum Paper in Day</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="Maximum_Paper_in_Day"
                                                        value={formData.Maximum_Paper_in_Day || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter maximum paper in day"
                                                        isInvalid={!!errors.Maximum_Paper_in_Day}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.Maximum_Paper_in_Day}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>

                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Total Paper In Each Subject</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="Total_Paper_In_Each_Subject"
                                                        value={formData.Total_Paper_In_Each_Subject || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter total paper in each subject"
                                                        isInvalid={!!errors.Total_Paper_In_Each_Subject}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.Total_Paper_In_Each_Subject}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                        </div>

                                    )}
                                    <div className="row">
                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Camp Officer Id</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="Camp_Officer_Id"
                                                    value={formData.Camp_Officer_Id || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter camp officer id"
                                                    isInvalid={!!errors.Camp_Officer_Id}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.Camp_Officer_Id}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </div>

                                        <div className="col-md-6">
                                            <Form.Group className="mb-3">
                                                <Form.Label>Camp Id</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="Camp_Id"
                                                    value={formData.Camp_Id || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter camp id"
                                                    isInvalid={!!errors.Camp_Id}
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {errors.Camp_Id}
                                                </Form.Control.Feedback>    
                                            </Form.Group>
                                        </div>
                                    </div>

                                    {selectedRole == 1 && (
                                        <div className="row">
                                            <div className="col-md-6">
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Examiner Id</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="Examiner_Id"
                                                        value={formData.Examiner_Id || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="Enter examiner id"
                                                        isInvalid={!!errors.Examiner_Id}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {errors.Examiner_Id}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </div>
                                        </div>

                                    )}
                                </>
                            )}
                        </div>
                    )}


                </Form>
            </Modal.Body>

            <Modal.Footer className="bg-light border-top d-flex justify-content-between align-items-center py-3 px-4">
                <div className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    {mode === 'add' ? 'Fill all required fields marked with *' : 'Update user information'}
                </div>
                <div className="d-flex gap-2">
                    <Button
                        variant="outline-secondary"
                        onClick={handleClose}
                        className="px-4"
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        className="px-4"
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-2"></i>
                                {mode === 'add' ? 'Add User' : 'Save Changes'}
                            </>
                        )}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default UserRoleModal;
