import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/",
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh JWT if expired
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            localStorage.getItem("refresh_token")
            ) {
            originalRequest._retry = true;
            try {
                const refreshRes = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
                    { refresh: localStorage.getItem("refresh_token") }
                );
                const { access } = refreshRes.data;
                localStorage.setItem("access_token", access);
                originalRequest.headers["Authorization"] = `Bearer ${access}`;
                return axios(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token failed", refreshError);
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }}
    return Promise.reject(error);
  }
);

export default api;