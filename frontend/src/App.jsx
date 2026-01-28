import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Container, Box, Button } from "@mui/material";

import { useAuth } from "./auth/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import JobForm from "./components/JobForm";
import JobList from "./components/JobList";
import PrivateRoute from "./auth/PrivateRoute";

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated, logout } = useAuth();

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {isAuthenticated && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={logout}>
            Logout
          </Button>
        </Box>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Dashboard refreshTrigger={refreshTrigger} />
                <JobForm onRefresh={handleRefresh} />
                <JobList refreshTrigger={refreshTrigger} onRefresh={handleRefresh} />
              </Box>
            </PrivateRoute>
          }
        />
      </Routes>
    </Container>
  );
}
