
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
    `block px-4 py-3 rounded-xl font-medium transition ${
      isActive
        ? "bg-[#3B2A22] text-[#F5F1E8]"
        : "text-[#3B2A22] hover:bg-[#EAE3D8]"
    }`;

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex">

      <aside className="w-64 bg-white min-h-screen p-6 border-r border-[#3B2A22]/10">

        <h1 className="text-2xl font-bold text-[#3B2A22] mb-2">
          TREDORA
        </h1>

        <p className="text-sm text-[#8B776B] mb-10">
          Admin Panel
        </p>

        <nav className="space-y-3">

          <NavLink to="/admin" end className={linkStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/products" className={linkStyle}>
            Products
          </NavLink>

          <NavLink to="/admin/users" className={linkStyle}>
            Users
          </NavLink>

        </nav>

        <button
          onClick={handleLogout}
          className="w-full mt-12 px-4 py-3 rounded-xl text-left font-semibold text-red-700 hover:bg-red-50 transition"
        >
          Logout
        </button>

      </aside>

      <main className="flex-1 p-6 md:p-10">

        <Outlet />

      </main>

    </div>
  );
}

export default AdminLayout;
