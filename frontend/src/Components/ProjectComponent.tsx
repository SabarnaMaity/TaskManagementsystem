import {
  Button,
  Form,
  Input,
  Layout,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";

import API from "../api/Api";
import type { Project, TeamMember } from "../interface/projectInterface";
import form from "antd/es/form";
import { useNavigate } from "react-router-dom";
const { Header, Sider, Content } = Layout;

const ProjectComponent = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const[leaders,setLeaders]=useState<TeamMember[]>([]);
  const [editProject, setEditProject] = useState<string | any>("");
  const [name, setName] = useState("");
  const [teamMemberName, setTeamMemberName] = useState("");
  const [page, setPage] = useState(1); // start from page 1 -S1
  const [pageSize, setPageSize] = useState(5); // 5 rows per page

  const [totalRecords, setTotalRecords] = useState(); //s1 total records from backend

  //  Get user role from localStorage (you set it when login)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.Role; // Admin | TeamLead | User


  const fetchProjects = async () => {
    try {
      let url=`/Projects`
      if(role!="Admin" && user?.Id){
        // const { data } = await API.get(`/Projects?TeamLeadId=${user.Id}`);
     // setProjects(data);
      url += `?TeamId=${user.Id}`;
      }
     const { data } = await API.get(url);
     setProjects(data);
      console.log("project added");
    } catch (error) {
      console.log("error in project add", error);
    }
  };
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchTeamMember = async () => {
    try {
      const { data } = await API.get(`/Teams`);
      setMembers(data);
      console.log("team member added");
    } catch (error) {
      console.log("team member get error", error);
    }
  };
  useEffect(() => {
    fetchTeamMember();
    fetchTeamLeader();
  }, []);

  //fetching Team leaders:
  const fetchTeamLeader=async()=>{
    try {
      const{data}= await API.get(`/Teams/TeamLeaders`);
    setLeaders(data);
    console.log("Team leadaer fetched");
    } catch (error) {
      console.log("team leader fetched error ");
    }
    

  }
  

  const handleDelete = async (id: string) => {
    try {
      await API.post(`/Projects/delete/${id}`);
      console.log("project deleted sucessfuly");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
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
    setEditProject(undefined);
  };

  const onFinish = async (values: any) => {
    console.log(values);
    const memberData = members.filter((m) => values.TeamMember.includes(m.Id)); //
    // const teamLeadData= leaders.find((t)=> values.TeamLead == t.Name);
    // console.log(teamLeadData);
 let teamLeadData;
if (editProject) {
  if (role === "Admin") {
    // Admin can change TeamLead from the Select (Id  object)
    teamLeadData = leaders.find((t) => t.Id === values.TeamLead);
  } else {
    // Non-admin  preserve original TeamLead object
    teamLeadData = editProject.TeamLead;
  }
} else {
  // Create  Admin assigns TeamLead
  teamLeadData = leaders.find((t) => t.Id === values.TeamLead);
}

    const backendData = {
      ...values,
      TeamMember: memberData,
      TeamLead:teamLeadData,//e
    };
    try {
      if (editProject) {
        console.log("api hitted");
        await API.post(`/Projects/update/${editProject.Id}`, backendData);
        message.success("project edited sucessfully");
      } else {
        // const selectedMembers = values.TeamMember.map((m: string) => JSON.parse(m));
        // const backformdata = {
        //     ...values,
        //     TeamMember: selectedMembers
        // };

        await API.post(`/Projects`, backendData);
        //await API.post(`/Projects`,values);
        console.log("project added sucessfuly");
      }
      setIsModalOpen(false);

      fetchProjects();
      form.resetFields();
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleSearch = async () => {
    try {
      const params: any = {}; //An empty object params is initialized to store query parameters for the API request.
      if (role != "Admin" && user?.Id) {
        params.TeamId = user.Id;
      }
      if (name.trim()) params.name = name.trim(); //If the name variable (after trimming whitespace) is not empty, its trimmed value is added to the params object as params.name.
      if (teamMemberName.trim()) params.teamMemberName = teamMemberName.trim();

      const { data } = await API.get("/Projects", { params });
      setProjects(data);
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


      let order = "";
      if (sorter.order === "ascend") {
        order = "asc";
      } else if (sorter.order === "descend") {
        order = "desc";
      }

      let field = "";
      if (sorter.field === "ProjectName") {
        field = "name";
      } else if (sorter.field === "Description") {
        field = "description";
      } else if (sorter.columnKey === "TeamMember") {
        field = "TeamMemberName";
      }

      //sorter.field === "Designation" ? "designation" : "";
      // sorter.field === "Email" ? "email" : "";
      // const field = sorter.field;

      const params: any = {};
       if(role!="Admin" && user?.Id){
        params.TeamId=user.Id;
      }
        if (field && order) {
        params.sortBy = field;
        params.sortOrder = order;
      }
      
     
    
     const { data } = await API.get("/Projects", { params });
     const totalRecords=data.length;
      //const totalRecords = await API.get("/Projects/totaldata");
      setProjects(data);
     setTotalRecords(totalRecords.data);

      if (pagination) {
        params.page = pagination.current;
        params.pageSize = pagination.pageSize;
      }

    //   if (field && order) {
    //     params.sortBy = field;
    //     params.sortOrder = order;
    //   }
      
     
    
    //  const { data } = await API.get("/Projects", { params });
    //  //const totalRecords=data.length;
    //   const totalRecords = await API.get("/Projects/totaldata");
    //   setProjects(data);
    //  setTotalRecords(totalRecords.data);
    } catch (error) {
      console.error("Sorting error:", error);
      message.error("Failed to fetch sorted data");
    }
  };

  const columns = [
    {
      title: "ProjectName",
      dataIndex: "ProjectName",
      key: "ProjectName",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
      sorter: true,
    },
    {
      title: "TeamMembers",
      key: "TeamMember",

      sorter: true,
      render: (record: Project) =>
        record.TeamMember.map((m) => m.Name).join(","),
    },
    //e
    {
      title: "TeamLead",

      key: "TeamLead",
      sorter:  true,
      render: (record: Project) =>  record.TeamLead ? record.TeamLead.Name : "",
    },//e
    {
      title: "Action",
      key: "action",
      render: (record: Project) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => {
              //form.setFieldsValue(record);
              form.setFieldsValue({
                ...record,
                TeamMember: record.TeamMember.map((m) => m.Id),
                TeamLead:record.TeamLead?.Name,
                //TeamLead: role === "Admin" ? record.TeamLead?.Id :record.TeamLead,
              });
              setEditProject(record);
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
            >{role=="Admin"?<Button type="primary" onClick={showModal}>
                <PlusOutlined /> Create Project
              </Button>: null}
             
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
              {/* <Input
                placeholder="Search by TeamMember"
                value={teamMemberName}
                onChange={(e) => setTeamMemberName(e.target.value)}
                allowClear
                style={{ width: 200 }}
              /> */}

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
              dataSource={projects.map((project) => ({
                ...project,
                key: project.Id,
              }))}
              columns={columns}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: totalRecords,
                onChange: (page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                  fetchProjects();
                },
              }}
              bordered
              onChange={handleTableChange}
            />
            ;
          </Content>
          <Modal
            closable={{ "aria-label": "Custom Close Button" }}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={null}
          >
            <Form form={form} onFinish={onFinish} layout="vertical">
              <Form.Item
                label="ProjectName"
                name="ProjectName"
                rules={[{ required: true, message: "project name required" }]}
              
              >
                <Input placeholder="Enter project name"    disabled={role == "TeamLead"}/>
              </Form.Item>
              <Form.Item
                label="Description"
                name="Description"
                rules={[{ required: true, message: "description required" }]}
              >
                <Input placeholder="enter description" />
              </Form.Item>
              <Form.Item
                label="Team_Member"
                name="TeamMember"
                rules={[{ required: true, message: "Teammember required" }]}
              >
                <Select mode="multiple" placeholder="chooose member">
                  {members.map((member) => (
                    <Select.Option
                      //key=={member.Id}
                      //value={JSON.stringify(member)}
                      value={member.Id}

                      //label={member.Name}
                    >
                      {member.Name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              
              <Form.Item
                label="TeamLead"
                name="TeamLead"
                rules={[{ required: true, message: "TeamLead required" }]}
              >
                
                <Select placeholder="Choose TeamLead"  disabled={role == "TeamLead"}>
                  {leaders.map((leader) => (
                    <Select.Option  value={leader.Id}>
                      {leader.Name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
                    
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  {editProject?"Update Project":"Add Project"}
                 
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Layout>
      </Layout>
    </>
  );
};

export default ProjectComponent;
