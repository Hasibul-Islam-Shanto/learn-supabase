import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import RightRail from "./RightRail";
import { useAuth } from "../../context/auth-context";

export default function AppLayout() {
  const { session } = useAuth();
  if (!session) return <Navigate to="/signin" replace />;
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <Sidebar />
        <main className="min-w-0">
          <Outlet />
        </main>
        <RightRail />
      </div>
    </div>
  );
}
