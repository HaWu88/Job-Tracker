import { useEffect, useState } from "react";
import {
  Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Tooltip,
  List, ListItem, Divider, Chip, Box, TextField, MenuItem, Paper, Button, IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Menu } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import api from "../services/api";
import { STATUS_COLORS } from "../utils/statusColors";

const AUDIT_LIMIT = 5;
const STATUS_OPTIONS = [
  "applied",
  "phone_screen",
  "interview",
  "offer",
  "accepted",
  "rejected",
];



export default function JobList({ refreshTrigger, onRefresh }) {
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ count: 0, next: null, previous: null });
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(25);
  const [editingJobId, setEditingJobId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [selectedJobForStatus, setSelectedJobForStatus] = useState(null);

  const fetchJobs = async (url) => {
    try {
      const res = await api.get(url);
      setJobs(res.data.results || []);
      setMeta({
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
      });

    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) window.location.href = "/login";
    }
  };

  useEffect(() => {
    let url = `/api/applications/?page_size=${pageSize}`;
    if (statusFilter !== "all") url += `&status=${statusFilter}`;
    fetchJobs(url);
  }, [refreshTrigger, statusFilter, pageSize]);
  
  
  const handleDelete = async (e, jobId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this application?")) return;

    try {
      await api.delete(`/api/applications/${jobId}/`);
      onRefresh?.();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <Box sx={{ mt: 2, pb: 5 }}>
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <Typography variant="body2" fontWeight="bold">Filter:</Typography>
        {["all", "applied", "interview", "needs_followup", "rejected"].map(f => (
          <Chip
            key={f}
            label={f.replace("_", " ").toUpperCase()}
            clickable
            color={statusFilter === f ? STATUS_COLORS[f] || "default" : "default"}
            variant={statusFilter === f ? "filled" : "outlined"}
            onClick={() => setStatusFilter(f)}
          />
        ))}
        <TextField
          select
          size="small"
          label="Page Size"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
        >
          {[10, 25, 50, 100].map(size => <MenuItem key={size} value={size}>{size}</MenuItem>)}
        </TextField>
      </Paper>

      <Typography variant="h6">Application History</Typography>
      <Typography variant="caption" sx={{ mb: 2, display: "block" }}>
        Showing {jobs.length} of {meta.count} applications
      </Typography>

      {jobs.length === 0 && <Typography color="text.secondary">No applications found.</Typography>}
      
      {/* TABLE HEADER - Hidden on mobile, visible on desktop */}
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: 'grey.100', 
          p: 2, 
          mb: 1, 
          border: '1px solid #e0e0e0', 
          display: { xs: 'none', md: 'block' },
          pr: 8 // Buffer for the Accordion Arrow
        }}
      >
        <Grid container spacing={2}>
          <Grid size={{ md: 3 }}><Typography variant="caption" fontWeight="bold">COMPANY</Typography></Grid>
          <Grid size={{ md: 3 }}><Typography variant="caption" fontWeight="bold">POSITION</Typography></Grid>
          <Grid size={{ md: 3 }}><Typography variant="caption" fontWeight="bold">CONTACT INFO</Typography></Grid>
          <Grid size={{ md: 3 }} sx={{ textAlign: 'right' }}><Typography variant="caption" fontWeight="bold">STATUS & ACTIONS</Typography></Grid>
        </Grid>
      </Paper>
      {/* END TABLE HEADER */ }
      {jobs.map(job => (
        <Accordion 
          key={job.id}
          expanded={expandedId === job.id}
          onChange={(e, isExpanded) => setExpandedId(isExpanded ? job.id : false)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            component="div"
            sx={{ 
              "& .MuiAccordionSummary-content": { m: 0, width: "100%" },
              cursor: 'pointer'
            }}
          >
            <Grid container spacing={2} alignItems="center" sx={{ width: "100%" }}>
              
              {/* 1. Company */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>Company:</Typography>
                  <Typography fontWeight="bold" noWrap>{job.company_name}</Typography>
                </Box>
              </Grid>

              {/* 2. Position */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>Position:</Typography>
                  <Typography color="text.secondary" noWrap>{job.position}</Typography>
                </Box>
              </Grid>

              {/* 3. Contact Info */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="caption" fontWeight="bold" sx={{ display: { md: 'none' }, color: 'text.secondary', mt: 0.5 }}>Contact:</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: { xs: 'right', md: 'left' } }}>
                    <Typography variant="caption" noWrap>{job.contact_name || ""}</Typography>
                    {job.contact_email && (
                      <Typography variant="caption" color="primary" noWrap sx={{ display: 'flex', alignItems: 'center', justifyContent: {xs: 'flex-end', md: 'flex-start'}, gap: 0.5 }}>
                        <MailOutlineIcon sx={{ fontSize: 12 }} /> {job.contact_email}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              {/* 4. Status & Actions */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Box 
                  onClick={(e) => e.stopPropagation()} 
                  sx={{ 
                    display: "flex", 
                    gap: 1.5, 
                    alignItems: 'center', 
                    justifyContent: { xs: 'space-between', md: 'flex-end' },
                    pr: { md: 2 }
                  }}
                >
                  <Typography variant="caption" fontWeight="bold" sx={{ display: { md: 'none' }, color: 'text.secondary' }}>Status:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {job.needs_followup && <Chip label="!!" color="warning" size="small" />}
                      <Chip
                        label={job.current_status.replace("_", " ")}
                        color={STATUS_COLORS[job.current_status] || "default"}
                        size="small"
                        clickable
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusAnchorEl(e.currentTarget);
                          setSelectedJobForStatus(job);
                        }}
                      />
                      <IconButton size="small" onClick={() => { setExpandedId(job.id); setEditingJobId(job.id); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={(e) => handleDelete(e, job.id)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </AccordionSummary>

          <AccordionDetails>
            {job.needs_followup && (
              <Box sx={{ p: 2, mb: 3, bgcolor: "#f9f9f9", borderLeft: "4px solid #ff9800" }}>
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={async () => {
                    await api.post(`/api/applications/${job.id}/mark_followup_sent/`);
                    onRefresh?.();
                  }}
                > Follow-up Sent</Button>

                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <ContactSupportIcon />
                  <Typography variant="subtitle2">Networking & Follow-up</Typography>
                </Box>
              </Box>
            )}
            {editingJobId === job.id && (
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
               
                <TextField
                  size="small"
                  label="Company"
                  value={job.company_name}
                  onChange={(e) => {
                    const updated = jobs.map(j =>
                      j.id === job.id ? { ...j, company_name: e.target.value } : j
                    );
                    setJobs(updated);
                  }}
                />

                <TextField
                  size="small"
                  label="Position"
                  value={job.position}
                  onChange={(e) => {
                    const updated = jobs.map(j =>
                      j.id === job.id ? { ...j, position: e.target.value } : j
                    );
                    setJobs(updated);
                  }}
                />


                <TextField
                  size="small"
                  label="Contact Name"
                  value={job.contact_name || ""}
                  onChange={(e) => {
                    const updated = jobs.map(j =>
                      j.id === job.id ? { ...j, contact_name: e.target.value } : j
                    );
                    setJobs(updated);
                  }}
                />

                <TextField
                  size="small"
                  label="Contact Email"
                  value={job.contact_email || ""}
                  onChange={(e) => {
                    const updated = jobs.map(j =>
                      j.id === job.id ? { ...j, contact_email: e.target.value } : j
                    );
                    setJobs(updated);
                  }}
                />

                <Button
                  size="small"
                  variant="contained"
                  onClick={async () => {
                    const payload = {
                      company_name: job.company_name,
                      position: job.position,
                      current_status: job.current_status,
                      contact_name: job.contact_name?.trim() || null,
                      contact_email: job.contact_email?.trim() || null,
                    };
                    
                    try {
                      await api.patch(`/api/applications/${job.id}/`, payload);
                      setEditingJobId(null);
                      onRefresh?.();
                    } catch (err) {
                      console.error("PATCH error:", err.response?.data);
                    }
                    

                    setEditingJobId(null);
                    onRefresh?.();
                  }}
                >
                  Save
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setEditingJobId(null)}
                >
                  Cancel
                </Button>
              </Box>
            )}


            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2">Audit History</Typography>
            <List dense>
              {job.audits?.length ? [...job.audits].slice(-AUDIT_LIMIT).reverse().map(a => (
                <ListItem key={a.id} sx={{ px: 0 }}>
                  <Typography variant="body2">
                    {a.previous_status} → <strong>{a.new_status}</strong> ({new Date(a.changed_at).toLocaleString()})
                  </Typography>
                </ListItem>
              )) : <Typography variant="caption">No history</Typography>}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
      <Menu
        anchorEl={statusAnchorEl}
        open={Boolean(statusAnchorEl)}
        onClose={() => {
          setStatusAnchorEl(null);
          setSelectedJobForStatus(null);
        }}
      >
        {STATUS_OPTIONS.map((status) => (
          <MenuItem
            key={status}
            onClick={async () => {
              if (!selectedJobForStatus) return;

              try {
                await api.patch(
                  `/api/applications/${selectedJobForStatus.id}/`,
                  { current_status: status }
                );

                onRefresh?.();
              } catch (err) {
                console.error("Status update failed:", err.response?.data);
              }

              setStatusAnchorEl(null);
              setSelectedJobForStatus(null);
            }}
          >
            {status.replace("_", " ")}
          </MenuItem>
        ))}
      </Menu>

      {/* Pagination */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button disabled={!meta.previous} onClick={() => fetchJobs(meta.previous)}>Previous</Button>
        <Button disabled={!meta.next} onClick={() => fetchJobs(meta.next)}>Next</Button>
      </Box>
    </Box>
  );
}
