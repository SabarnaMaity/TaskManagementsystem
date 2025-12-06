import {
  Form,
  Input,
  Layout,
  message,
  Modal,
  Popconfirm,
  Radio,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  DeleteOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Button, Menu, theme } from "antd";
import type { TeamMember } from "../interface/baseInterface";
import API from "../api/Api";
import form from "antd/es/form";
import { useNavigate } from "react-router-dom";
const { Header, Sider, Content } = Layout;

const TeamComponent = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editMember, setEditMember] = useState<TeamMember>();
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  // const [loading, setLoading] = useState(false);
  // Pagination states
  //  const [currentPage, setCurrentPage] = useState(1);
  const [page, setPage] = useState(1); // start from page 1 -S1
  const [pageSize, setPageSize] = useState(5); // 5 rows per page

  const [totalRecords, setTotalRecords] = useState(); //s1 total records from backend
  // const [sortBy, setSortBy] = useState("");
  // const [sortOrder, setSortOrder] = useState("");

  //fetch data from api
  const fetchTeamMember = async () => {
    //s2
    try {
      const { data } = await API.get("/Teams");

      setMembers(data);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  useEffect(() => {
    fetchTeamMember();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await API.post(`/Teams/delete/${id}`);
      console.log("member deleted sucessfuly");
      fetchTeamMember();
    } catch (error) {
      console.error("Error deleting team members:", error);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditMember(undefined);
  };
  const onFinish = async (values: TeamMember) => {
    try {
      if (editMember) {
        await API.post(`/Teams/update/${editMember.Id}`, values);
        message.success("member edited sucessfully");
        setEditMember(undefined);
      } else {
        //console.log("member before adding sucessfuly");
        await API.post(`/Teams`, values);

        console.log("member  sucessfuly");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchTeamMember();
    } catch (error) {
      console.error("Error adding team members:", error);
    }

    fetchTeamMember();
  };

  const handleSearch = async () => {
    try {
      const params: any = {}; 
      if (name.trim()) params.name = name.trim(); 
      if (designation) params.designation = designation;

      const { data } = await API.get("/Teams", { params });
      setMembers(data);
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to fetch filtered members");
    }
  };

  const navigate = useNavigate();
  const handleLogOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleTableChange = async (
    pagination: any,
    filters: any,
    sorter: any
  ) => {
    try {
      const params: any = {};

      let order = "";

      if (sorter.order === "ascend") {
        order = "asc";
      } else if (sorter.order === "descend") {
        order = "desc";
      }

      let field = "";
      if (sorter.field === "Name") {
        field = "name";
      } else if (sorter.field === "Designation") {
        field = "designation";
      } else if (sorter.field === "Email") {
        field = "email";
      }

      if (pagination) {
        params.page = pagination.current;
        params.pageSize = pagination.pageSize;
      }

      if (field && order) {
        params.sortBy = field;
        params.sortOrder = order;
      }

      const { data } = await API.get("/Teams", { params });

      const totalRecords = await API.get("/Teams/totaldata");

      //console.log("The data is ",data);
      setMembers(data);
      setTotalRecords(totalRecords.data);
    } catch (error) {
      console.error("Sorting error:", error);
      message.error("Failed to fetch sorted data");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "Email",
      key: "Email",
      sorter: true,
    },
    //   {
    //     title: "Designation",
    //     dataIndex: "Designation",
    //     key: "Designation",
    // sorter: {
    //   compare: (a: TeamMember, b: TeamMember) =>
    //     a.Designation.localeCompare(b.Designation),
    //   multiple: 1,
    // },
    //   },

    // Inside your columns array:
    {
      title: "Designation",
      dataIndex: "Designation",
      key: "Designation",
      sorter: true,
      render: (designation: string) => {
        // let color = designation.length < 10 ? 'geekblue' : 'green';
        let color = "green";
        if (  designation === "Assistant System Engineer") {
          color = "blue";
        }
        if (designation === "Developer") {
          color = "cyan";
        }
        if (designation === "System Engineer") {
          color = "#642ab5";
        }
        if (designation === "Senior System Engineer") {
          color = "#003a8c";
        }

        return (
          <Tag color={color} key={designation}>
            {designation.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      render: (record: TeamMember) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => {
              form.setFieldsValue(record);
              setEditMember(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this?"
            onConfirm={() => handleDelete(record.Id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* <div>TeamComponent</div> */}
      <Layout style={{ height: "1000vh" }}>
        <Sider theme="dark">
          <Sidebar />
        </Sider>
        <Layout>
          <Header style={{ padding: 12, background: "#FFF" }}>
            
            <div
              style={{
                background: "#fff",
                padding: "0 24px",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                height: 50,
              }}
            >
              <Button type="primary" onClick={showModal}>
                <PlusOutlined /> Create Member
              </Button>
              <Button
                color="cyan"
                variant="solid"
                style={{ marginLeft: "10px" }}
                onClick={handleLogOut}
              >
                <LogoutOutlined /> LogOut
              </Button>
            </div>
          </Header>
          <div
            style={{
              margin: "10px",
            }}
          >
            {/* Search section */}
            <Space>
              <Input
                placeholder="Search by name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
              <Select
                placeholder="Select designation"
                value={designation || undefined}
                onChange={(value) => setDesignation(value)}
                allowClear
                style={{ width: 200 }}
              >
                <Select.Option value="Developer">Developer</Select.Option>
                <Select.Option value="intern">Intern</Select.Option>
                <Select.Option value="Assistant System Engineer">
                  Assistant System Engineer
                </Select.Option>
                <Select.Option value="System Engineer">System Engineer</Select.Option>
              </Select>

              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Search
              </Button>
            </Space>
          </div>
          <Content>
            <Table
              style={{ padding: "24px" }}
              dataSource={members.map((member) => ({
                ...member,
                key: member.Id,
              }))}
              columns={columns}
              bordered
              onChange={handleTableChange}
              tableLayout="fixed"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: totalRecords,
                onChange: (page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                  fetchTeamMember();
                },
              }}
            />
            ;
          </Content>

          <Modal
            title={editMember ? "Update Member" : "Add Member"}
            closable={{ "aria-label": "Custom Close Button" }}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} onFinish={onFinish}>
              <Form.Item
                label="Name"
                name="Name"
                rules={[{ required: true, message: "Name required" }]}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="Email"
                rules={[{ required: true, message: "give proper email" }]}
              >
                <Input placeholder="input placeholder" type="Email" />
              </Form.Item>
              <Form.Item
                label="Designation"
                name="Designation"
                rules={[{ required: true, message: "designation required" }]}
              >
                <Input placeholder="input placeholder" />
              </Form.Item>
              {/* {!editMember ? (
                <Form.Item
                  label="Password"
                  name="Password"
                  rules={[{ required: true, message: "Password required" }]}
                >
                  <Input.Password placeholder="Enter your password" />
                </Form.Item>
              ) : null} */}

              <Form.Item
                label="Role"
                name="Role"
                rules={[{ required: true, message: "Role required" }]}
              >
                <Select>
                  <Select.Option value="Admin">Admin</Select.Option>
                  <Select.Option value="TeamLead">TeamLead</Select.Option>
                  <Select.Option value="User">User</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  {editMember ? "Update" : "Submit"}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Layout>
      </Layout>
    </>
  );
};

export default TeamComponent;
