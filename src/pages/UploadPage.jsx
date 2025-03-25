// import React, { useState, useEffect } from 'react';
// import {
//     Layout,
//     Card,
//     Typography,
//     Form,
//     Select,
//     Upload,
//     Checkbox,
//     Button,
//     message,
//     Spin,
//     Alert,
//     Space,
//     Divider,
//     Modal
// } from 'antd';
// import {
//     FileAddOutlined,
//     UploadOutlined,
//     UserOutlined,
//     InboxOutlined,
//     CheckCircleOutlined
// } from '@ant-design/icons';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext'; 

// const { Title, Text, Paragraph } = Typography;
// const { Option } = Select;
// const { Dragger } = Upload;
// const { Content } = Layout;

// const UploadPage = () => {
//     const [form] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [selectedLead, setSelectedLead] = useState(null);
//     const [leadOptions, setLeadOptions] = useState([]);
//     const [selectedDocTypes, setSelectedDocTypes] = useState([]);
//     const [fileList, setFileList] = useState([]);
//     const [uploadResults, setUploadResults] = useState(null);
//     const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
    
//     const navigate = useNavigate();
    
//     // Use useAuth hook to get agentId
//     const { agent } = useAuth();
//     const agentId = agent?.agentId;

//     const API_BASE_URL = 'http://localhost:8080';

//     // Document types with more comprehensive options
//     const documentTypes = [
//         { 
//             value: 'Reference Call', 
//             label: 'Reference Call', 
//             description: 'Recorded conversation between lead and agent' 
//         },
//         { 
//             value: 'Aadhaar', 
//             label: 'Aadhaar Card', 
//             description: 'Government-issued identification with biometric details' 
//         },
//         { 
//             value: 'Pan', 
//             label: 'PAN Card', 
//             description: 'Permanent Account Number for tax identification' 
//         }
//     ];

//     useEffect(() => {
//         // Only fetch lead options if agentId is available
//         if (agentId) {
//             const fetchLeadOptions = async () => {
//                 setLoading(true);
//                 try {
//                     const response = await fetch(`${API_BASE_URL}/leads/agent/${agentId}/name-email`);
//                     if (!response.ok) {
//                         throw new Error(`HTTP error! status: ${response.status}`);
//                     }
//                     const data = await response.json();
//                     setLeadOptions(data);
//                 } catch (error) {
//                     console.error('Error fetching lead options:', error);
//                     setError('Failed to load lead options. Please try again.');
//                 } finally {
//                     setLoading(false);
//                 }
//             };

//             fetchLeadOptions();
//         }
//     }, [agentId]);

//     const handleLeadChange = (value) => {
//         setSelectedLead(value);
//     };

//     const handleDocTypeChange = (checkedValues) => {
//         setSelectedDocTypes(checkedValues);
//     };

//     const handleFileUpload = ({ fileList }) => {
//         setFileList(fileList);
//         // Reset upload results when files change
//         setUploadResults(null);
//     };

//     const onFinish = async (values) => {
//         if (!values.leadId || selectedDocTypes.length === 0 || fileList.length === 0) {
//             message.error('Please select a lead, document types, and upload files.');
//             return;
//         }

//         setLoading(true);
//         setError(null);

//         const formData = new FormData();
//         formData.append('agentId', agentId);
//         formData.append('leadId', values.leadId);
        
//         // Append document types as comma-separated string
//         formData.append('fileTypes', selectedDocTypes.join(','));
        
//         // Append files
//         fileList.forEach((file) => {
//             formData.append('files', file.originFileObj);
//         });

//         try {
//             const response = await fetch(`${API_BASE_URL}/files/upload-multiple`, {
//                 method: 'POST',
//                 body: formData
//             });

//             if (!response.ok) {
//                 throw new Error(`Upload failed with status: ${response.status}`);
//             }

//             const result = await response.json();
//             setUploadResults(result);
            
//             // Set upload successful state
//             setIsUploadSuccessful(true);

//             // Optional: Reset form after successful upload
//             form.resetFields();
//             setSelectedLead(null);
//             setSelectedDocTypes([]);
//             setFileList([]);
//         } catch (error) {
//             console.error("Document upload error:", error);
//             setError("Failed to upload documents. Please try again.");
//             message.error('Document upload failed.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUploadSuccessClose = () => {
//         setIsUploadSuccessful(false);
//     };

//     const getSelectedLeadInfo = () => {
//         return leadOptions.find(lead => lead.id === selectedLead);
//     };

//     const navigateToDocumentTrail = () => {
//       // Close success modal
//       setIsUploadSuccessful(false);
      
//       // Navigate to document trail page with selected lead
//       navigate('/document-trail', { 
//           state: { 
//               selectedLeadId: selectedLead 
//           } 
//       });
//   };

//   const navigateToFileRecordsDashboard = () => {
//     navigate('/document-trail');
// };

//     // If no agent is authenticated, show login prompt
//     if (!agent) {
//         return (
//             <Layout style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//                 <Alert 
//                     message="Authentication Required" 
//                     description="Please log in to access this page." 
//                     type="warning" 
//                     showIcon
//                     style={{ maxWidth: '400px' }}
//                 />
//             </Layout>
//         );
//     }

    

//     return (
//         <Layout style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px' }}>
//             <Content style={{ maxWidth: '800px', margin: '0 auto' }}>
//                 <Card
//                     bordered={false}
//                     style={{
//                         borderRadius: '8px',
//                         boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
//                     }}
//                 >

//                   <div style={{ 
//                         position: 'absolute', 
//                         top: '16px', 
//                         right: '16px' 
//                     }}>
//                         <Button 
//                             type="default" 
//                             icon={<DashboardOutlined />} 
//                             onClick={navigateToFileRecordsDashboard}
//                         >
//                             File Records
//                         </Button>
//                     </div>

//                     {loading ? (
//                         <div style={{ textAlign: 'center', padding: '20px' }}>
//                             <Spin size="large" tip="Processing..." />
//                         </div>
//                     ) : (
//                         <Space direction="vertical" size="middle" style={{ width: '100%' }}>
//                            {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}></div> */}
                           
//                               <div>
//                                 <Title level={3} style={{ marginBottom: '8px' }}>
//                                     <FileAddOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
//                                     Document Upload
//                                 </Title>
//                                 <Paragraph type="secondary">
//                                     Select a lead, choose document types, and upload relevant documents.
//                                 </Paragraph>
                              
                              
//                             </div>

//                             <Divider style={{ margin: '8px 0' }} />

//                             {error && (
//                                 <Alert
//                                     message="Error"
//                                     description={error}
//                                     type="error"
//                                     showIcon
//                                     style={{ marginBottom: '16px' }}
//                                 />
//                             )}

//                             <Form
//                                 form={form}
//                                 layout="vertical"
//                                 onFinish={onFinish}
//                             >
//                                 {/* Lead Selection */}
//                                 <Form.Item
//                                     name="leadId"
//                                     label={<Text strong>Select Lead</Text>}
//                                     rules={[{ required: true, message: 'Please select a lead' }]}
//                                 >
//                                     <Select
//                                         placeholder="Select a lead"
//                                         size="large"
//                                         onChange={handleLeadChange}
//                                         style={{ width: '100%' }}
//                                     >
//                                         {leadOptions.map(lead => (
//                                             <Option key={lead.id} value={lead.id}>
//                                                 <Space>
//                                                     <UserOutlined style={{ color: '#1890ff' }} />
//                                                     {lead.name} - {lead.email}
//                                                 </Space>
//                                             </Option>
//                                         ))}
//                                     </Select>
//                                 </Form.Item>

//                                 {selectedLead && (
//                                     <Card
//                                         size="small"
//                                         style={{
//                                             marginBottom: '24px',
//                                             backgroundColor: '#f9fafc',
//                                             borderLeft: '3px solid #1890ff'
//                                         }}
//                                     >
//                                         <Space align="start">
//                                             <div style={{
//                                                 color: 'white',
//                                                 backgroundColor: '#1890ff',
//                                                 borderRadius: '50%',
//                                                 width: '32px',
//                                                 height: '32px',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 justifyContent: 'center',
//                                                 fontSize: '16px'
//                                             }}>
//                                                 <UserOutlined />
//                                             </div>
//                                             <div>
//                                                 <Text strong>{getSelectedLeadInfo()?.name}</Text>
//                                                 <Paragraph type="secondary" style={{ marginBottom: 0 }}>
//                                                     Email: {getSelectedLeadInfo()?.email}
//                                                 </Paragraph>
//                                             </div>
//                                         </Space>
//                                     </Card>
//                                 )}

//                                 {/* Document Type Selection with Checkboxes */}
//                                 <Form.Item
//                                     name="fileTypes"
//                                     label={<Text strong>Select Document Types</Text>}
//                                     rules={[{ required: true, message: 'Please select at least one document type' }]}
//                                 >
//                                     <Checkbox.Group 
//                                         onChange={handleDocTypeChange}
//                                         style={{ 
//                                             display: 'grid', 
//                                             gridTemplateColumns: 'repeat(3, 1fr)', 
//                                             gap: '12px' 
//                                         }}
//                                     >
//                                         {documentTypes.map(doc => (
//                                             <Checkbox 
//                                                 key={doc.value} 
//                                                 value={doc.value}
//                                                 style={{ 
//                                                     padding: '8px', 
//                                                     border: '1px solid #f0f0f0', 
//                                                     borderRadius: '4px' 
//                                                 }}
//                                             >
//                                                 <Space direction="vertical" size="small">
//                                                     <Text strong>{doc.label}</Text>
//                                                     <Text type="secondary" style={{ fontSize: '12px' }}>
//                                                         {doc.description}
//                                                     </Text>
//                                                 </Space>
//                                             </Checkbox>
//                                         ))}
//                                     </Checkbox.Group>
//                                 </Form.Item>

//                                 {/* File Upload */}
//                                 <Form.Item
//                                     name="documents"
//                                     label={<Text strong>Upload Documents</Text>}
//                                     rules={[{ required: true, message: 'Please upload at least one document' }]}
//                                 >
//                                     <Dragger
//                                         multiple
//                                         beforeUpload={() => false} // Prevent auto upload
//                                         onChange={handleFileUpload}
//                                         fileList={fileList}
//                                         accept=".pdf,.jpg,.jpeg,.png"
//                                         style={{ 
//                                             padding: '20px', 
//                                             background: '#fafafa', 
//                                             border: '2px dashed #1890ff' 
//                                         }}
//                                     >
//                                         <p className="ant-upload-drag-icon">
//                                             <InboxOutlined style={{ color: '#1890ff', fontSize: '48px' }} />
//                                         </p>
//                                         <p className="ant-upload-text">
//                                             Click or drag files to this area to upload
//                                         </p>
//                                         <p className="ant-upload-hint">
//                                             Support for MP3, PNG and JPG files
//                                         </p>
//                                     </Dragger>
//                                 </Form.Item>

//                                 {/* Upload Button */}
//                                 <Form.Item>
//                                     <Button
//                                         type="primary"
//                                         htmlType="submit"
//                                         loading={loading}
//                                         icon={<UploadOutlined />}
//                                         size="large"
//                                         disabled={!selectedLead || selectedDocTypes.length === 0 || fileList.length === 0}
//                                         style={{
//                                             width: '100%',
//                                             height: '45px',
//                                             borderRadius: '4px'
//                                         }}
//                                     >
//                                         Upload Documents
//                                     </Button>
//                                 </Form.Item>
//                             </Form>
//                         </Space>
//                     )}
//                 </Card>
//             </Content>

            
//             <Modal
//                 title={null}
//                 open={isUploadSuccessful}
//                 onCancel={handleUploadSuccessClose}
//                 footer={[
//                     <Button key="close" onClick={handleUploadSuccessClose}>
//                         Close
//                     </Button>
//                 ]}
//                 centered
//             >
              
//                 <div style={{ 
//                     display: 'flex', 
//                     flexDirection: 'column', 
//                     alignItems: 'center', 
//                     padding: '20px' 
//                 }}>
//                     <CheckCircleOutlined 
//                         style={{ 
//                             fontSize: '72px', 
//                             color: '#52c41a', 
//                             marginBottom: '20px' 
//                         }} 
//                     />
//                     <Title level={4} style={{ marginBottom: '16px' }}>
//                         Upload Successful
//                     </Title>
//                     <Paragraph style={{ textAlign: 'center', marginBottom: '20px' }}>
//                         Your documents have been uploaded successfully. 
//                         {/* /* {uploadResults && ` ${uploadResults.filesUploaded} file(s) were processed.`} */}
//                     </Paragraph>
//                 </div>
//             </Modal>
        
//         </Layout> 
       
//     );
// };

// export default UploadPage; 


import React, { useState, useEffect } from 'react';
import {
    Layout,
    Card,
    Typography,
    Form,
    Select,
    Upload,
    Checkbox,
    Button,
    message,
    Spin,
    Alert,
    Space,
    Divider,
    Modal
} from 'antd';
import {
    FileAddOutlined,
    UploadOutlined,
    UserOutlined,
    InboxOutlined,
    CheckCircleOutlined,
    DatabaseOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Dragger } = Upload;
const { Content } = Layout;

const UploadPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadOptions, setLeadOptions] = useState([]);
    const [selectedDocTypes, setSelectedDocTypes] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [uploadResults, setUploadResults] = useState(null);
    const [isUploadSuccessful, setIsUploadSuccessful] = useState(false);
    
    const navigate = useNavigate();
    
    // Use useAuth hook to get agentId
    const { agent } = useAuth();
    const agentId = agent?.agentId;

    const API_BASE_URL = 'http://localhost:8080';

    // Document types with more comprehensive options
    const documentTypes = [
        { 
            value: 'Reference Call', 
            label: 'Reference Call', 
            description: 'Recorded conversation between lead and agent' 
        },
        { 
            value: 'Aadhaar', 
            label: 'Aadhaar Card', 
            description: 'Government-issued identification with biometric details' 
        },
        { 
            value: 'Pan', 
            label: 'PAN Card', 
            description: 'Permanent Account Number for tax identification' 
        }
    ];

    useEffect(() => {
        // Only fetch lead options if agentId is available
        if (agentId) {
            const fetchLeadOptions = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/leads/agent/${agentId}/name-email`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setLeadOptions(data);
                } catch (error) {
                    console.error('Error fetching lead options:', error);
                    setError('Failed to load lead options. Please try again.');
                } finally {
                    setLoading(false);
                }
            };

            fetchLeadOptions();
        }
    }, [agentId]);

    // New function to navigate to File Records Dashboard
    const navigateToFileRecordsDashboard = () => {
        try {
            navigate('/document-trail');
        } catch (error) {
            console.error('Navigation error:', error);
            message.error('Unable to navigate to file records');
        }
    };

    const handleLeadChange = (value) => {
        setSelectedLead(value);
    };

    const handleDocTypeChange = (checkedValues) => {
        setSelectedDocTypes(checkedValues);
    };

    const handleFileUpload = ({ fileList }) => {
        setFileList(fileList);
        // Reset upload results when files change
        setUploadResults(null);
    };

    const onFinish = async (values) => {
        if (!values.leadId || selectedDocTypes.length === 0 || fileList.length === 0) {
            message.error('Please select a lead, document types, and upload files.');
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('agentId', agentId);
        formData.append('leadId', values.leadId);
        
        // Append document types as comma-separated string
        formData.append('fileTypes', selectedDocTypes.join(','));
        
        // Append files
        fileList.forEach((file) => {
            formData.append('files', file.originFileObj);
        });

        try {
            const response = await fetch(`${API_BASE_URL}/files/upload-multiple`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }

            const result = await response.json();
            setUploadResults(result);
            
            // Set upload successful state
            setIsUploadSuccessful(true);

            // Optional: Reset form after successful upload
            form.resetFields();
            setSelectedLead(null);
            setSelectedDocTypes([]);
            setFileList([]);
        } catch (error) {
            console.error("Document upload error:", error);
            setError("Failed to upload documents. Please try again.");
            message.error('Document upload failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSuccessClose = () => {
        setIsUploadSuccessful(false);
    };

    const getSelectedLeadInfo = () => {
        return leadOptions.find(lead => lead.id === selectedLead);
    };

    // If no agent is authenticated, show login prompt
    if (!agent) {
        return (
            <Layout style={{ background: '#f0f2f5', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Alert 
                    message="Authentication Required" 
                    description="Please log in to access this page." 
                    type="warning" 
                    showIcon
                    style={{ maxWidth: '400px' }}
                />
            </Layout>
        );
    }

    return (
        <Layout style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px', position: 'relative' }}>
            <Content style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <Card
                    bordered={false}
                    style={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        position: 'relative'
                    }}
                >
                    {/* File Records Button */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '16px', 
                        right: '16px', 
                        zIndex: 10 
                    }}>
                        <Button 
                            type="default" 
                            icon={<DatabaseOutlined />} 
                            onClick={navigateToFileRecordsDashboard}
                        >
                            File Records
                        </Button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Spin size="large" tip="Processing..." />
                        </div>
                    ) : (
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                                <Title level={3} style={{ marginBottom: '8px' }}>
                                    <FileAddOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                                    Document Upload
                                </Title>
                                <Paragraph type="secondary">
                                    Select a lead, choose document types, and upload relevant documents.
                                </Paragraph>
                            </div>

                            <Divider style={{ margin: '8px 0' }} />

                            {error && (
                                <Alert
                                    message="Error"
                                    description={error}
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: '16px' }}
                                />
                            )}

                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={onFinish}
                            >
                                {/* Lead Selection */}
                                <Form.Item
                                    name="leadId"
                                    label={<Text strong>Select Lead</Text>}
                                    rules={[{ required: true, message: 'Please select a lead' }]}
                                >
                                    <Select
                                        placeholder="Select a lead"
                                        size="large"
                                        onChange={handleLeadChange}
                                        style={{ width: '100%' }}
                                    >
                                        {leadOptions.map(lead => (
                                            <Option key={lead.id} value={lead.id}>
                                                <Space>
                                                    <UserOutlined style={{ color: '#1890ff' }} />
                                                    {lead.name} - {lead.email}
                                                </Space>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                {selectedLead && (
                                    <Card
                                        size="small"
                                        style={{
                                            marginBottom: '24px',
                                            backgroundColor: '#f9fafc',
                                            borderLeft: '3px solid #1890ff'
                                        }}
                                    >
                                        <Space align="start">
                                            <div style={{
                                                color: 'white',
                                                backgroundColor: '#1890ff',
                                                borderRadius: '50%',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px'
                                            }}>
                                                <UserOutlined />
                                            </div>
                                            <div>
                                                <Text strong>{getSelectedLeadInfo()?.name}</Text>
                                                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                                    Email: {getSelectedLeadInfo()?.email}
                                                </Paragraph>
                                            </div>
                                        </Space>
                                    </Card>
                                )}

                                {/* Document Type Selection */}
                                <Form.Item
                                    name="fileTypes"
                                    label={<Text strong>Select Document Types</Text>}
                                    rules={[{ required: true, message: 'Please select at least one document type' }]}
                                >
                                    <Checkbox.Group 
                                        onChange={handleDocTypeChange}
                                        style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(3, 1fr)', 
                                            gap: '12px' 
                                        }}
                                    >
                                        {documentTypes.map(doc => (
                                            <Checkbox 
                                                key={doc.value} 
                                                value={doc.value}
                                                style={{ 
                                                    padding: '8px', 
                                                    border: '1px solid #f0f0f0', 
                                                    borderRadius: '4px' 
                                                }}
                                            >
                                                <Space direction="vertical" size="small">
                                                    <Text strong>{doc.label}</Text>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {doc.description}
                                                    </Text>
                                                </Space>
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                </Form.Item>

                                {/* File Upload */}
                                <Form.Item
                                    name="documents"
                                    label={<Text strong>Upload Documents</Text>}
                                    rules={[{ required: true, message: 'Please upload at least one document' }]}
                                >
                                    <Dragger
                                        multiple
                                        beforeUpload={() => false} // Prevent auto upload
                                        onChange={handleFileUpload}
                                        fileList={fileList}
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        style={{ 
                                            padding: '20px', 
                                            background: '#fafafa', 
                                            border: '2px dashed #1890ff' 
                                        }}
                                    >
                                        <p className="ant-upload-drag-icon">
                                            <InboxOutlined style={{ color: '#1890ff', fontSize: '48px' }} />
                                        </p>
                                        <p className="ant-upload-text">
                                            Click or drag files to this area to upload
                                        </p>
                                        <p className="ant-upload-hint">
                                            Support for PDF, PNG and JPG files
                                        </p>
                                    </Dragger>
                                </Form.Item>

                                {/* Upload Button */}
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<UploadOutlined />}
                                        size="large"
                                        disabled={!selectedLead || selectedDocTypes.length === 0 || fileList.length === 0}
                                        style={{
                                            width: '100%',
                                            height: '45px',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Upload Documents
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Space>
                    )}
                </Card>
            </Content>

            {/* Success Modal */}
            <Modal
                title={null}
                open={isUploadSuccessful}
                onCancel={handleUploadSuccessClose}
                footer={[
                    <Button key="close" onClick={handleUploadSuccessClose}>
                        Close
                    </Button>
                ]}
                centered
            >
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    padding: '20px' 
                }}>
                    <CheckCircleOutlined 
                        style={{ 
                            fontSize: '72px', 
                            color: '#52c41a', 
                            marginBottom: '20px' 
                        }} 
                    />
                    <Title level={4} style={{ marginBottom: '16px' }}>
                        Upload Successful
                    </Title>
                    <Paragraph style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Your documents have been uploaded successfully. 
                    </Paragraph>
                </div>
            </Modal>
        </Layout> 
    );
};

export default UploadPage;