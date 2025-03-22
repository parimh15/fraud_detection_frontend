import React, { useState, useEffect } from "react";
import {
  Upload,
  Button,
  message,
  Progress,
  Card,
  Typography,
  Alert,
  Space,
  Select,
} from "antd";
import { UploadOutlined, InboxOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axios from "axios";
import FileTypeSelect from "./FileTypeSelect.jsx"; 
import "./Upload.css";

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;
const UploadPage = () => {
  const [fileType, setFileType] = useState("REFERENCE_CALL");
  const [userId, setUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [error, setError] = useState(null);
  // Fetch userId from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      message.error("User ID not found. Please log in.");
    }
  }, []);
 

  // Handle file type selection manually
  const handleFileTypeChange = (value) => {
    setFileType(value);
  
  };

  // Validate file before upload
const beforeUpload = (file) => {
  if (file.size / 1024 / 1024 > 20) {
    message.error("File must be smaller than 20MB!");
    return Upload.LIST_IGNORE;
  }
  setError(null);
  setSuccess(false);
  setProgress(0);
  return false; // Prevent auto upload, as we will handle it manually
};

  const handleUpload = async () => {
    if (!userId) {
      message.error("User ID not found. Please log in.");
      return;
    }
    if (fileList.length === 0) {
      message.warning("Please select a file to upload.");
      return;
    }
    // Use originFileObj to get the actual file
    const file = fileList[0].originFileObj;
    if (!file) {
      message.error("Invalid file selection.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);  //Sending the MP3 file as-is
    formData.append("userId", userId);
    formData.append("documentType", fileType); 
    const endpoint =
      fileType === "REFERENCE_CALL"
        ? "http://localhost:8080/audio/update-audio"
        : "http://localhost:8080/documents/update-document";
    setUploading(true);
    try {
      await axios.put(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
      });
      setSuccess(true);
      setFileList([]);
      message.success("File uploaded successfully.");
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
      message.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const draggerProps = {
    name: "file",
    multiple: false,
    fileList,
    beforeUpload,
    onChange(info) {
      setFileList(info.fileList.map(file => ({
        ...file,
        originFileObj: file.originFileObj || file, // :white_check_mark: Ensure correct file object
      })));
    },
    onRemove() {
      setFileList([]);
      setSuccess(false);
      setProgress(0);
      setError(null);
    },
    showUploadList: { showRemoveIcon: true, showPreviewIcon: false },
  };
  return (
    <div className="upload-page-container">
      <Card className="upload-card">
        <Title level={2}>File Upload</Title>
        <Text type="secondary" className="upload-subtitle">
          Upload your files securely to our platform
        </Text>
        <Space direction="vertical" size="large" className="upload-space">
          {/* File Type Selection */}
          {/* <div className="file-type-selector">
            <Text strong>File Type:</Text>
            <Select value={fileType} onChange={handleFileTypeChange} className="file-type-select" disabled={fileList.length > 0}>
              <Option value="AADHAR">AADHAAR</Option>
              <Option value="PAN">PAN</Option>
              <Option value="REFERENCE_CALL">REFERENCE_CALL</Option>
            </Select>
          </div> */}
          <div className="file-type-selector">
            <Text strong>File Type:</Text>
            <FileTypeSelect fileType={fileType} handleFileTypeChange={handleFileTypeChange} fileList={fileList} />
          </div>
          {/* Drag & Drop Upload Area */}
          <Dragger {...draggerProps} className="upload-dragger">
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              {fileType === "REFERENCE_CALL" ?  "Supports MP3, WAV." : "Supports JPG, PNG" }
            </p>
          </Dragger>
          {/* Upload Button */}
          <Button
            type="primary"
            onClick={handleUpload}
            disabled={fileList.length === 0 || uploading}
            loading={uploading}
            icon={<UploadOutlined />}
            className="upload-button"
          >
            {uploading ? "Uploading..." : "Start Upload"}
          </Button>
          {/* Progress Bar */}
          {(uploading || success) && (
            <Progress percent={progress} status={success ? "success" : "active"} className="upload-progress" /> 
            
          )}
          {/* Success Message */}
          {success && (
            <Alert
              message="Upload Successful!"
              description="Your file has been uploaded successfully."
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              className="upload-success"
            />
          )}
          {/* Error Message */}
          {error && (
            <Alert
              message="Upload Failed"
              description={error}
              type="error"
              showIcon
              className="upload-error"
            />
          )}
        </Space>
      </Card>
    </div>
  );
};
export default UploadPage; 