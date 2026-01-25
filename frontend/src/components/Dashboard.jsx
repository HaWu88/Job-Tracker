import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../services/api";
import { 
    Typography, 
    Paper, 
    Box,
} from "@mui/material";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Tooltip,
Legend
);

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard({ refreshTrigger }) {
    const [chartData, setChartData] = useState({labels: [], datasets: [],});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [refreshTrigger]);

    const fetchStats = async () => {
    try {
      const res = await api.get("/api/dashboard/");
      const statusData = res.data.status_counts || [];

      setChartData({
        labels: statusData.map((s) => s.current_status),
        datasets: [
          {
            label: "Applications",
            data: statusData.map((s) => s.count),
            backgroundColor: "rgba(25, 118, 210, 0.6)",
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
    <Paper sx={{ p: 3, minHeight: '300px' }}>
      <Typography variant="h6" gutterBottom>
        Application Status
      </Typography>
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
