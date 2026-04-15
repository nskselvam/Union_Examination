import React, { useState, useEffect } from 'react'
import { Card, Button, Form, Row, Col } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useSelector } from 'react-redux'
import { FaCalendarAlt, FaFileInvoiceDollar, FaSpinner, FaUniversity } from 'react-icons/fa'
import UploadPageLayout from '../../components/DashboardComponents/UploadPageLayout'
import ExaminerBankModal from '../../components/modals/ExaminerBankModal'
import ExaminerPaymentModal from '../../components/modals/ExaminerPaymentModal_New'
import ChiefExaminerPaymentModal from '../../components/modals/ChiefExaminerPaymentModal_New'
import { useGetUserBankDetailsStaffQuery, useGetTadaAllowanceQuery, useGetCampusDetailsQuery } from '../../redux-slice/userDashboardSlice'
import { add, set } from 'date-fns'


const ExaminerPaypdf = () => {
    const [fromDate, setFromDate] = useState(new Date(2025, 0, 1)); // 01-01-2025
    const [endDate, setEndDate] = useState(new Date()); // Current date
    const [loading, setLoading] = useState(false);
    const [ExaminerAccount, setExaminerAccount] = useState(false);
    const [showBankModal, setShowBankModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showChiefPaymentModal, setShowChiefPaymentModal] = useState(false);
    const [valuationRecords, setValuationRecords] = useState([]);
    const [eligibilityChecked, setEligibilityChecked] = useState(false);
    const [daType, setDaType] = useState('0');
    const [datypetext, setDaTypeText] = useState('');
    const [daAmount, setDaAmount] = useState(0);
    const [daadditionalAmount, setDaAdditionalAmount] = useState(0);
    const [taType, setTaType] = useState('1');
    const [taAmount, setTaAmount] = useState(0);
    const [campId, setCampId] = useState('');
    const [campOfficerId, setCampOfficerId] = useState('');
    const [examinerType, setExaminerType] = useState('1');
    const [valuationType, setValuationType] = useState('1');
    const [campusName, setCampusName] = useState('');
    const [degreeName, setDegreeName] = useState('');
    const [noDays, setNoDays] = useState(0);
    const [errorRemarks, setErrorRemarks] = useState('');
    const [bankDetails, setBankDetails] = useState({
        EMPLOYEE_NAME: '',
        BANK_ACCOUNT_NUMBER: '',
        BANK_NAME: '',
        IFSC: '',
        BRANCH: '',
        NATUREOFBANK: '',
        Type_Edit: true,
        Evaluator_Id: '',
        branchAddress: ''
    });

    // Open modal when ExaminerAccount is false on component load
    const userInfo = useSelector((state) => state.auth.userInfo);
    const userRole = userInfo?.selected_role || '';

    const { data: bankDetailsStaffData, error: bankDetailsStaffError, isLoading: bankDetailsStaffLoading } = useGetUserBankDetailsStaffQuery(
        {
            "Eva_id": userInfo?.username
        }
    );
    const { data: tadaAllowanceData, error: tadaAllowanceError, isLoading: tadaAllowanceLoading } = useGetTadaAllowanceQuery(
        {
            "depcode": userInfo?.selected_course === "02" ? userInfo?.selected_dept : "01"
        }
    );
    const { data: campusDetailsData, error: campusDetailsError, isLoading: campusDetailsLoading } = useGetCampusDetailsQuery();
    console.log("campusDetailsData", campusDetailsData);

    console.log("tadaAllowanceData", tadaAllowanceData);

    const CampID = userRole === '2' ? (userInfo?.Camp_id ? [...new Set(userInfo.Camp_id.split(','))] : []) : (userInfo?.Camp_id_chief ? [...new Set(userInfo.Camp_id_chief.split(','))] : []);
      const CampOfficeridExaminer = userRole === '2' ? (userInfo?.camp_offcer_id_examiner ? [...new Set(userInfo.camp_offcer_id_examiner.split(','))] : []) : (userInfo?.camp_offcer_id_chief ? [...new Set(userInfo.camp_offcer_id_chief.split(','))] : []);

    // const CampID = userRole == '2' ? (userInfo?.Camp_id ? userInfo.Camp_id.split(',').map(id => id.trim()) : []) : (userInfo?.Camp_id_chief ? userInfo.Camp_id_chief.split(',').map(id => id.trim()) : []);
    // const CampOfficeridExaminer = userRole == '2' ? (userInfo?.camp_offcer_id_examiner ? userInfo.camp_offcer_id_examiner.split(',').map(id => id.trim()) : []) : (userInfo?.camp_offcer_id_chief ? userInfo.camp_offcer_id_chief.split(',').map(id => id.trim()) : []);

      console.log("CampID", CampID);
        console.log("CampOfficeridExaminer", CampOfficeridExaminer);

    // Combine CampID and CampOfficeridExaminer into paired values
    const Camp_Details = CampID.map((campId, index) => {
        const officerId = CampOfficeridExaminer[index] || CampOfficeridExaminer[0] || '';
        return {
            value: `${campId}-${officerId}`,
            campId: campId,
            campOfficerId: officerId,
            displayText: `${campId} - ${officerId}`
        };
    });

    console.log("Camp_Details", Camp_Details);

    console.log("User Role:", userRole);

    // Set examiner type from userInfo
    useEffect(() => {
        if (userInfo?.selected_role) {
            setExaminerType(userInfo.selected_role);
        }
    }, [userInfo?.selected_role]);

    // Set initial campId and campOfficerId from combined data
    useEffect(() => {
        if (Camp_Details.length > 0 && !campId) {
            const firstItem = Camp_Details[0];
            setCampId(firstItem.campId);
            setCampOfficerId(firstItem.campOfficerId);
        }
    }, [Camp_Details.length]);

    // Set initial campus name from campusDetailsData
    useEffect(() => {
        if (campusDetailsData && campusDetailsData.length > 0 && !campusName) {
            setCampusName(campusDetailsData[0].campus_Name);
        }
    }, [campusDetailsData]);

    useEffect(() => {
        if (bankDetailsStaffData && bankDetailsStaffError === undefined) {
            setExaminerAccount(true);
            setBankDetails({ ...bankDetailsStaffData });
            setBankDetails({ ...bankDetailsStaffData, Type_Edit: true });
        } else if (bankDetailsStaffData && !bankDetailsStaffData.data) {
            setShowBankModal(true);
            setBankDetails({ ...bankDetails, Type_Edit: false, Evaluator_Id: userInfo ? userInfo.username : '' });
        } else if (bankDetailsStaffError) {
            setShowBankModal(true);
            setBankDetails({ ...bankDetails, Type_Edit: false, Evaluator_Id: userInfo ? userInfo.username : '' });
        }
    }, [bankDetailsStaffData, bankDetailsStaffError]);

    console.log("bankDetailsStaffData", bankDetails);
    // Handle modal close
    const handleCloseModal = () => {
        setShowBankModal(false);
    };

    const handlePaymentCloseModal = () => {
        setShowPaymentModal(false);
    };

    const handleChiefPaymentCloseModal = () => {
        setShowChiefPaymentModal(false);
    };
    // Handle successful bank account submission
    const handleBankAccountSuccess = (updatedDetails) => {
        console.log('Updated bank details received:', updatedDetails);
        setExaminerAccount(true);
        setShowBankModal(false);

        // Update local bank details state with the new data
        if (updatedDetails) {
            setBankDetails({
                EMPLOYEE_NAME: updatedDetails.accountHolderName || updatedDetails.EMPLOYEE_NAME,
                BANK_ACCOUNT_NUMBER: updatedDetails.accountNumber || updatedDetails.BANK_ACCOUNT_NUMBER,
                BANK_NAME: updatedDetails.bankName || updatedDetails.BANK_NAME,
                IFSC: updatedDetails.ifscCode || updatedDetails.IFSC,
                BRANCH: updatedDetails.branchName || updatedDetails.BRANCH,
                NATUREOFBANK: updatedDetails.accountType || updatedDetails.NATUREOFBANK,
                BANK_ADDRESS: updatedDetails.branchAddress || updatedDetails.BANK_ADDRESS || '',
                Type_Edit: true,
                Evaluator_Id: updatedDetails.Evaluator_Id || userInfo?.username
            });
        }
    };

    // Format date to DD/MM/YYYY
    const formatDate = (date) => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };


    // Handle report generation

    const dahandle = (e, value) => {
        setDaType(value);
        setDaTypeText(e.target.options[e.target.selectedIndex].text);

        console.log("Selected DA Type:", value);
        const selectedDa = tadaAllowanceData.find(da => da.id.toString() === value);
        if (selectedDa) {
            const remuneration = parseFloat(selectedDa.accomodation_cost) || 0;
            const dearnessalowance = parseFloat(selectedDa.dearnessallowance) || 0;
            setDaAdditionalAmount(remuneration);
            setDaAmount(dearnessalowance);
        } else {
            setDaAdditionalAmount(0);
            setDaAmount(0);
        }
    };

    const handleeligibility = (e, checked) => {
        setEligibilityChecked(checked);
        if (!checked) {
            setDaType('0');
            setDaTypeText('');
            setDaAmount(0);
            setDaAdditionalAmount(0);
        }
    };
    const handleGenerateReport = () => {




        if (!fromDate || !endDate) {
            alert('Please select both From Date and End Date');
            return;
        }
        if (fromDate > endDate) {
            alert('From Date cannot be greater than End Date');
            return;
        }

        // Check if date range is within 30 days
        // Create dates at start of day to get accurate day count
        const startOfFromDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
        const startOfEndDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        const diffTime = startOfEndDate - startOfFromDate;
        // Add 1 to include both start and end dates (inclusive count)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays > 30) {
            setErrorRemarks(`Report can only be generated for a maximum of 30 days. You selected ${diffDays} days. Please select a date range within 30 days.`);
            return;
        }

        if (degreeName === '') {
            setErrorRemarks('Please Degree Name');
            return;
        }
        if (campusName === '' || campusName === 'Select Campus') {
            setErrorRemarks('Please select Campus');
            return;
        }
        console.log("eligibilityChecked", eligibilityChecked);
        if (eligibilityChecked === true) {
            if (daType === '0') {
                setErrorRemarks('Please select DA Type');
                return;
            }
            if (daAmount === 0 && daAdditionalAmount === 0) {
                setErrorRemarks('Selected DA Type has zero amount. Please select a valid DA Type.');
                return;
            }
        }



        // console.log('Date difference - From:', startOfFromDate, 'To:', startOfEndDate, 'Days:', diffDays);


        setNoDays(diffDays);

        // Show alert with selected dates
        // alert(`From Date: ${formatDate(fromDate)}\nEnd Date: ${formatDate(endDate)}`);

        setLoading(true);
       
        // TODO: Add API call for payment report generation
        if (userRole === '2') {
        setShowPaymentModal(true);
        } else if (userRole === '1') {
        setShowChiefPaymentModal(true);
        }
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    // Custom input for DatePicker - shows full DD/MM/YYYY
    const CustomDateInput = React.forwardRef((props, ref) => {
        return (
            <div className="position-relative" style={{ cursor: 'pointer' }}>
                <Form.Control
                    {...props}
                    ref={ref}
                    type="text"
                    readOnly
                    style={{
                        cursor: 'pointer',
                        paddingRight: '40px',
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '2px solid #e0e0e0',
                        padding: '12px 15px',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        minWidth: '150px',
                        letterSpacing: '1px'
                    }}
                    className="date-input-custom"
                />
                <FaCalendarAlt
                    style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6c63ff',
                        fontSize: '18px',
                        pointerEvents: 'none'
                    }}
                />
            </div>
        );
    });

    return (
        <>

            <style>
                {`
                    .react-datepicker-wrapper {
                        width: 100%;
                        display: block;
                    }
                    .react-datepicker__input-container {
                        width: 100%;
                        display: block;
                    }
                    .react-datepicker-popper {
                        position: absolute !important;
                    }
                    .date-input-custom:focus {
                        border-color: #17a2b8 !important;
                        box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.15) !important;
                    }
                    .date-input-custom:hover {
                        border-color: #17a2b8;
                    }
                    .react-datepicker {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        border: none;
                        border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
                    }
                    .react-datepicker__header {
                        background: linear-gradient(135deg, #87CEEB 0%, #17a2b8 100%);
                        border-bottom: none;
                        border-radius: 12px 12px 0 0;
                        padding: 15px;
                    }
                    .react-datepicker__current-month {
                        color: #fff;
                        font-weight: 600;
                        font-size: 16px;
                    }
                    .react-datepicker__day-name {
                        color: rgba(255, 255, 255, 0.9);
                        font-weight: 500;
                    }
                    .react-datepicker__day {
                        border-radius: 8px;
                        transition: all 0.2s ease;
                    }
                    .react-datepicker__day:hover {
                        background: #e0f7fa;
                        color: #17a2b8;
                    }
                    .react-datepicker__day--selected {
                        background: linear-gradient(135deg, #87CEEB 0%, #17a2b8 100%) !important;
                        color: #fff !important;
                        font-weight: 600;
                    }
                    .react-datepicker__day--keyboard-selected {
                        background: #e0f7fa;
                        color: #17a2b8;
                    }
                    .react-datepicker__navigation-icon::before {
                        border-color: #fff;
                    }
                    .react-datepicker__triangle {
                        display: none;
                    }
                    .react-datepicker-popper {
                        z-index: 9999 !important;
                    }
                    .payment-card {
                        border: none;
                        border-radius: 16px;
                        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                        overflow: visible;
                        min-height: 400px;
                    }
                    .payment-card .card-body {
                        padding: 30px;
                        overflow: visible;
                        padding-bottom: 320px;
                    }
                    .generate-btn {
                        background: linear-gradient(135deg, #87CEEB 0%, #17a2b8 100%);
                        border: none;
                        border-radius: 10px;
                        padding: 14px 28px;
                        font-weight: 600;
                        font-size: 15px;
                        letter-spacing: 0.5px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
                    }
                    .generate-btn:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(23, 162, 184, 0.4);
                        background: linear-gradient(135deg, #5bc0de 0%, #138496 100%);
                    }
                    .generate-btn:disabled {
                        background: #ccc;
                        box-shadow: none;
                    }
                    .date-label {
                        color: #333;
                        font-weight: 600;
                        font-size: 14px;
                        margin-bottom: 8px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .date-label-icon {
                        color: #17a2b8;
                    }
                `}
            </style>
            <UploadPageLayout
                mainTopic="Payment Generation Report"
                subTopic="Generate payment reports for completed valuations"
                cardTitle={ExaminerAccount ? "Payment Report" : "Bank Details"}
                >

                {!ExaminerAccount ? (
                    <Card className="payment-card">
                        <Card.Body>
                            <Row className="align-items-end g-4">
                                <Col md={12} className="text-center">
                                    <h5>Please add your bank account details to generate payment reports.</h5>
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowBankModal(true)}
                                        className="mt-3 d-flex align-items-center gap-2 mx-auto"
                                        style={{
                                            background: 'linear-gradient(135deg, #87CEEB 0%, #17a2b8 100%)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            padding: '12px 25px',
                                            fontWeight: '600'
                                        }}
                                    >
                                        <FaUniversity />
                                        Add Bank Details
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ) : (

                    <Card className="payment-card">
                        <Card.Body>

                            {(bankDetailsStaffData || bankDetails.BANK_ACCOUNT_NUMBER) && (
                                <Row className="mb-4">
                                    <Col md={12}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '2px solid #90caf9'
                                        }}>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h6 className="mb-0" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                                                    <FaUniversity className="me-2" />
                                                    Registered Bank Details
                                                </h6>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => setShowBankModal(true)}
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        padding: '6px 16px'
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                            <Row>
                                                <Col md={6} className="mb-2">
                                                    <strong style={{ color: '#0d47a1' }}>Employee Name:</strong>
                                                    <span className="ms-2">{bankDetails.EMPLOYEE_NAME || 'N/A'}</span>
                                                </Col>
                                                <Col md={6} className="mb-2">
                                                    <strong style={{ color: '#0d47a1' }}>Account Number:</strong>
                                                    <span className="ms-2">{bankDetails.BANK_ACCOUNT_NUMBER || 'N/A'}</span>
                                                </Col>
                                                <Col md={6} className="mb-2">
                                                    <strong style={{ color: '#0d47a1' }}>Bank Name:</strong>
                                                    <span className="ms-2">{bankDetails.BANK_NAME || 'N/A'}</span>
                                                </Col>
                                                <Col md={6} className="mb-2">
                                                    <strong style={{ color: '#0d47a1' }}>IFSC Code:</strong>
                                                    <span className="ms-2">{bankDetails.IFSC || 'N/A'}</span>
                                                </Col>
                                                <Col md={6} className="mb-2">
                                                    <strong style={{ color: '#0d47a1' }}>Branch:</strong>
                                                    <span className="ms-2">{bankDetails.BRANCH || 'N/A'}</span>
                                                </Col>
                                                <Col md={6} className="mb-2">
                                                    <strong style={{ color: '#0d47a1' }}>Account Type:</strong>
                                                    <span className="ms-2">{bankDetails.NATUREOFBANK || 'N/A'}</span>
                                                </Col>
                                                <Col md={12} className="mb-2">
                                                    <strong style={{ color: '#0d47a1' }}>Bank Address:</strong>
                                                    <span className="ms-2">{bankDetails.BANK_ADDRESS || 'N/A'}</span>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Col>
                                </Row>
                            )}
                            <Row className="mb-4">
                                <Col>
                                    <h6 className="mb-3" style={{
                                        color: '#1976d2',
                                        fontWeight: 'bold',
                                        fontSize: '16px',
                                        borderBottom: '2px solid #e3f2fd',
                                        paddingBottom: '8px'
                                    }}>
                                        📅 Select Date Range & Configuration
                                    </h6>
                                    <h6 style={{ color: 'red' }}>{errorRemarks && errorRemarks}</h6>
                                </Col>
                            </Row>
                            <div style={{
                                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                                padding: '24px',
                                borderRadius: '12px',
                                border: '2px solid #81c784',
                                boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                                marginBottom: '20px'
                            }}>
                                <Row className="align-items-end g-4">
                                    <Col md={3} style={{ position: 'relative' }}>
                                        <Form.Group>
                                            <Form.Label className="date-label">
                                                <FaCalendarAlt className="date-label-icon" />
                                                From Date
                                            </Form.Label>
                                            <DatePicker
                                                selected={fromDate}
                                                onChange={(date) => setFromDate(date)}
                                                selectsStart
                                                startDate={fromDate}
                                                endDate={endDate}
                                                minDate={new Date(2025, 0, 1)}
                                                maxDate={endDate || new Date()}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="DD/MM/YYYY"
                                                customInput={<CustomDateInput />}
                                                showPopperArrow={false}
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                popperPlacement="bottom-start"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3} style={{ position: 'relative' }}>
                                        <Form.Group>
                                            <Form.Label className="date-label">
                                                <FaCalendarAlt className="date-label-icon" />
                                                End Date
                                            </Form.Label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                selectsEnd
                                                startDate={fromDate}
                                                endDate={endDate}
                                                minDate={fromDate}
                                                maxDate={new Date()}
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="DD/MM/YYYY"
                                                customInput={<CustomDateInput />}
                                                showPopperArrow={false}
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                popperPlacement="bottom-start"
                                            />
                                        </Form.Group>
                                    </Col>

                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="date-label" style={{ fontWeight: '600' }}>
                                                🏕️ Camp & Officer Details
                                            </Form.Label>
                                            <Form.Select
                                                value={`${campId}-${campOfficerId}`}
                                                onChange={(e) => {
                                                    const selectedValue = e.target.value;
                                                    const selectedItem = Camp_Details.find(item => item.value === selectedValue);
                                                    if (selectedItem) {
                                                        setCampId(selectedItem.campId);
                                                        setCampOfficerId(selectedItem.campOfficerId);
                                                    }
                                                }}
                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #e3f2fd',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                                className="examiner-select"
                                                onFocus={(e) => e.target.style.borderColor = '#17a2b8'}
                                                onBlur={(e) => e.target.style.borderColor = '#e3f2fd'}
                                            >
                                                {Camp_Details.map((item, index) => (
                                                    <option key={index} value={item.value}>
                                                        {item.displayText}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                </Row>
                                <Row className="mt-4">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: '#2e7d32',
                                                fontSize: '13px',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                🎓 Degree
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={degreeName}
                                                placeholder="Enter Degree"
                                                onChange={(e) => setDegreeName(e.target.value)}

                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #81c784',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                                onBlur={(e) => e.target.style.borderColor = '#81c784'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: '#2e7d32',
                                                fontSize: '13px',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                🏫 Campus Name
                                            </Form.Label>
                                            <Form.Select
                                                value={campusName}
                                                onChange={(e) => setCampusName(e.target.value)}
                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #81c784',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#66bb6a'}
                                                onBlur={(e) => e.target.style.borderColor = '#81c784'}
                                            >
                                                <option value="">Select Campus</option>
                                                {
                                                    campusDetailsData &&
                                                    campusDetailsData.map((campus, index) => (
                                                        <option key={index} value={campus.campus_Name}>
                                                            {campus.campus_Name}
                                                        </option>
                                                    ))
                                                }
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                </Row>

                            </div>

                            <Row className="mt-4">
                                <Col md={12} className="d-flex justify-content-center">
                                    <div style={{
                                        background: 'linear-gradient(135deg, #fff8e1 0%, #ffe082 100%)',
                                        padding: '16px 32px',
                                        borderRadius: '12px',
                                        border: '2px solid #ffd54f',
                                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.15)'
                                    }}>
                                        <Form.Group className="mb-0">
                                            <Form.Check
                                                type="checkbox"
                                                id="eligibility-checkbox"
                                                label="✓ Confirm DA / TA Eligibility"
                                                checked={eligibilityChecked}
                                                //onChange={(e) =>  setEligibilityChecked(e.target.checked)}
                                                onChange={(e) => {handleeligibility(e, e.target.checked)}}
                                                style={{
                                                    fontSize: '15px',
                                                    fontWeight: '600',
                                                    color: '#f57c00',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </Form.Group>
                                    </div>
                                </Col>
                            </Row>

                            {eligibilityChecked && (
                                <Row className="mt-4" style={{
                                    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                                    padding: '24px',
                                    borderRadius: '12px',
                                    border: '2px solid #ce93d8',
                                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.1)'
                                }}>
                                    <Col md={12} className="mb-3">
                                        <h6 style={{
                                            color: '#6a1b9a',
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            fontSize: '15px',
                                            marginBottom: '16px'
                                        }}>
                                            💰 DA & TA Allowance Configuration
                                        </h6>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: '#6a1b9a',
                                                fontSize: '13px',
                                                textAlign: 'center',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                📊 Dearness Allowance (DA)
                                            </Form.Label>
                                            <Form.Select
                                                value={daType}
                                                //onChange={(e) => setDaType(e.target.value)}
                                                onChange={(e) => dahandle(e, e.target.value)}
                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #ce93d8',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)'
                                                }}
                                                className="da-select"
                                                onFocus={(e) => e.target.style.borderColor = '#ab47bc'}
                                                onBlur={(e) => e.target.style.borderColor = '#ce93d8'}
                                            >
                                                <option value="0">Select DA Type</option>
                                                {

                                                    tadaAllowanceData?.map((daItem, index) => (
                                                        <option key={index} value={daItem.id}>
                                                            {(!daItem.remuneration_name || daItem.remuneration_name === "" || daItem.remuneration_name === "null") ? daItem.particulars_name : `${daItem.particulars_name} - ${daItem.remuneration_name}`}
                                                        </option>
                                                    ))
                                                }

                                                {/* <option value="1">Standard DA - 100%</option>
                                                <option value="2">Reduced DA - 75%</option>
                                                <option value="3">Half DA - 50%</option>
                                                <option value="4">Minimal DA - 25%</option> */}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>

                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: '#6a1b9a',
                                                fontSize: '13px',
                                                textAlign: 'center',
                                                // display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                ₹ Additional Amount
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="₹ 0.00"
                                                value={daadditionalAmount}
                                                onChange={(e) => setDaAdditionalAmount(e.target.value)}
                                                // disabled
                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #ce93d8',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#f5f5f5',
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)',
                                                    cursor: 'not-allowed'
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: '#6a1b9a',
                                                fontSize: '13px',
                                                textAlign: 'center',
                                                // display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                ₹ Da Per Day
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="₹ 0.00"
                                                value={daAmount}
                                                onChange={(e) => setDaAmount(e.target.value)}
                                                // disabled
                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #ce93d8',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#f5f5f5',
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)',
                                                    cursor: 'not-allowed'
                                                }}
                                            />
                                        </Form.Group>
                                    </Col>

                                    {/* <Col md={4}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: '#6a1b9a',
                                                fontSize: '13px',
                                                textAlign: 'center',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                🚗 Travel Allowance (TA)
                                            </Form.Label>
                                            <Form.Select
                                                value={taType}
                                                onChange={(e) => setTaType(e.target.value)}
                                                disabled
                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #ce93d8',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)'
                                                }}
                                                className="ta-select"
                                                onFocus={(e) => e.target.style.borderColor = '#ab47bc'}
                                                onBlur={(e) => e.target.style.borderColor = '#ce93d8'}
                                            >
                                                <option value="1">Full TA - Long Distance</option>
                                                <option value="2">Standard TA - Medium</option>
                                                <option value="3">Local TA - Short Distance</option>
                                                <option value="4">Minimal TA - Campus</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={2}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '600',
                                                color: '#6a1b9a',
                                                fontSize: '13px',
                                                textAlign: 'center',
                                                display: 'block',
                                                marginBottom: '8px'
                                            }}>
                                                ₹ Amount
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                placeholder="₹ 0.00"
                                                value={taAmount}
                                                onChange={(e) => setTaAmount(e.target.value)}
                                                disabled
                                                style={{
                                                    borderRadius: '10px',
                                                    border: '2px solid #ce93d8',
                                                    padding: '12px 15px',
                                                    fontSize: '14px',
                                                    transition: 'all 0.3s ease',
                                                    backgroundColor: '#f5f5f5',
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 8px rgba(156, 39, 176, 0.1)',
                                                    cursor: 'not-allowed'
                                                }}
                                            />
                                        </Form.Group>
                                  </Col> */}
                                </Row>
                            )}

                            <Row className="mt-5">

                                <Col md={12}>
                                    <Button
                                        variant="primary"
                                        onClick={handleGenerateReport}
                                        disabled={loading || !fromDate || !endDate}
                                        className="w-100 generate-btn d-flex align-items-center justify-content-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <FaSpinner className="fa-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <FaFileInvoiceDollar />
                                                Generate Report
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}
            </UploadPageLayout>

            {/* ExaminerBankModal - Shows when ExaminerAccount is false */}
            <ExaminerBankModal
                show={showBankModal}
                onHide={handleCloseModal}
                onSuccess={handleBankAccountSuccess}
                bankDetails={bankDetails}
            />
            <ExaminerPaymentModal
                show={showPaymentModal}
                onHide={handlePaymentCloseModal}
                paymentData={{
                    fromDate: fromDate,
                    toDate: endDate,
                    campId: campId,
                    campOfficerId: campOfficerId,
                    eligibilityChecked: eligibilityChecked,
                    daAmount: daAmount,
                    taAmount: taAmount,
                    taType: taType,
                    daType: daType,
                    noDays: noDays,
                    additionalAmount: daadditionalAmount,
                    daTypeText: datypetext,
                    bankDetails: bankDetails,
                    examinerType: examinerType,
                    totalAmount: 0,
                    valuationRecords,
                    evaluatorName: userInfo?.name,
                    evaluatorId: userInfo?.username,
                    MobileNumber: userInfo?.Mobile_Number,
                    campusName: campusName,
                    degreeName: degreeName,
                    EmailId: userInfo?.Email_Id,
                }}
            />
            <ChiefExaminerPaymentModal
                show={showChiefPaymentModal}
                onHide={handleChiefPaymentCloseModal}
                paymentData={{
                    fromDate: fromDate,
                    toDate: endDate,
                    campId: campId,
                    campOfficerId: campOfficerId,
                    eligibilityChecked: eligibilityChecked,
                    daAmount: daAmount,
                    taAmount: taAmount,
                    taType: taType,
                    daType: daType,         
                    noDays: noDays,
                    additionalAmount: daadditionalAmount,
                    daTypeText: datypetext,
                    bankDetails: bankDetails,
                    examinerType: examinerType,
                    totalAmount: 0,
                    valuationRecords,
                    evaluatorName: userInfo?.name,
                    evaluatorId: userInfo?.username,
                    MobileNumber: userInfo?.Mobile_Number,
                    campusName: campusName,
                    degreeName: degreeName,
                    EmailId: userInfo?.Email_Id,
                }}
            />  
        </>
    )
}

export default ExaminerPaypdf