import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import UnAuthorizedPage from "./UnAuthorizedPage";
interface props {
  children: ReactNode;
  AllowedRoles: string[];
}
const ProtechtedRoute: React.FC<props> = ({ children, AllowedRoles }) => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const role = user?.Role; // Admin | TeamLead | User

  if (token && token != "") {
    if (role && AllowedRoles.includes(role)) {
      return children;
    } else {
      return <UnAuthorizedPage />;
    }
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default ProtechtedRoute;
