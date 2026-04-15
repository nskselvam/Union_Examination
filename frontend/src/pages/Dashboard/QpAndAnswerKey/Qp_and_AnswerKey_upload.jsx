import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap'
import UploadPageLayout from '../../../components/DashboardComponents/UploadPageLayout'
import { useUploadQuestionPaperKeyMutation } from '../../../redux-slice/generalApiSlice'


const Qp_and_AnswerKey_upload = () => {
  const [uploadType, setUploadType] = useState('question_paper');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [department, setDepartment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });

  const userInfo = useSelector((state) => state.auth?.userInfo);
  const degreeInfo = useSelector((state) => state.auth?.degreeInfo);
  const monthyearInfo = useSelector((state) => state.auth?.monthyearInfo);


  const activeMonthYear = Array.isArray(monthyearInfo) ? monthyearInfo.find((m) => m.Month_Year_Status === 'Y') : null;

  const eva_month_year = activeMonthYear ? `${activeMonthYear.Eva_Month}_${activeMonthYear.Eva_Year}` : 'N/A';

  //const activeDegree = Array.isArray(degreeInfo) ? degreeInfo.find((d) => d.Flg === 'Y') : null;

  const activeDegree= userInfo?.selected_course
 


  const [uploadQuestionPaperKey] = useUploadQuestionPaperKeyMutation();

  useEffect(() => {
    if (activeDegree && !department) {
      setDepartment(activeDegree);
    }
  }, [activeDegree]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Reset status when selecting new files
    setUploadStatus({ type: '', message: '' });

    if (files.length > 0) {
      // Validate each file
      const maxSize = 10 * 1024 * 1024; // 10MB
      const invalidFiles = files.filter(file => file.type !== 'application/pdf');
      const oversizedFiles = files.filter(file => file.size > maxSize);

      if (invalidFiles.length > 0) {
        setUploadStatus({
          type: 'danger',
          message: `${invalidFiles.length} file(s) are not PDF. Please select PDF files only.`
        });
        setSelectedFiles([]);
        e.target.value = ''; // Clear file input
        return;
      }

      if (oversizedFiles.length > 0) {
        setUploadStatus({
          type: 'danger',
          message: `${oversizedFiles.length} file(s) exceed 10MB limit.`
        });
        setSelectedFiles([]);
        e.target.value = ''; // Clear file input
        return;
      }

      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadStatus({
        type: 'warning',
        message: 'Please select at least one file first'
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: '', message: '' });

    const formData = new FormData();

    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('uploadType', uploadType);
    formData.append('username', userInfo?.username || userInfo?.email || 'unknown');
    formData.append('userId', userInfo?.user_id || userInfo?.id || '');
    formData.append('eva_month_year', eva_month_year || '');
    formData.append('user_role', userInfo?.selected_course || '');
    formData.append('department', department || '');

    try {
      const response = await uploadQuestionPaperKey(formData).unwrap();

      console.log('Upload successful:', response);

      setUploadStatus({
        type: 'success',
        message: response.message || `${selectedFiles.length} file(s) uploaded successfully!`
      });

      // Clear the file selection after successful upload
      setSelectedFiles([]);
      document.querySelector('input[type="file"]').value = '';

    } catch (error) {
      console.error('Upload failed:', error);

      const errorMessage = error?.data?.message ||
        error?.message ||
        'Upload failed. Please try again.';

      setUploadStatus({
        type: 'danger',
        message: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <UploadPageLayout
        mainTopic="Upload Question Paper and Answer Key"


      >

        <Row className="mb-4" style={{ margin: '0px' }}>

          <Col md={7}>

            <Card style={{ width: '100%', marginTop: '20px', height: '100%' }}>
              <Card.Body>
                <Card.Title style={{ color: '#2c5282', fontWeight: '600', marginBottom: '20px' }}>
                  Question Paper / Answer Key Upload
                </Card.Title>

                {uploadStatus.message && (
                  <Alert
                    variant={uploadStatus.type}
                    dismissible
                    onClose={() => setUploadStatus({ type: '', message: '' })}
                    className="mb-3"
                  >
                    {uploadStatus.message}
                  </Alert>
                )}

                <Form>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '500' }}>Department Name</Form.Label>
                        <Form.Select
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          style={{ borderColor: '#cbd5e0' }}
                          disabled={uploading}
                        >

                          {degreeInfo && Array.isArray(degreeInfo) && degreeInfo.length > 0 ? (
                            <>
                              <option value="">-- Select Department --</option>
                              {degreeInfo.map((dept) =>  dept.Flg === 'Y' && dept.D_Code===department && (
                                <option key={dept.id} value={dept.D_Code}>{dept.D_Code} - {dept.Degree_Name}</option>
                              ))}
                            </>
                          ) : (
                            <option value="">Select Department</option>
                          )}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: '500' }}>Upload Type</Form.Label>
                        <Form.Select
                          value={uploadType}
                          onChange={(e) => setUploadType(e.target.value)}
                          style={{ borderColor: '#cbd5e0' }}
                          disabled={uploading}
                        >
                          <option value="question_paper">Question Paper</option>
                          <option value="answer_key">Answer Key</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="align-items-end">
                    <Col md={8}>
                      <Form.Group className="mb-3 mt-3">
                        <Form.Label style={{ fontWeight: '500' }}>Select Files (Multiple)</Form.Label>
                        <Form.Control
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,application/pdf"
                          style={{ borderColor: '#cbd5e0' }}
                          disabled={uploading}
                          multiple
                        />
                        {selectedFiles.length > 0 && (
                          <Form.Text className="text-muted">
                            Selected: {selectedFiles.length} file(s) ({(selectedFiles.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(2)} KB total)
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group className="mb-3 mt-3">
                        <Button
                          variant="primary"
                          onClick={handleUpload}
                          disabled={uploading || selectedFiles.length === 0}
                          style={{
                            width: '100%',
                            backgroundColor: '#2c5282',
                            borderColor: '#2c5282',
                            fontWeight: '500'
                          }}
                        >
                          {uploading ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-2"
                              />
                              Uploading...
                            </>
                          ) : (
                            'Import'
                          )}
                        </Button>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>

            <Card style={{ width: '100%', marginTop: '20px', backgroundColor: '#f7fafc', height: '100%' }}>
              <Card.Body>
                <Card.Title style={{ color: '#2c5282', fontWeight: '600', marginBottom: '20px' }}>
                  Instructions
                </Card.Title>
                <ul style={{ fontSize: '14px', color: '#4a5568', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Select the upload type (Question Paper or Answer Key)</li>
                  <li>Click on "Select Files" to choose multiple PDF files from your device</li>
                  <li>You can select up to 50 PDF files at once</li>
                  <li>Only PDF files are accepted (maximum size: 50MB per file)</li>
                  <li>After selecting files, click the "Import" button to upload them</li>
                  <li>Ensure that files are correctly formatted and named according to guidelines (Subjectcode.pdf)</li>
                  <li>Wait for the upload confirmation message before proceeding</li>
                  <li>For any issues during upload, contact support</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </UploadPageLayout>
    </>
  )
}

export default Qp_and_AnswerKey_upload
