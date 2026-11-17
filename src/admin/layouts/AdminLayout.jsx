import { NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");

    toast.success("Logged out successfully");

    navigate("/login", { replace: true });
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
      isActive
        ? "bg-[#70501D] text-[#F5E7B5]"
        : "text-[#E8DCCB] hover:bg-[#51392E]"
    }`;

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col md:flex-row">

      {/* Sidebar */}
      <aside className="w-full md:w-48 lg:w-52 shrink-0 bg-[#3B2A22] text-[#F5F1E8] min-h-screen p-5 flex flex-col">

        {/* Brand */}
        <div className="mb-10 border-b border-white/10 pb-5">
          <h1 className="text-2xl font-bold tracking-widest">
            TREDORA
          </h1>

          <p className="text-[10px] tracking-[4px] text-[#C5A45D] mt-2 uppercase">
            Admin Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">

          <NavLink to="/admin" end className={linkStyle}>
            <span>▦</span>
            Dashboard
          </NavLink>

          <NavLink to="/admin/products" className={linkStyle}>
            <span>◇</span>
            Products
          </NavLink>

          <NavLink to="/admin/users" className={linkStyle}>
            <span>♙</span>
            Users
          </NavLink>

        </nav>

        {/* Bottom links */}
        <div className="mt-auto pt-10 space-y-3">

          <button
            onClick={() => navigate("/home")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#E8DCCB] hover:bg-[#51392E] transition"
          >
            <span>⌂</span>
            View Store
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#51392E] text-[#F5F1E8] hover:bg-[#654638] transition"
          >
            <span>↪</span>
            Logout
          </button>

        </div>
      </aside>

      {/* Dashboard content */}
      <main className="flex-1 min-w-0 p-5 md:p-8 lg:p-10">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;