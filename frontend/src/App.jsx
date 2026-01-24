import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import JobForm from "./components/JobForm";
import JobList from "./components/JobList";
import PrivateRoute from "./auth/PrivateRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <>
              <Dashboard />
              <JobForm />
              <JobList />
            </>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
