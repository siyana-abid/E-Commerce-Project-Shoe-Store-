
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#3B2A22] mb-2">
        Admin Dashboard
      </h1>

      <p className="text-[#8B776B] mb-8">
        Welcome to TREDORA Admin Panel.
        Manage your store from here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Products Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#3B2A22]/10">
          <h2 className="text-lg font-semibold text-[#3B2A22] mb-3">
            Products
          </h2>

          <p className="text-[#8B776B] mb-4">
            Manage your shoe collection and product details.
          </p>

          <button
            onClick={() => navigate("/admin/products")}
            className="text-sm font-medium text-[#F5F1E8] bg-[#3B2A22] px-5 py-2 rounded-lg hover:bg-[#51392e] transition"
          >
            Manage Products →
          </button>
        </div>

        {/* Users Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#3B2A22]/10">
          <h2 className="text-lg font-semibold text-[#3B2A22] mb-3">
            Users
          </h2>

          <p className="text-[#8B776B] mb-4">
            View and manage registered customers.
          </p>

          <button
            onClick={() => navigate("/admin/users")}
            className="text-sm font-medium text-[#F5F1E8] bg-[#3B2A22] px-5 py-2 rounded-lg hover:bg-[#51392e] transition"
          >
            Manage Users →
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
