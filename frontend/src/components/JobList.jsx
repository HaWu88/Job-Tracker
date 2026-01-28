import { useEffect, useState } from "react";
import { 
    Accordion, 
    AccordionSummary, 
    AccordionDetails, 
    Typography, 
    List, 
    ListItem, 
    Divider, 
    Chip, 
    Box, 
    TextField, 
    MenuItem,
    Paper, 
    Button,
} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import api from "../services/api";
import { STATUS_COLORS } from "../utils/statusColors";

const AUDIT_LIMIT = 5;

export default function JobList({ refreshTrigger, onRefresh }) {

    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({ count: 0, next: null, previous: null });
    const [statusFilter, setStatusFilter] = useState("all");
    const [showAllAudits, setShowAllAudits] = useState(false);


    useEffect(() => {
        const query = statusFilter !== "all" ? `?status=${statusFilter}` : "";
        api.get(`/api/applications/${query}`)
            .then(res => {
               if (res.data.results) {
                setJobs(res.data.results);
                setMeta({
                    count: res.data.count,
                    next: res.data.next,
                    previous: res.data.previous,
                });
                } else {
                    setJobs(res.data);
                    setMeta({ count: res.data.length, next: null, previous: null });
                }
            })
        .catch(err => {
            console.error(err);
            setJobs([]); // Ensure jobs is always an array
        });
    }, [refreshTrigger, statusFilter]);

    const handleStatusUpdate = async (jobId, newStatus) => {
        try {
            await api.patch(`/api/applications/${jobId}/`, { current_status: newStatus });
            if (onRefresh) {onRefresh();}
        } catch (err) {
            console.error("Update failed", err.response?.data || err.message);
        }
    };

    const handleDelete = async (e, jobId) => {
        // This prevents the Accordion from opening/closing when you click delete
        e.stopPropagation(); 
        
        if (window.confirm("Are you sure you want to delete this application?")) {
            try {
                await api.delete(`/api/applications/${jobId}/`);
                if (onRefresh) onRefresh();
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    return (
        <Box sx={{ mt: 2, pb: 5 }}>
            {/* FILTER BAR */}
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>Filter By:</Typography>
                {['all', 'applied', 'interview', 'needs_followup', 'rejected'].map((f) => (
                    <Chip
                        key={f}
                        label={f.replace('_', ' ').toUpperCase()}
                        clickable
                        color={statusFilter === f ? STATUS_COLORS[f] || "default" : "default"}
                        variant={statusFilter === f ? "filled" : "outlined"}
                        onClick={() => setStatusFilter(f)}
                    />
                ))}
            </Paper>

            <Typography variant="h6" gutterBottom>Application History</Typography>
            <Typography variant="caption">
                Showing {jobs.length} of {meta.count} applications
            </Typography>

            {jobs.length === 0 && (
                <Typography color="textSecondary">No applications found.</Typography>
            )}
           {jobs.map(job => (
                <Accordion key={job.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', pr: 1 }}>
                            <Typography sx={{ fontWeight: 'bold', width: '25%' }}>{job.company_name}</Typography>
                            <Typography sx={{ color: 'text.secondary', flexGrow: 1 }}>{job.position}</Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {job.needs_followup && (
                                    <Chip
                                        label="Needs Follow-up"
                                        color="warning"
                                        size="small"
                                    />
                                )}
                                <Chip 
                                    label={job.current_status.replace('_', ' ')} 
                                    color={STATUS_COLORS[job.current_status] || "default"} 
                                    size="small" 
                                />
                                <DeleteOutlineIcon
                                    fontSize="small"
                                    sx={{ cursor: "pointer" }}
                                    onClick={(e) => handleDelete(e, job.id)}
                                    />
                                {/* <Box
                                    role="button"
                                    tabIndex={0}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        cursor: "pointer"
                                    }}
                                    onClick={(e) => handleDelete(e, job.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleDelete(e, job.id);
                                        }
                                    }}
                                    >
                                    <DeleteOutlineIcon fontSize="small" />
                                </Box> */}
                            </Box>
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                        {/* COLD OUTREACH / CONTACT SECTION */}
                        {job.needs_followup && (
                            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, mb: 3, borderLeft: '4px solid #9c27b0' }}>
                                <Box sx={{ mb: 2 }}>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="warning"
                                        onClick={async () => {
                                            await api.post(`/api/applications/${job.id}/mark_followup_sent/`);
                                            onRefresh();
                                        }}
                                    >
                                        Mark Follow-up Sent
                                    </Button>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <ContactSupportIcon color="secondary" />
                                    <Typography variant="subtitle2">Networking & Follow-up</Typography>
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    Have you messaged a recruiter at <strong>{job.company_name}</strong> yet? 
                                    <br />
                                    <em>Pro-tip: Find a Peer on LinkedIn and ask about the team culture!</em>
                                </Typography>
                            </Box>
                        )}
                        {/* STATUS UPDATE */}
                        <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                            <Typography variant="subtitle2">Quick Update:</Typography>
                            <TextField
                                select
                                size="small"
                                value={job.current_status}
                                onChange={(e) =>
                                handleStatusUpdate(job.id, e.target.value)
                                }
                            >
                                {[
                                "applied",
                                "phone_screen",
                                "on_site",
                                "offer",
                                "accepted",
                                "rejected",
                                ].map((s) => (
                                <MenuItem key={s} value={s}>
                                    {s.replace("_", " ")}
                                </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                         {/* AUDIT HISTORY */}
                        <Typography variant="subtitle2" gutterBottom color="primary">Status Transition Audit:</Typography>
                        <List dense>
                            {job.audits?.length > 0 ? (
                                [...job.audits]
                                .slice(-AUDIT_LIMIT)
                                .reverse()
                                .map((audit) => (
                                    <ListItem key={audit.id} sx={{ px: 0 }}>
                                        <Typography variant="body2">
                                            &bull; {audit.previous_status} &rarr;{" "}
                                            <strong>{audit.new_status}</strong>{" "}
                                            ({new Date(audit.changed_at).toLocaleString()})
                                        </Typography>
                                    </ListItem>
                                ))
                            ) : <Typography variant="caption">No history recorded.</Typography>}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}