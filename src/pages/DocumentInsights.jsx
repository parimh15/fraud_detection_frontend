import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Table, Tag, Alert, Typography } from "antd";
import axios from "axios";

const { Title, Text } = Typography;

const DocumentInsights = () => {
  const { id } = useParams();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual API endpoint
    axios
      .get(`http://localhost:5000/api/document/${id}`)
      .then((response) => {
        setInsights(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching document insights:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!insights) return <p>No data found.</p>;

  const { documentId, finalRiskScore, riskLevel, decision, nextSteps, remarks, ocrResults, qualityResults, forgeryResults, validationResults } = insights;

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Document Insights</Title>

      {/* Document Overview */}
      <Card title="Document Overview" style={{ marginBottom: 20 }}>
        <p><strong>Document ID:</strong> {documentId}</p>
        <p><strong>Final Risk Score:</strong> {finalRiskScore}</p>
        <p><strong>Risk Level:</strong> <Tag color={riskLevel === "HIGH" ? "red" : riskLevel === "MEDIUM" ? "orange" : "green"}>{riskLevel}</Tag></p>
        <p><strong>Decision:</strong> <Tag color={decision === "APPROVE" ? "green" : "red"}>{decision}</Tag></p>
        <p><strong>Next Steps:</strong> {nextSteps}</p>
        <p><strong>Remarks:</strong> {remarks}</p>
      </Card>

      {/* OCR Results */}
      <Card title="OCR Extracted Data" style={{ marginBottom: 20 }}>
        {ocrResults ? (
          <Table
            dataSource={[
              { key: "1", field: "Document Type", value: ocrResults.structured_data.document_type },
              { key: "2", field: "Name", value: ocrResults.structured_data.name },
              { key: "3", field: "Date of Birth", value: ocrResults.structured_data.date_of_birth },
              { key: "4", field: "Gender", value: ocrResults.structured_data.gender },
              { key: "5", field: "ID Number", value: ocrResults.structured_data.id_number },
            ]}
            columns={[
              { title: "Field", dataIndex: "field", key: "field" },
              { title: "Extracted Value", dataIndex: "value", key: "value" },
            ]}
            pagination={false}
          />
        ) : (
          <Alert message="No OCR data available." type="warning" />
        )}
      </Card>

      {/* Quality Analysis */}
      <Card title="Quality Analysis" style={{ marginBottom: 20 }}>
        {qualityResults ? (
          <Table
            dataSource={Object.keys(qualityResults.qualityAnalysis).map((key, index) => ({
              key: index,
              metric: key,
              score: qualityResults.qualityAnalysis[key][`${key}Score`],
              insight: qualityResults.qualityAnalysis[key].detailedInsight,
              recommendation: qualityResults.qualityAnalysis[key].recommendations,
            }))}
            columns={[
              { title: "Metric", dataIndex: "metric", key: "metric" },
              { title: "Score", dataIndex: "score", key: "score" },
              { title: "Insight", dataIndex: "insight", key: "insight" },
              { title: "Recommendation", dataIndex: "recommendation", key: "recommendation" },
            ]}
            pagination={false}
          />
        ) : (
          <Alert message="No quality analysis available." type="warning" />
        )}
      </Card>

      {/* Forgery Analysis */}
      <Card title="Forgery Analysis" style={{ marginBottom: 20 }}>
        {forgeryResults ? (
          <Table
            dataSource={Object.keys(forgeryResults.forgeryAnalysis).map((key, index) => ({
              key: index,
              category: key,
              score: forgeryResults.forgeryAnalysis[key][`${key}Score`] || "N/A",
              insight: forgeryResults.forgeryAnalysis[key].detailedInsight,
            }))}
            columns={[
              { title: "Category", dataIndex: "category", key: "category" },
              { title: "Score", dataIndex: "score", key: "score" },
              { title: "Insight", dataIndex: "insight", key: "insight" },
            ]}
            pagination={false}
          />
        ) : (
          <Alert message="No forgery analysis available." type="warning" />
        )}
      </Card>

      {/* Validation Results */}
      <Card title="Validation Results" style={{ marginBottom: 20 }}>
        {validationResults ? (
          <Table
            dataSource={Object.keys(validationResults.validation_results).map((key, index) => ({
              key: index,
              field: key,
              expected: validationResults.validation_results[key].expected,
              extracted: validationResults.validation_results[key].extracted,
              match_score: validationResults.validation_results[key].match_score,
            }))}
            columns={[
              { title: "Field", dataIndex: "field", key: "field" },
              { title: "Expected", dataIndex: "expected", key: "expected" },
              { title: "Extracted", dataIndex: "extracted", key: "extracted" },
              { title: "Match Score (%)", dataIndex: "match_score", key: "match_score" },
            ]}
            pagination={false}
          />
        ) : (
          <Alert message="No validation data available." type="warning" />
        )}
      </Card>
    </div>
  );
};

export default DocumentInsights;
