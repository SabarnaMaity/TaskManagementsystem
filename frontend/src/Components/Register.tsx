import { Button, Card, Form, Input, message, Select } from 'antd';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import API from '../api/Api';
interface RegisterInterface {
  Name: string;
  Email: string;
  Designation: string;
  Password: string;
  Role: string;
}

const Register = () => {
    const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleRegister = async (values: RegisterInterface) => {
    try {
        console.log(" SUCESS user");
      const token = localStorage.getItem("token"); //  must exist
       console.log(token);
       
    const response = await API.post(
      "/Auth/register",values,
      
      {
        headers: {
          Authorization: `Bearer ${token}`, //  attach token
        },
      }
    );

    message.success("User registered successfully!");
    console.log("Registered user:", response.data);
    navigate('/login')
    } catch (error: any) {
      if (error.response?.data) {
        console.log(error);
        
        message.error(error.response.data);
      } else {
        message.error("Registration failed, please try again.");
      }
    }
  };
  return (
    <>
        <div style={{ display:"flex", justifyContent:'center', alignItems:"center"}}>
      <Card title="Register User / TeamLead"  style={{width:"1000px", marginTop:'100px'}}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
          initialValues={{ role: "User" }}
          
        >
          <Form.Item
            label="Name"
            name="Name"
            rules={[{ required: true, message: "Please enter the name!" }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="Email"
            rules={[
              { required: true, message: "Please enter an email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>

          <Form.Item
            label="Designation"
            name="Designation"
            rules={[{ required: true, message: "Please enter designation!" }]}
          >
            <Input placeholder="Enter designation" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="Password"
            rules={[{ required: true, message: "Please enter a password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Select>
              <Select.Option value="TeamLead">TeamLead</Select.Option>
              <Select.Option value="User">User</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: "center" }}>
            Already have an account?{" "}
            <a onClick={() => navigate("/login")}>Login</a>
          </div>
        </Form>
      </Card>
    </div>
    
    </>
  )
}

export default Register