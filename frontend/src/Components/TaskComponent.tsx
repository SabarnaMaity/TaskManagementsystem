import {
  Avatar,
  Button,
  DatePicker,
  Form,
  Input,
  Layout,
  List,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
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
import type {
  CommentInterface,
  Project_Detail,
  TaskInterface,
  Team_Member,
} from "../interface/TaskInterface";
import API from "../api/Api";
import form from "antd/es/form";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import type { ActivityInterface } from "../interface/ActivityInterface";
import { useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const TaskComponent = () => {
  const [tasks, setTasks] = useState<TaskInterface[]>([]);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);

  const [members, setMembers] = useState<Team_Member[]>([]);
//  const[projectMember,setProjectMember]=useState<Team_Member[]>([]);
  const [projects, setProjects] = useState<Project_Detail[]>([]);
  const [editTask, setEditTask] = useState<string | any>(undefined);
  const [title, setTitle] = useState("");
  const [teamMemberName, setTeamMemberName] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [page, setPage] = useState(1); // start from page 1 -S1
  const [pageSize, setPageSize] = useState(5); // 5 rows per page

  const [totalRecords, setTotalRecords] = useState(); //s1 total records from backend
  //Activity states :

  const [activities, setActivities] = useState<ActivityInterface[]>([]);
  //  Comment States
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [comments, setComments] = useState<CommentInterface[]>();
  const [newComment, setNewComment] = useState("");
  const [selectedMember, setSelectedMember] = useState<{
    Id: string;
    Name: string;
  } | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>("");

  //Get user role from localStorage (you set it when login)

   const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.Role; 
   const fetchTasks = async () => {
    try {
      let url = `/Task`;
      if (role != "Admin" && user?.Id) {
        // const { data } = await API.get(`/Projects?TeamLeadId=${user.Id}`);
        // setProjects(data);
        url += `?teamLeadId=${user.Id}`;
      }
      const { data } = await API.get(url);
      
     // const { data } = await API.get(`/Task`);

      setTasks(data);
      console.log("task displayed");
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchTasks();
  }, []);

  // const id
  const fetchProjects = async () => {
    try {
      let url=`/Projects`
      if(role!="Admin" && user?.Id){
        // const { data } = await API.get(`/Projects?TeamLeadId=${user.Id}`);
     // setProjects(data);
      url += `?TeamId=${user.Id}`;
      }
      
      const { data } = await API.get(url);
      // console.log("fetched tasks", data);
      setProjects(data);
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
    
  }, []);



  const handleDelete = async (id: string) => {
    try {
      await API.post(`/Task/deleteTask/${id}`);
      console.log("task deleted sucessfuly");
      fetchTasks();
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
    setEditTask(undefined);
    //setEditingCommentId(null);
    // setNewComment('');
  };

  const showModal2 = () => {
    setIsModal2Open(true);
  };

  const handleOk2 = () => {
    setIsModal2Open(false);
  };

  const handleCancel2 = () => {
    setIsModal2Open(false);
    setEditingCommentId(null);
    setNewComment("");
  };

  //date conversion functions

  //date validation:
  // const validateEndDate = (_: any, endDate: any) => {
  //   const startDate = form.getFieldValue("StartDate");
  //   if (!startDate || !endDate || endDate.isSameOrAfter(startDate, 'day')) {
  //     return Promise.resolve();
  //   }
  //   return Promise.reject("End date cannot be before start date");
  // };

  // const handleSearch = async () => {
  //   try {
  //     //const values = await form.validateFields();
  //     const params: any = {};//An empty object params is initialized to store query parameters for the API request.
  //     if (title.trim()) params.title = title.trim();//If the name variable (after trimming whitespace) is not empty, its trimmed value is added to the params object as params.name.
  //     if (status) params.status = status;
  //     if (teamMemberName.trim()) params.teamMemberName = teamMemberName.trim();

  //     if (values.StartDate) {
  //       params.startDate = values.StartDate.toDate().toISOString(); // ISO string
  //     }

  //     if (values.EndDate) {
  //       params.endDate = values.EndDate.toDate().toISOString(); // ISO string
  //     }

  //     const { data } = await API.get('/Task', { params });
  //     setTasks(data);
  //   } catch (error) {
  //     console.error('Search error:', error);
  //     message.error('Failed to fetch filtered tasks');
  //   }
  // };

  const handleSearch = async () => {
    try {
      const params: any = {};
       if (role != "Admin" && user?.Id) {
        params.teamLeadId = user.Id;
      }
      if (title.trim()) params.title = title.trim();
      if (status) params.status = status;
      if (teamMemberName.trim()) params.teamMemberName = teamMemberName.trim();

      if (startDate) params.startDate = startDate.toISOString(); // ISO format
      if (endDate) params.endDate = endDate.toISOString(); // ISO format

      const { data } = await API.get("/Task", { params });
      setTasks(data);
    } catch (error) {
      console.error("Search error:", error);
      message.error("Failed to fetch filtered tasks");
    }
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
      if (sorter.field === "Title") {
        field = "title";
      } else if (sorter.field === "Description") {
        field = "description";
      } else if (sorter.field === "StartDate") {
        field = "startDate";
      } else if (sorter.field === "EndDate") {
        field = "endDate";
      } else if (sorter.field === "Status") {
        field = "status";
      } else if (sorter.columnKey === "TeamMember") {
        field = "teamMemberName";
      } else if (sorter.columnKey === "Project") {
        field = "projectName";
      }

      const params: any = {};


      if(role!="Admin"&& user?.Id){
        params.teamLeadId=user.Id;
      }
       if (field && order) {
        params.sortBy = field;
        params.sortOrder = order;
      }
      const { data } = await API.get("/Task", { params });
      console.log("taskdata",data);
      const totalRecords=data.length;
     // const totalRecords = await API.get("/Task/totaldata");
      setTasks(data);
      setTotalRecords(totalRecords.data);
      if (pagination) {
        params.page = pagination.current;
        params.pageSize = pagination.pageSize;
      } 

      // if (field && order) {
      //   params.sortBy = field;
      //   params.sortOrder = order;
      // }

    //   const { data } = await API.get("/Task", { params });
    //   console.log("taskdata",data);
    //  // const totalRecords=data.length;
    //   const totalRecords = await API.get("/Task/totaldata");
    //   setTasks(data);
    //   setTotalRecords(totalRecords.data);

    
     
    } catch (error) {
      console.error("Sorting error:", error);
      message.error("Failed to fetch sorted data");
    }
  };
//comment by login:


  const onFinish = async (values: any) => {
    // console.log("values.Project:", values.Project);
    // console.log("All projects:", values);

    const memberData = members.filter((m) => values.TeamMember.includes(m.Id));
    //const projectData=projects.filter((p=>values.Project.includes(p.Id)));
    const projectData = projects.find((p) => p.Id === values.Project);
   
    try {
      const backendData = {
        Title: values.Title,
        Description: values.Description,
        StartDate: values.StartDate,
        EndDate: values.EndDate,
        Project: 
          {
            Id: projectData?.Id,
            ProjectName: projectData?.ProjectName,
            TeamLeadId: projectData?.TeamLead.Id,
          },
        
        TeamMember:memberData.map((m) => ({
          Id: m.Id,
          Name: m.Name,
        })),

        Status: values.Status,
      };

      if (editTask) {
        await API.post(`/Task/updateTask/${editTask.Id}`, backendData);
        message.success("task edited sucessfully");
      } else {
        await API.post(`/Task`, backendData);
        message.success("task added sucessfully");
        //console.log("Payload sent to backend:", backendData);
      }
      // console.log("Payload sent to backend:", backendData);

      // await API.post(`/Task`, backendData);
      // //await API.post(`/Projects`,values);
      // console.log("task added sucessfuly");
    } catch (error) {
      console.log("error", error);
    }
    setIsModalOpen(false);

    fetchTasks();
    form.resetFields();
    // window.location.reload();
  };

  // const openCommentModal = () => {
  //  // setSelectedTaskId(taskId);
  //   setIsModal2Open(true);
  //  // loadComments(taskId);
  //   //setSelectedTaskId(taskId);
  // };

  // COMMENT API HANDLING:

  const openCommentModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModal2Open(true);
    loadComments(taskId);
    setSelectedTaskId(taskId);
  };

  //  Load comments for a task
  const loadComments = async (taskId: string) => {
    try {
      const { data } = await API.get<CommentInterface[]>(
        `/Task/${taskId}/comments`
      );
      console.log("Loaded comments:", data);
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleAddComment = async (taskId: string) => {
    if (!newComment.trim()) return;

    try {
      const { data } = await API.post(`/Task/${taskId}/comments`, {
        Text: newComment,
        Author: {
          Id: user?.Id,
          Name: user?.Name,
        },
      });
      console.log(data);
      message.success("Comment added!");
      setNewComment("");
      loadComments(taskId);
    } catch (error) {
      console.error("Error adding comment:", error);
      message.error("Error adding comment");
    }
  };

  // getting activity of the specified task
  const getTaskActivity = async (taskId: string) => {
    const res = await API.get(`/Task/Activity?taskId=${taskId}`);
    console.log(taskId);
    console.log(res.data);

    return res.data;
  };
  useEffect(() => {
    if (selectedTaskId && isModal2Open) {
      getTaskActivity(selectedTaskId)
        .then((data) => setActivities(data))
        .catch((err) => console.error(err));
    }
  }, [selectedTaskId, isModal2Open]);

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      await API.post(`/Task/${selectedTaskId}/deleteComment/${commentId}`);
      loadComments(selectedTaskId);
      message.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      message.error("Failed to delete comment");
    }
  };

  const handleEditComment = async (commentId: string, newText: string) => {
    console.log(commentId);
    try {
      const { data } = await API.post(
        `/Task/${selectedTaskId}/editComment/${commentId}?newText=${newText}`
      );

      console.log(data);
      setEditingCommentId(null);
      setNewComment("");
      loadComments(selectedTaskId);

      message.success("Comment updated");
    } catch (error) {
      console.error("Error editing comment:", error);
      message.error("Failed to edit comment");
    }
  };
  const navigate = useNavigate();
  const handleLogOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };
  const columns = [
    {
      title: "TaskTitle",
      dataIndex: "Title",
      key: "Title",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
      sorter: true,
    },
    {
      title: "StartDate",
      dataIndex: "StartDate",
      key: "StartDate",
      sorter: true,
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },
    {
      title: "EndDate",
      dataIndex: "EndDate",
      key: "EndDate",
      sorter: true,
      render: (d: string) => dayjs(d).format("DD-MMM-YYYY"),
    },

    // {
    //   title: 'AssignedMember',
    //   key: 'TeamMember',
    //   render: (record: TaskInterface) =>
    //     record.TeamMember.map(m => m.Name)

    // },

    // {
    //   title: 'ProjectAssigned',
    //   key: 'Project',
    //   render: (record: TaskInterface) =>
    //     record.Project.map(m => m.ProjectName)

    // },

    {
      title: "AssignedMember",
      key: "TeamMember",
      sorter: true,
      render: (record: TaskInterface) =>
        record.TeamMember.map((m) => m.Name).join(", "),
    },
    {
      title: "ProjectAssigned",
      key: "Project",
      sorter: true,
      render:  (record: TaskInterface) => record.Project.ProjectName,
    },
    {
      title: "status",
      dataIndex: "Status",
      key: "Status",
      sorter: true,
      render: (status: string) => {
        let color = status.length < 5 ? "geekblue" : "green";
        if (status === "Cancelled") {
          color = "volcano";
        }

        return (
          <Tag color={color} key={status}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",

      render: (record: TaskInterface) => (
        <Space>
          <Button
            style={{ width: "40px" }}
            type="primary"
            onClick={() => {
              console.log("the record is ", record);

              form.setFieldsValue({
                Title: record.Title,
                Description: record.Description,
                StartDate: dayjs(record.StartDate),
                EndDate: dayjs(record.EndDate),
                //Project: record.Project?.[0]?.Id,
                Project: record.Project?.Id,
                TeamMember: record.TeamMember?.map((member) => member.Id),
                Status: record.Status,
              });

              setEditTask(record);
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
            <Button style={{ width: "50px" ,padding: "10px"}} type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
          <Button
            style={{ width: "80px", padding: "10px" }}
            type="default"
            onClick={() => openCommentModal(record.Id)}
          >
            Comments
          </Button>
        </Space>
      ),
    },
  ];


  return (
    <>
      <Layout style={{ height: "100vw" }}>
        <Sider>
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
                <PlusOutlined /> Create Task
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
                placeholder="Search by Title,description,member"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
              {/* <Input
                placeholder="Search by  member"
                value={teamMemberName}
                onChange={(e) => setTeamMemberName(e.target.value)}
                allowClear
                style={{ width: 200 }}
              /> */}
              <Select
                placeholder="Select status"
                value={status || undefined}
                onChange={(value) => setStatus(value)}
                allowClear
                style={{ width: 200 }}
              >
                <Select.Option value="InProgress">InProgress</Select.Option>
                <Select.Option value="Done">Done</Select.Option>
                <Select.Option value="ToDo">ToDo</Select.Option>
                <Select.Option value="Cancelled">Cancelled</Select.Option>
              </Select>
              {/* Start Date Picker */}
              <DatePicker
                placeholder="Start Date"
                value={startDate}
                onChange={(date) => setStartDate(date)}
                style={{ width: 180 }}
              />

              {/* End Date Picker */}
              <DatePicker
                placeholder="End Date"
                value={endDate}
                onChange={(date) => setEndDate(date)}
                style={{ width: 180 }}
              />

              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                Search
              </Button>
              {/* <Button type="default"  icon={<PlusOutlined />} style={{backgroundColor:"#d3f261"}} onClick={() => openCommentModal()}>
            Add Comments
          </Button> */}
            </Space>
          </div>
          <Content>
            <Table
              style={{ padding: "24px" }}
              dataSource={tasks.map((task) => ({ ...task, key: task.Id }))}
              columns={columns}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: totalRecords,
                onChange: (page, pageSize) => {
                  
                  setPage(page);
                  setPageSize(pageSize);
                  fetchTasks();
                },
              }}
              bordered
              onChange={handleTableChange}
              tableLayout="fixed"
            />
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
                label="TaskTitle"
                name="Title"
                rules={[{ required: true, message: "Task title required" }]}
              >
                <Input placeholder="Enter Task title" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="Description"
                rules={[
                  { required: true, message: "Task description required" },
                ]}
              >
                <Input placeholder="enter description" />
              </Form.Item>

              <Form.Item
                label="StartDate"
                name="StartDate"
                rules={[{ required: true, message: "start date required" }]}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item
                label="EndDate"
                name="EndDate"
                rules={[{ required: true, message: "end date required" }]}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item
                label="Team_Member"
                name="TeamMember"
                rules={[{ required: true, message: "Team required" }]}
              >
                <Select mode="multiple" placeholder="chooose member">
                  {members.map((member) => (
                    <Select.Option key={member.Id} value={member.Id}>
                      {member.Name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="Project_Name"
                name="Project"
                rules={[{ required: true, message: "project name required" }]}
              >
                <Select placeholder="chooose project"
                 >
                  {projects.map((project) => (
                    <Select.Option key={project.Id} value={project.Id}>
                      {project.ProjectName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Status"
                name="Status"
                rules={[{ required: true, message: "Team required" }]}
              >
                <Select
                  placeholder="Select a status"
                  options={[
                    {
                      value: "ToDo",
                      label: "ToDo",
                    },
                    {
                      value: "InProgress",
                      label: "InProgress",
                    },
                    {
                      value: "Done",
                      label: "Done",
                    },
                    {
                      value: "Cancelled",
                      label: "Cancelled",
                    },
                  ]}
                />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  {editTask?"Update Task":"Add Task"}
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          {/*  Comment Modal */}

          <Modal
            title="Comments"
            open={isModal2Open}
            // onCancel={() => setIsModal2Open(false)}
            onCancel={handleCancel2}
            footer={null}
          >
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="Comments" key="1">
                <List
                  dataSource={comments}
                  renderItem={(item: CommentInterface) => (
                    <List.Item
                      actions={[
                        <a
                          key="edit"
                          onClick={() => {
                            setNewComment(item.Text);
                            setEditingCommentId(item.Id);
                          }}
                        >
                          Edit
                        </a>,
                        <a
                          key="delete"
                          onClick={() => handleDeleteComment(item.Id)}
                        >
                          Delete
                        </a>,
                      ]}
                    >
                      <div>
                        <Tooltip title={item.Author?.Name} placement="top">
                          <Avatar
                            style={{ backgroundColor: "#87d068" }}
                            icon={<UserOutlined />}
                          />
                        </Tooltip>
                        <strong style={{ paddingLeft: "3px" }}>
                          {item.Author?.Name}
                        </strong>{" "}
                        : {item.Text}
                        <div
                          style={{
                            marginLeft: "auto",
                            fontSize: "12px",
                            color: "#888",
                            paddingLeft: "30px",
                          }}
                        >
                          {new Date(item.CreatedAt).toLocaleString()}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />

                {/* Dropdown for selecting member */}
                {/* <Select
                  placeholder="Select your Name "
                  style={{ width: "100%", marginTop: 8, marginBottom: 9 }}
                  onChange={(value) => setSelectedMember(JSON.parse(value))}
                >
                  {members.map((member) => (
                    <Select.Option
                      key={member.Id}
                      value={JSON.stringify({
                        Id: member.Id,
                        Name: member.Name,
                      })}
                      rules={[{ required: true, message: "Team required" }]}
                    >
                      {member.Name}
                    </Select.Option>
                  ))}
                </Select> */}

                <TextArea
                  rows={3}
                  placeholder="Write a comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                {/* <Button type="primary" block onClick={showModal2} style={{ marginTop: 8 }}>
                Add Comment
              </Button> */}
                <Button
                  type="primary"
                  block
                  //  onClick={() => handleAddComment(selectedTaskId)}
                  onClick={() => {
                    editingCommentId
                      ? handleEditComment(editingCommentId, newComment)
                      : handleAddComment(selectedTaskId);
                  }}
                  style={{ marginTop: 8 }}
                >
                  {editingCommentId ? "Edit Comment" : "Add Comment"}
                </Button>
              </Tabs.TabPane>

              <Tabs.TabPane tab="Task Activity" key="2">
                <List
                  dataSource={activities}
                  renderItem={(item: ActivityInterface) => (
                    <List.Item>
                      <span>{item.Action}</span>
                      <div
                        style={{
                          marginLeft: "auto",
                          fontSize: "12px",
                          color: "#888",
                        }}
                      >
                        {new Date(item.CreatedAt).toLocaleString()}
                      </div>
                    </List.Item>
                  )}
                />
              </Tabs.TabPane>
            </Tabs>
          </Modal>
        </Layout>
      </Layout>
    </>
  );
};

export default TaskComponent;
