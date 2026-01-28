import { useState } from "react";
import { Typography, Paper, Box, Grid,
        TextField, Button, MenuItem } from "@mui/material";
import api from "../services/api";

const STATUS_OPTIONS = ["applied", "phone_screen", "on_site", "offer", "accepted", "rejected"];

export default function JobForm({ onRefresh }) {
    const [form, setForm] = useState({
        company_name: "",
        position: "",
        current_status: "applied",
        contact_name: "",  
        contact_email: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { 
                ...form, 
                applied_date: new Date().toISOString().split('T')[0] 
            };
            await api.post("/api/applications/", payload);
            setForm({ 
                company_name: "", 
                position: "", 
                current_status: "applied", 
                contact_name: "", 
                contact_email: "" 
            });
            if (onRefresh) onRefresh(); 
            } catch (err) {
                console.error("Submit error", err);
            }
    };

return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Add New Application</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4}}>
            <TextField
                fullWidth label="Company" required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4}}>
            <TextField
              fullWidth label="Position" required
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4}}>
            <TextField
              select fullWidth label="Status"
              value={form.current_status}
              onChange={(e) => setForm({ ...form, current_status: e.target.value })}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt.replace('_', ' ')}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 5}}>
            <TextField
              fullWidth label="Contact Name"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 5}}>
            <TextField
              fullWidth label="Contact Email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            />
          </Grid>
            <Grid 
                size={{ xs: 12, md: 2}}
                sx={{ display: "flex", alignItems: "center" }}
            >
            <Button type="submit" variant="contained" fullWidth sx={{ height: '56px' }}>
              Add Job
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}