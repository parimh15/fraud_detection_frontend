import { useState, useEffect } from "react";
import { Select } from "antd";

const { Option } = Select;

const FileTypeSelect = ({ fileType, handleFileTypeChange, fileList }) => {
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/documents/types")
      .then((response) => response.json())
      .then((data) => {
        // Convert object to array of key-value pairs
        const typesArray = Object.entries(data).map(([key, value]) => ({
          key,
          value,
        }));
        setDocumentTypes(typesArray);
      })
      .catch((error) => console.error("Error fetching document types:", error));
  }, []);

  return (
    <Select
      value={fileType}
      onChange={handleFileTypeChange}
      className="file-type-select"
      disabled={fileList.length > 0}
    >
      {documentTypes.map(({ key, value }) => (
        <Option key={key} value={key}>
          {value}
        </Option>
      ))}
    </Select>
  );
};

export default FileTypeSelect;
