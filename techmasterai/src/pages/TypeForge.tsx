import { Navigate } from "react-router-dom";

export default function TypeForge() {
  // Redirect to spells page by default
  return <Navigate to="/typeforge/spells" replace />;
}