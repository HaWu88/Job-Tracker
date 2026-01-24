import { useEffect, useState } from "react";
import api from "../services/api";

export default function JobList() {
const [jobs, setJobs] = useState([]);

useEffect(() => {
    api.get("/api/applications/")
    .then(res => setJobs(res.data))
    .catch(err => console.error(err));
}, []);

return (
    <ul>
    {jobs.map(job => (
        <li key={job.id}>
        {job.company_name} — {job.position} ({job.current_status})
        </li>
    ))}
    </ul>
);
}



