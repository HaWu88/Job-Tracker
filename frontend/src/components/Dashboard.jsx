import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../services/api";
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

export default function Dashboard() {
const [data, setData] = useState(null);

useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // Don't even try if we don't have a token yet

    api.get("/api/dashboard/")
        .then(res => setData(res.data))
        .catch(err => {
            if (err.response?.status === 401) {
                console.error("Session expired or invalid token");
                // Optional: clear localstorage and redirect to login
            }
            console.error("Dashboard error: ", err);
        });
}, []);

if (!data) return <p>Loading dashboard...</p>

return (
    <Bar
    data={{
        labels: data.status_counts.map(s => s.current_status),
        datasets: [{
        label: "Applications",
        data: data.status_counts.map(s => s.count),
        }]
    }}
    />
);
}
