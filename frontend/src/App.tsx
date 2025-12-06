import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
//import './App.css'
import TeamComponent from './Components/TeamComponent'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectComponent from './Components/ProjectComponent'
import TaskComponent from './Components/TaskComponent';
import Login from './Components/Login';
import Register from './Components/Register';
import ProtechtedRoute from './Components/ProtectedRoute';
function App() {
  //const [count, setCount] = useState(0)

  return (

    // <Router>
    //   <Routes>
    //     <Route path='/login' element={<Login/>}/>
    //     <Route path='/register' element={<Register/>}/>
    //     <Route path='/Team'element={<TeamComponent />} />
    //     <Route path='/' element={<ProjectComponent/>}/>
    //     <Route path='/Task' element={<TaskComponent/>}></Route>

    //   </Routes>
    // </Router >
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Wrap protected routes like this */}
      <Route
        path="/team"
        element={
          <ProtechtedRoute AllowedRoles={["Admin"]}>
            <TeamComponent />
          </ProtechtedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtechtedRoute AllowedRoles={["Admin", "TeamLead"]}>
            <ProjectComponent />
          </ProtechtedRoute>
        }
      />
      <Route
        path="/task"
        element={
          <ProtechtedRoute AllowedRoles={["Admin", "TeamLead", "User"]}>
            <TaskComponent />
          </ProtechtedRoute>
        }
      />
    </Routes>

  );
}

export default App
