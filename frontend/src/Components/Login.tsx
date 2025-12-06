import React from "react";
import { Alert, Button, Card, Form, Input, message } from "antd";
import axios from "axios";
import API from "../api/Api";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  token: string;
  user: {
    Id: string;
    Name: string;
    Email: string;
    Role: string;
  };
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const handleLogin = async (values: { Email: string; Password: string }) => {
    try {
      const response = await API.post<LoginResponse>(
        `/Auth/login?email=${values.Email}&password=${values.Password}`
      );

      const { token, user } = response.data;

      // save token & user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("login sucessfull");
      message.success(`Welcome ${user.Name} (${user.Role})`);
      console.log("login sucessfull");
      // navigate to dashboard or reload
      window.location.href = "/Task";
    } catch (e: any) {
      if (e.response?.data) {
        message.error(e.response.data);
        alert("Login failed!!")
        console.log("login FAILED");
      } else {
        message.error("Login failed, please try again.");
        alert("Login failed!!")
      }
    }
  };

  return (
    <>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      
      <Card
        title="LogIn"
        style={{ width: "500px", height: "400px", marginTop: "100px" }}
      >
        <div style={{ display: "flex", height: "100%" }}>
         
          <div
            style={{
              flex: "1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              paddingRight: "20px",
            }}
          >
            <img
              src="src/assets/capsitech.png" 
              alt="Login "
              style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px"}}
            />
          </div>
          
          <div >
            <h1>TaskManagement</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ Email: "", Password: "" }}
          
        >
          <Form.Item
            label="Email"
            name="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Login
            </Button>
          </Form.Item>
          {/* <div style={{ textAlign: "center" }}>
            Don’t have an account?{" "}
            <a onClick={() => navigate("/register")}>Register</a>
          </div> */}
        </Form>
        </div>
        </div>
      </Card>
    </div>
    </>
  );
};

export default Login;
