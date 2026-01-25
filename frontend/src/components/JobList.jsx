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
    IconButton,
    Tooltip 
} from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from "../services/api";

export default function JobList({ refreshTrigger, onRefresh }) {

    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        api.get("/api/applications/")
        .then(res => setJobs(res.data))
        .catch(err => console.error("Fetch jobs error:", err));
    }, [refreshTrigger]);

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
            <Typography variant="h6" gutterBottom>Application History</Typography>
            
            {jobs.length === 0 && (
                <Typography color="textSecondary">No applications found.</Typography>
            )}

            {jobs.map(job => (
                <Accordion key={job.id} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            width: '100%', 
                            alignItems: 'center', 
                            pr: 1 
                        }}>
                            <Typography sx={{ fontWeight: 'bold', width: '25%' }}>
                                {job.company_name}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', flexGrow: 1 }}>
                                {job.position}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                    label={job.current_status.replace('_', ' ')} 
                                    color={
                                        job.current_status === 'rejected' ? 'error' : 
                                        job.current_status === 'offer' ? 'success' : 'primary'
                                    } 
                                    size="small" 
                                />
                                
                                <Tooltip title="Delete Application">
                                    <IconButton 
                                        edge="end" 
                                        size="small" 
                                        onClick={(e) => handleDelete(e, job.id)}
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </AccordionSummary>

                    <AccordionDetails>
                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="subtitle2">Quick Update Status:</Typography>
                            <TextField
                                select
                                size="small"
                                value={job.current_status}
                                onChange={(e) => handleStatusUpdate(job.id, e.target.value)}
                                sx={{ minWidth: 200 }}
                            >
                                <MenuItem value="applied">Applied</MenuItem>
                                <MenuItem value="phone_screen">Phone Screen</MenuItem>
                                <MenuItem value="on_site">On Site Interview</MenuItem>
                                <MenuItem value="remote">Remote Interview</MenuItem>
                                <MenuItem value="offer">Offer</MenuItem>
                                <MenuItem value="accepted">Accepted</MenuItem>
                                <MenuItem value="rejected">Rejected</MenuItem>
                            </TextField>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" gutterBottom color="primary">
                            Status Transition Audit:
                        </Typography>
                        
                        <List dense>
                            {job.audits && job.audits.length > 0 ? (
                                [...job.audits].reverse().map((audit) => (
                                    <ListItem key={audit.id} sx={{ px: 0 }}>
                                        <Typography variant="body2">
                                            • Moved from <strong>{audit.previous_status}</strong> to <strong>{audit.new_status}</strong> on {new Date(audit.changed_at).toLocaleString()}
                                        </Typography>
                                    </ListItem>
                                ))
                            ) : (
                                <Typography variant="caption" color="textSecondary">
                                    No status changes recorded yet. Update the status above to see history.
                                </Typography>
                            )}
                        </List>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}