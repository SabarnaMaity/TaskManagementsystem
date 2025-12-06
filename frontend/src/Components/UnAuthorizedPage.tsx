import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

const UnAuthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary" onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
    </div>
  );
};

export default UnAuthorizedPage;
