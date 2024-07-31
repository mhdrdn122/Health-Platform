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
import Profile from "./Pages/ProfilePage/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./auth";
import DoctorsList from "./Pages/DoctorsListPage/DoctorsListPage";
import Chat from "./Pages/ChatPage/Chat";
import AppointmentPage from "./Pages/Appointment/AppointmentPage";
import Appointments from "./Pages/Appointment/AppointmentsDoctor";
import ChatList from "./Pages/ChatList/ChatList";
import Verification from "./Pages/Verification/VerificationPage";
import DoctorDetails from "./Components/AdmindashboardComponents/DoctorDetails";


function App() {
  const role = localStorage.getItem("role")

  return (
    <div className="App">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<DoctorsList />} />

            <Route path="/profile/:id" element={
              <ProtectedRoute allowedRoles={[role]}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Auth Pages  */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />





            {/* Chat Pages */}
            {/* <Route path="/chat/:id" element={<Chat />} /> */}

            <Route path="/chat/:id" element={
              <ProtectedRoute allowedRoles={[role]}>
                <Chat />
              </ProtectedRoute>
            } />

            <Route path="/chat-list/:id" element={
              <ProtectedRoute allowedRoles={[role]}>
                <ChatList />
              </ProtectedRoute>
            } />




            {/* doctor Pages */}
            <Route path="/verification/:id" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Verification />
              </ProtectedRoute>
            } />

            
            <Route path="/lab-skin" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <LabSkin />
              </ProtectedRoute>
            } />



            
            <Route path="/lab-brain" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <LabComponent />
              </ProtectedRoute>
            } />
            

           


            {/* appointments Pages */}
            <Route path="/appointments/:id" element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Appointments />
              </ProtectedRoute>
            } />


            <Route path="/appointment/:id" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppointmentPage />
              </ProtectedRoute>
            } />




            {/* Admin Pages  */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/admin-doctors/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DoctorDetails />
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
