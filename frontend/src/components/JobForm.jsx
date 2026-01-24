import { useState } from "react";
import api from "../services/api";

const JobForm = ({ onCreate }) => {
const [form, setForm] = useState({
    company_name: "",
    position: "",
    location: "",
    applied_date: "",
    current_status: "applied",
});

const submit = async (e) => {
    e.preventDefault();
    await api.post("/api/applications/", form);
    setForm({ company_name: "", position: "" });
};


return (
    <form onSubmit={submit}>
    <input placeholder="Company" onChange={e => setForm({ ...form, company_name: e.target.value })} />
    <input placeholder="Role" onChange={e => setForm({ ...form, position: e.target.value })} />
    <button>Add</button>
    </form>
);
};

export default JobForm;
