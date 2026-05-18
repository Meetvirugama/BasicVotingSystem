import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import VerificationPage from "./auth/VerificationPage";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import PollDetail from "./pages/PollDetail";
import CreatePoll from "./pages/CreatePoll";
import Leaderboard from "./pages/Leaderboard";
import Tasks from "./pages/Tasks";
import AdminTasks from "./pages/AdminTasks";
import AdminAutogen from "./pages/AdminAutogen";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/verify"
        element={!user ? <VerificationPage /> : <Navigate to="/dashboard" />}
      />
      
      <Route
        path="/"
        element={user ? <DashboardLayout /> : <Navigate to="/verify" />}
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Home />} />
        <Route path="polls/:id" element={<PollDetail />} />
        <Route path="categories" element={<CreatePoll />} />
        <Route path="create" element={<CreatePoll />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="admin/tasks" element={<AdminTasks />} />
        <Route path="admin/autogen" element={<AdminAutogen />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
