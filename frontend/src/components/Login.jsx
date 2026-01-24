// import { useGoogleLogin } from "@react-oauth/google";
// import { useAuth } from "../auth/AuthContext";
// import api from "../services/api";

// export default function Login() {
//   const { login } = useAuth();

//   const googleLogin = useGoogleLogin({
//     flow: "implicit",
//     scope: "email profile",
//     onSuccess: async (tokenResponse) => {
//       try {
//         const res = await api.post("/auth/google/", {
//           access_token: tokenResponse.access_token,
//         });

//         login(res.data.access);
//       } catch (err) {
//         console.error("Google Login Failed:", err.response?.data);
//       }
//     },
//     onError: () => {
//       console.error("Google OAuth failed");
//     },
//   });

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Login with Google</h2>
//       <button onClick={() => googleLogin()}>
//         Sign in with Google
//       </button>
//     </div>
//   );
// }
