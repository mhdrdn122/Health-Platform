import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useAuth();
  const location = useLocation();

  if (!auth) {
    return <Navigate to="/login" state={{ path: location.pathname }} />;
  }

  const role = localStorage.getItem("role");

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" state={{ path: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
