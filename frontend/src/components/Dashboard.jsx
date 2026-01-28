import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../services/api";
import { STATUS_COLORS } from "../utils/statusColors";
import { Typography, Paper, Box, Chip } from "@mui/material"; // Cleaned imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// A small helper to turn MUI names into Hex codes
const muiToHex = (status) => {
    const type = STATUS_COLORS[status];
    const palette = {
        primary: "#1976d2", // MUI Blue
        warning: "#f5a442", // MUI Orange
        success: "#26962c", // MUI Green
        error:   "#d73a3a", // MUI Red
        default: "#9e9e9e"  // MUI Grey
    };
    return palette[type] || palette.default;
};

export default function Dashboard({ refreshTrigger }) {
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });
    const [staleCount, setStaleCount] = useState(0); // Added to store stale count
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [refreshTrigger]);

    const fetchStats = async () => {
        try {
            const res = await api.get("/api/dashboard/");
            const statusData = res.data.status_counts || [];
            setStaleCount(res.data.stale_applications || 0);
            const backgroundColors = statusData.map((s) => muiToHex(s.current_status));

            setChartData({
                labels: statusData.map((s) => s.current_status.replace("_", " ")),
                datasets: [
                    {
                        label: "Applications",
                        data: statusData.map((s) => s.count),
                        backgroundColor: backgroundColors,
                    },
                ],
            });
        } catch (err) {
            console.error("Dashboard error: ", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3, minHeight: '300px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Application Status</Typography>
                {staleCount > 0 && (
                    <Chip label={`STALE: ${staleCount}`} color="error" variant="outlined" />
                )}
            </Box>
            
            {loading ? (
                <Typography>Loading Stats...</Typography>
            ) : chartData.labels.length > 0 ? (
                <Bar data={chartData} options={{ responsive: true }} />
            ) : (
                <Box sx={{ py: 5, textAlign: 'center' }}>
                    <Typography color="textSecondary">No data available yet. Add your first job below!</Typography>
                </Box>
            )}
        </Paper>
    );
}