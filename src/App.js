import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./MainPage/Pages/Home";
import NotFound from "./MainPage/Pages/NotFound";
import Login from "./Pages/AuthPages/Login";
import Register from "./Pages/AuthPages/Register";
import LabComponent from "./Pages/LabComponent/LabComponent";
import LabSkin from "./Pages/LabComponent/LabSkin";

import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard";
import Profile from "./Pages/ProfilePage/Profile";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./auth";
import DoctorsList from "./Pages/DoctorsListPage/DoctorsListPage";
import Chat from "./Pages/ChatPage/Chat";
import axios from "axios";
import AppointmentPage from "./Pages/Appointment/AppointmentPage";
import Appointments from "./Pages/Appointment/AppointmentsDoctor";
import ChatList from "./Pages/ChatList/ChatList";
import Verification from "./Pages/Verification/VerificationPage";
import DoctorDetails from "./Pages/AdminDashboard/DoctorDetails";


function App() {

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<DoctorsList />} />
            <Route path="/chat/:id" element={<Chat />} />
            <Route path="/lab-skin" element={<LabSkin />} />
            <Route path="/chat-list/:id" element={<ChatList />} />
            <Route path="/verification/:id" element={<Verification />} />
            <Route path="admin-doctors/:id" element={<DoctorDetails />} />




            <Route path="/profile/:doctorId" element={<Profile />} />
            <Route path="/appo/:id" element={<AppointmentPage/>} />
            <Route path="/appoD/:id" element={<Appointments/>} />


            
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/lab" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <LabComponent />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
