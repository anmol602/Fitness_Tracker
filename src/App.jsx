
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Progress from "./pages/Progress";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function Protected({ children }) {
  const token = localStorage.getItem("token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
       

        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workouts" element={<Workouts />} />
          <Route path="nutrition" element={<Nutrition />} />
          <Route path="progress" element={<Progress />} />
          <Route path="analytics" element={<Analytics />} />
           <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
