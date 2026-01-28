import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../services/api";
import { STATUS_COLORS } from "../utils/statusColors";
import { Typography, Paper, Box, Chip } from "@mui/material";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Updated palette: Dimmed/Muted versions of the original colors
const muiToHex = (status) => {
    const type = STATUS_COLORS[status];
    const palette = {
        primary: "#3180c4", //  Blue
        warning: "#df9754", //  Orange
        success: "#46a84d", //  Green
        error:   "#c04747", //  Red
        default: "#b0b0b0"  // Soft Grey
    };
    return palette[type] || palette.default;
};

export default function Dashboard({ refreshTrigger }) {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [totalApps, setTotalApps] = useState(0); // Store total count
    const [staleCount, setStaleCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [refreshTrigger]);

    const fetchStats = async () => {
        try {
            const res = await api.get("/api/dashboard/");
            const statusData = res.data.status_counts || [];
            
            // Calculate total applications
            const total = statusData.reduce((sum, item) => sum + item.count, 0);
            setTotalApps(total);
            setStaleCount(res.data.stale_applications || 0);

            const backgroundColors = statusData.map((s) => muiToHex(s.current_status));

            setChartData({
                labels: statusData.map((s) => s.current_status.replace("_", " ").toUpperCase()),
                datasets: [
                    {
                        // The label here is still used for the Tooltip (hover)
                        label: "Applications",
                        data: statusData.map((s) => s.count),
                        backgroundColor: backgroundColors,
                        borderRadius: 4,
                    },
                ],
            });
        } catch (err) {
            console.error("Dashboard error: ", err);
        } finally {
            setLoading(false);
        }
    };

    // Chart Options to hide the legend and adjust scaling
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false, // This removes the "Blue Box + Applications" title
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // Cleaner for small counts
                }
            }
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3, minHeight: '300px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Applications
                    </Typography>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                        {totalApps}
                    </Typography>
                </Box>
                
                {staleCount > 0 && (
                    <Chip 
                        label={`STALE: ${staleCount}`} 
                        color="error" 
                        variant="outlined" 
                        size="small"
                    />
                )}
            </Box>
            
            {loading ? (
                <Typography>Loading Stats...</Typography>
            ) : chartData.labels.length > 0 ? (
                <Bar data={chartData} options={options} />
            ) : (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography color="textSecondary">No data available yet.</Typography>
                </Box>
            )}
        </Paper>
    );
}