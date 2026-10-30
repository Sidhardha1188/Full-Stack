import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
export default function ProtectedRoute({children}){const {user}=useApp();const loc=useLocation();return user?children:<Navigate to="/login" state={{from:loc.pathname}} replace/>;}