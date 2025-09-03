import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Registration";
import DoctorDashboard from "./pages/doctor/DoctorDasboard";
import PatientDashboard from "./pages/patient/PatientDashboard";
import MyAppointments from "./pages/patient/Appointments";
import HomePage from "./pages/Home";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/patient/dashboard" element={<PatientDashboard/>} />
        <Route path="/patient/appointments" element={<MyAppointments/>} />
      </Routes>
    </Router>
  );
}

export default App;
