import { useState } from "react";
import { Typography, Paper, Box,  
        TextField, Button, MenuItem } from "@mui/material";
import api from "../services/api";

const STATUS_OPTIONS = ["applied", "phone_screen", "on_site", "offer", "rejected"];

export default function JobForm({ onRefresh }) {
  const [form, setForm] = useState({
    company_name: "",
    position: "",
    current_status: "applied",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/applications/", form);
      setForm({ company_name: "", position: "", current_status: "applied" });
      if (onRefresh) onRefresh(); // Callback to refresh the list/chart
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Add New Application</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Company"
          value={form.company_name}
          onChange={(e) => setForm({ ...form, company_name: e.target.value })}
          required
        />
        <TextField
          label="Position"
          value={form.position}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
          required
        />
        <TextField
          select
          label="Status"
          value={form.current_status}
          onChange={(e) => setForm({ ...form, current_status: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>{opt.replace('_', ' ')}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" size="large">Add Job</Button>
      </Box>
    </Paper>
  );
}
