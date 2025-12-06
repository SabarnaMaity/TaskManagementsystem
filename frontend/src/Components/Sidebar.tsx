// import React from 'react'
// import { AppstoreOutlined, MailOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
// import type { MenuProps } from 'antd';
// import { Menu } from 'antd';
// import { useNavigate } from 'react-router-dom';

// // type MenuItem = Required<MenuProps>['items'][number];
// const items:MenuProps["items"]=[
//     {
//         key: '/Team',
//         icon:<UserOutlined />,
//         label: 'Team members',
//     },
//     {
//         key: '/',
//         icon:<AppstoreOutlined />,
//         label: 'Projects',
//     },
//     {
//         key: '/Task',
//         icon:<SettingOutlined />,
//         label: 'Task',
//     },
// ]

// const Sidebar = () => {
//     const navigate = useNavigate()

//   const handleClick: MenuProps['onClick'] = (e) => {
//     navigate(e.key)
//   }

//   return (
//     <>
//         <div  style={{padding:"13px", fontSize:"28px", fontWeight:"bold",background:"#fff"}}>
//             TaskManagement
//         </div>
//         <Menu theme='dark' style={{ width: 200 }} selectedKeys={[location.pathname]} mode="vertical" items={items} onClick={handleClick}/>
//     </>

//   )
// }

// export default Sidebar

import React, { useMemo } from "react";
import {
  AppstoreOutlined,
  LogoutOutlined,
  MailOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Button, Menu } from "antd";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  //  Get user role from localStorage (you set it when login)
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.Role; // Admin | TeamLead | User
  // Dynamically build menu items based on role
  const items: MenuProps["items"] = useMemo(() => {
    if (role === "Admin") {
      return [
        {
          key: "/Team",
          icon: <UserOutlined />,
          label: "Team members",
        },
        {
          key: "/",
          icon: <AppstoreOutlined />,
          label: "Projects",
        },
        {
          key: "/Task",
          icon: <SettingOutlined />,
          label: "Task",
        },
      ];
    } else if (role === "TeamLead") {
      return [
        {
          key: "/",
          icon: <AppstoreOutlined />,
          label: "Projects",
        },
        {
          key: "/Task",
          icon: <SettingOutlined />,
          label: "Task",
        },
      ];
    } else {
      // Default → Normal User
      return [
        {
          key: "/Task",
          icon: <SettingOutlined />,
          label: "Task",
        },
      ];
    }
  }, [role]);

  const handleClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <>
      <div
        style={{
          padding: "13px",
          fontSize: "28px",
          fontWeight: "bold",
          background: "#fff",
        
        }}
      >
        TaskManagement
         {/* Welcome:{user.Name} */}
      </div>
     
      <Menu
        theme="dark"
        style={{ width: 200 }}
        selectedKeys={[location.pathname]}
        mode="vertical"
        items={items}
        onClick={handleClick}
      />
     
    </>
  );
};

export default Sidebar;
