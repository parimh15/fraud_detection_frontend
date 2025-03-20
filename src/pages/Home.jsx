import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, List, Button } from "antd";
import { FileOutlined, SoundOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Home = () => {
  const [recentActivity, setRecentActivity] = useState([]);
  const userId = "divya3819"; 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const audioResponse = await fetch(`http://localhost:8080/audio/recent/divya3819?limit=5`);
        const documentResponse = await fetch(`http://localhost:8080/documents/recent/divya3819?limit=5`);

        if (!audioResponse.ok || !documentResponse.ok) {
          throw new Error("Failed to fetch recent audios or documents.");
        }

        const recentAudioUUIDs = await audioResponse.json();
        const recentDocuments = await documentResponse.json();

        if (!Array.isArray(recentAudioUUIDs) || !Array.isArray(recentDocuments)) {
          throw new Error("Invalid response format from API.");
        }

        const recentAudios = recentAudioUUIDs.map((uuid) => ({
          id: uuid,
          type: "audio",
          name: `Audio UUID: ${uuid}`,
          status: "verified",
          timestamp: new Date().toISOString(),
        }));

        const recentDocs = recentDocuments.map((fileName, index) => ({
          id: `doc-${index}`, // Temporary unique ID
          type: "document",
          name: `Document: ${fileName}`, 
          status: "verified",
          timestamp: new Date().toISOString(),
        }));

        setRecentActivity([...recentAudios, ...recentDocs]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <Title level={2}>Dashboard</Title>

      <Card style={{ marginTop: 16 }}>
        <Title level={4}>Recent Activity</Title>
        <List
          itemLayout="horizontal"
          dataSource={recentActivity}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={item.type === "document" ? <FileOutlined /> : <SoundOutlined />}
                title={<Text>{item.name}</Text>}
                description={
                  <>
                    <Text type={item.status === "flagged" ? "danger" : "success"}>
                      {item.status === "flagged" ? (
                        <ExclamationCircleOutlined style={{ marginRight: 8 }} />
                      ) : (
                        <CheckCircleOutlined style={{ marginRight: 8 }} />
                      )}
                      {item.status === "flagged" ? "Potential fraud detected" : "Verified"}
                    </Text>
                    <br />
                    <Text type="secondary">{new Date(item.timestamp).toLocaleString()}</Text>
                  </>
                }
              />
              {/* <Button type="link" onClick={() => handleViewDetails(item)}>
                {expandedItems[item.id] ? "Hide Details" : "View Details"}
              </Button> */}

              {/* Commenting out the details expansion */}
              {/* {expandedItems[item.id] && item.details && (
                <div
                  style={{
                    backgroundColor: "#f5f5f5",
                    padding: "10px",
                    marginTop: "10px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    borderRadius: "8px",
                    border: "1px solid #d9d9d9",
                    width: "100%",
                  }}
                >
                  <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                    {JSON.stringify(item.details, null, 2)}
                  </pre>
                </div>
              )} */}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Home;