import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
    // Load Google script dynamically
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
        if (!window.google) return; // ensure Google Identity loaded
            /* global google */
        google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
        });
        google.accounts.id.renderButton(
            document.getElementById("googleButton"),
            { theme: "outline", size: "large", width: 250 }
        );
    };
    document.body.appendChild(script);

    return () => {
        document.body.removeChild(script);
    };
    }, []);

    const handleCredentialResponse = async (response) => {
    try {
        const res = await api.post("/api/social/google/", {
            access_token: response.credential, // Send Google's token to backend
        });
        // Backend returns DRF-JWT tokens
        const { access, refresh } = res.data;
        // AuthContext handles decoding, call login with raw strings
        login(access, refresh);

        navigate("/"); // go to dashboard
    } catch (err) {
        console.error("Login failed:", err.response?.data || err.message);
        alert("Google login failed. Try again.");
    }
    };

    return (
        <div style={{ textAlign: "center", marginTop: 50 }}>
            <h2>Login with Google</h2>
            <div id="googleButton"></div>
        </div>
    );
}
