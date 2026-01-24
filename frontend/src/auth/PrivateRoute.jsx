// import { Navigate } from "react-router-dom";
// import { useAuth } from "./AuthContext";

// export default function PrivateRoute({ children }) {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) return null; // or spinner later

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// }
