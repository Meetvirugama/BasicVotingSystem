import { Routes, Route, Navigate } from "react-router-dom";
import Page from "./components/Page";
import Profile from "./components/profile";
import ElectionCreate from "./components/ElectionCreate";
import Upcoming from "./components/UpcomingEle";
import Result from "./components/PrevEle";
import Verify from "./auth/VerificationPage";
import Protected from "./components/Protected";
import EditElection from "./components/EditElection";

export default function App() {
  return (
    <Routes>

      {/* AUTH */}
      <Route path="/verify" element={<Verify />} />

      {/* PROTECTED */}
      <Route path="/" element={<Protected><Page /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/upcoming" element={<Protected><Upcoming /></Protected>} />
      <Route path="/results" element={<Protected><Result /></Protected>} />
      <Route path="/election/create" element={<Protected><ElectionCreate /></Protected>} />

      {/* ADMIN ONLY */}
      <Route
        path="/admin/election/edit/:id"
        element={
          <Protected adminOnly>
            <EditElection />
          </Protected>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}
