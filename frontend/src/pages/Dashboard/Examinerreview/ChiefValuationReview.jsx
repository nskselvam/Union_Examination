import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Pagination,
  Row,
  Col,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import UploadPageLayout from "../../../components/DashboardComponents/UploadPageLayout";
import { useGetChiefValuationReviewDataQuery } from "../../../redux-slice/valuationApiSlice";
import {
  setChiefValuationBarcodeData,
  clearChiefValuationBarcodeData,
} from "../../../redux-slice/valuationSlice";

import DashBoard from "../Common/userDetails.json";
import { Navigate } from "react-router-dom";

const ChiefValuationReview = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const chiefValuationData = useSelector(
    (state) => state.valuaton_Data_basic.chiefValuationData
  );

  const userHeader =
    DashBoard.users.find((u) => u.id === userInfo.selected_role)?.Header ||
    "Dashboard";

  const Cheif_Camp_Id = chiefValuationData
    ? chiefValuationData.camp_id_chief
    : null;
  const Cheif_Camp_Office_Id = chiefValuationData
    ? chiefValuationData.camp_office_id_chief
    : null;
  const Chief_Eva_subject_dashboard = chiefValuationData
    ? chiefValuationData.Chief_Eva_subject_dashboard
    : null;

  const Examiner_Id = userInfo ? userInfo.username : null;

  const Chief_Valuation_Type = chiefValuationData
    ? chiefValuationData.Examiner_type
    : null;

  console.log("userInfo in ChiefValuationReview: ", chiefValuationData);
  console.log("userInfo in ChiefValuationReview: ", userInfo);

  const {
    data: chiefValuationReview,
    isLoading: isLoadingChiefValuationData,
    error: errorChiefValuationData,
    refetch,
  } = useGetChiefValuationReviewDataQuery({
    subcode: chiefValuationData.chief_sub_code,
    camp_id: chiefValuationData.camp_id_chief,
    camp_office_id: chiefValuationData.camp_office_id_chief,
    Examiner_type: userInfo.selected_role,
    valuation_type: chiefValuationData.Chief_Eva_subject_dashboard,
    Eva_Id: chiefValuationData.chief_examiner,
    Eva_Mon_Year: userInfo.eva_month_year,
    RevieWFlag: "E",
    chiefValuationtype: Chief_Valuation_Type,
    Evaluator_Id: chiefValuationData.Evaluator_Id
  }, {
    refetchOnMountOrArgChange: true,  // Automatically refetch when component mounts
  });

  // Refetch data whenever component mounts or becomes visible
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Refetch data when navigating back from accept/reject actions
  useEffect(() => {
    if (location.state?.refreshData) {
      console.log("Refreshing data after accept/reject action");
      refetch();
      // Clear the state to prevent refetch on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, refetch]);
  console.log(
    "Chief Valuation Data in ChiefValuationReview: ",
    chiefValuationReview
  );
  console.log(
    errorChiefValuationData?.data ? errorChiefValuationData.data : "No Error"
  );

  console.log("Chief Valuation Data in ChiefValuationReview: ", chiefValuationData.Examiner_Name);
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter data based on search term and sort rejected records to top
  const filteredData = useMemo(() => {
    if (!chiefValuationReview?.data) return [];

    const filtered = chiefValuationReview.data.filter(
      (item) =>
        item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Evaluator_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Eva_Mon_Year?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort: 1) Chief_Flg='E' AND Checked='Yes' (green) at top, 2) tot_round=0 (red) next, 3) rest
    return filtered.sort((a, b) => {
      const aIsRejected = a.Chief_Flg === 'E' && a.Checked === 'Yes';
      const bIsRejected = b.Chief_Flg === 'E' && b.Checked === 'Yes';
      const aIsZero = a.tot_round === 0 || a.tot_round === '0';
      const bIsZero = b.tot_round === 0 || b.tot_round === '0';
      
      // Rejected records (green) come first
      if (aIsRejected && !bIsRejected) return -1;
      if (!aIsRejected && bIsRejected) return 1;
      
      // If neither is rejected, zero tot_round records come next
      if (!aIsRejected && !bIsRejected) {
        if (aIsZero && !bIsZero) return -1;
        if (!aIsZero && bIsZero) return 1;
      }
      
      return 0;
    });
  }, [chiefValuationReview?.data, searchTerm]);



  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleChiefValuationViewDetails = (
    barcode,
    subcode,
    Evaluator_Id,
    Eva_Mon_Year,
    tot_round,
    checkdate,
    camp_id_chief,
    camp_offcer_id_examiner,
    Chief_Eva_subject_dashboard,
    Examiner_Id,
    Chief_Valuation_Type
  ) => {
    const paperData = {
      barcode,
      subcode,
      Evaluator_Id,
      Eva_Mon_Year,
      tot_round,
      checkdate,
      camp_id_chief,
      camp_offcer_id_examiner,
      Chief_Eva_subject_dashboard,
      Examiner_Id,
      Chief_Valuation_Type,
      Dep_Name: userInfo?.selected_course || "01",
      department: userInfo?.selected_course || "01"
    };

    // Store in Redux as fallback
    dispatch(setChiefValuationBarcodeData(paperData));

    console.log("Chief_Valuation_Type: ", Chief_Valuation_Type);
    console.log("Navigating with paper data:", paperData);
    
    // Pass data through navigate state (primary method, like ReviewExaminer)
    if (Chief_Valuation_Type == 1) {
      navigate("/valuation/chief-valuation", { state: { paperData } });
    } else if (Chief_Valuation_Type == 7) {
      navigate("/valuation/chief-valuation-review-main", { state: { paperData } });
    }

    console.log("Viewing details for barcode:", barcode);
    // Implement the logic to view details, e.g., open a modal or navigate to a detail page
  };

  return (
    <>
      <UploadPageLayout
        mainTopic={userHeader}
        subTopic="Manage and review examiner valuations11"
        cardTitle="Valuation Details"
      >
        <div>
          {isLoadingChiefValuationData ? (
            <p>Loading chief valuation data...</p>
          ) : errorChiefValuationData ? (
            <p>Error loading chief valuation data.</p>
          ) : (
            <div className="mt-0">
              <Row>
                <Col>
                  <h6>
                    {" "}
                    Examiner Name : {
                      chiefValuationReview?.Examiner_Name ? chiefValuationReview.Examiner_Name : "Unknown Examiner"
                    }{" "}
                  </h6>
                </Col>
                <Col className="text-end">
                  <h6> Subject Name : {chiefValuationData.chief_sub_name} </h6>
                </Col>
              </Row>
              <Row className="mb-1">
                <Col md={6} lg={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i> 🔍
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Search by barcode, subcode, evaluator ID..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </InputGroup>
                </Col>
                <Col md={6} lg={8} className="text-end">
                  <Badge bg="secondary" className="fs-6">
                    Total Records: {filteredData.length}
                  </Badge>
                </Col>
              </Row>

              <Table striped bordered hover responsive className="shadow-sm">
                <thead className="bg-primary text-white">
                  <tr className="text-center">
                    <th className="text-center">Slno</th>
                    <th>Barcode</th>
                    <th>Subcode</th>
                    <th>Evaluator ID</th>
                    <th>Evaluation Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems && currentItems.length > 0 ? (
                    currentItems.map((item, index) => {
                      const isRejected = item.Chief_Flg === 'E' && item.Checked === 'Yes';
                      const isZeroRound = item.tot_round === 0 || item.tot_round === '0';
                      const cellStyle = isRejected 
                        ? { backgroundColor: '#d4edda' } 
                        : isZeroRound 
                        ? { backgroundColor: '#f8d7da' } 
                        : {};
                      return (
                      <tr 
                        key={index} 
                        className="text-center"
                        style={{
                          borderLeft: isRejected ? '4px solid #28a745' : isZeroRound ? '4px solid #dc3545' : 'none'
                        }}
                      >
                        <td className="text-center fw-semibold" style={cellStyle}>
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td style={cellStyle}>
                          <Badge bg="secondary" className="fs-6 fw-normal">
                            {item.barcode}
                          </Badge>
                        </td>
                        <td className="fw-semibold text-primary" style={cellStyle}>
                          {item.subcode}
                        </td>
                        <td style={cellStyle}>{item.Evaluator_Id}</td>
                        <td className="text-muted text-center" style={cellStyle}>
                          {item.checkdate.toString().substring(0, 10)}
                        </td>
                        <td style={cellStyle}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="px-3"
                            onClick={() =>
                              handleChiefValuationViewDetails(
                                item.barcode,
                                item.subcode,
                                item.Evaluator_Id,
                                item.Eva_Mon_Year,
                                item.tot_round,
                                item.checkdate,
                                Cheif_Camp_Id,
                                Cheif_Camp_Office_Id,
                                Chief_Eva_subject_dashboard,
                                Examiner_Id,
                                Chief_Valuation_Type
                              )
                            }
                          >
                            {Chief_Valuation_Type == 1
                              ? "Chief Valuation"
                              : "Chief Review"}
                          </Button>
                        </td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        {searchTerm
                          ? "No matching records found"
                          : "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="text-muted">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                    {filteredData.length} entries
                  </div>
                  <Pagination className="mb-0">
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 &&
                          pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <Pagination.Item
                            key={pageNumber}
                            active={pageNumber === currentPage}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </Pagination.Item>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <Pagination.Ellipsis key={pageNumber} disabled />
                        );
                      }
                      return null;
                    })}

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
            </div>
          )}
        </div>
      </UploadPageLayout>
    </>
  );
};

export default ChiefValuationReview;
