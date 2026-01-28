import { useEffect, useState } from "react";
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
  List, ListItem, Divider, Chip, Box, TextField, MenuItem, Paper, Button
} from "@mui/material";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

import api from "../services/api";
import { STATUS_COLORS } from "../utils/statusColors";

const AUDIT_LIMIT = 5;

export default function JobList({ refreshTrigger, onRefresh }) {
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ count: 0, next: null, previous: null });
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(25);
  const [currentUrl, setCurrentUrl] = useState("/api/applications/");

  const fetchJobs = async (url) => {
    try {
      const res = await api.get(url);
      setJobs(res.data.results || []);
      setMeta({
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
      });
      setCurrentUrl(url);
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

      {jobs.map(job => (
        <Accordion key={job.id} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <Typography fontWeight="bold" width="25%">{job.company_name}</Typography>
              <Typography color="text.secondary" flexGrow={1}>{job.position}</Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                {job.needs_followup && <Chip label="Needs Follow-up" color="warning" size="small" />}
                <Chip label={job.current_status.replace("_", " ")}
                      color={STATUS_COLORS[job.current_status] || "default"} size="small" />
                <DeleteOutlineIcon fontSize="small" sx={{ cursor: "pointer" }} onClick={e => handleDelete(e, job.id)} />
              </Box>
            </Box>
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
                >Mark Follow-up Sent</Button>

                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <ContactSupportIcon />
                  <Typography variant="subtitle2">Networking & Follow-up</Typography>
                </Box>
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

      {/* Pagination */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
        <Button disabled={!meta.previous} onClick={() => fetchJobs(meta.previous)}>Previous</Button>
        <Button disabled={!meta.next} onClick={() => fetchJobs(meta.next)}>Next</Button>
      </Box>
    </Box>
  );
}
