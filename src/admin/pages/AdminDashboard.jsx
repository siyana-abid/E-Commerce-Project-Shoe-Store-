import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Get the order amount
function getOrderAmount(order) {
  const total =
    order.totalAmount ??
    order.total ??
    order.amount ??
    order.grandTotal;

  if (total !== undefined && total !== null) {
    return Number(total) || 0;
  }

  if (Array.isArray(order.items)) {
    return order.items.reduce((sum, item) => {
      return (
        sum +
        Number(item.price || 0) *
          Number(item.quantity || 1)
      );
    }, 0);
  }

  return 0;
}

// Get order date
function getOrderDate(order) {
  const date =
    order.createdAt ||
    order.date ||
    order.orderDate;

  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [productResponse, userResponse, orderResponse] =
          await Promise.all([
            axios.get(`${API_URL}/products`),
            axios.get(`${API_URL}/users`),
            axios.get(`${API_URL}/orders`),
          ]);

        setProducts(productResponse.data);
        setUsers(userResponse.data);
        setOrders(orderResponse.data);
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => {
    return sum + getOrderAmount(order);
  }, 0);

  // Last 7 days revenue
  const dailyRevenue = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);

    const dayRevenue = orders.reduce((sum, order) => {
      const orderDate = getOrderDate(order);

      if (!orderDate) return sum;

      const sameDay =
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear();

      return sameDay ? sum + getOrderAmount(order) : sum;
    }, 0);

    dailyRevenue.push({
      label: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
      revenue: dayRevenue,
    });
  }

  // Order status calculation
  const statusNames = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const orderStatuses = statusNames.map((status) => {
    const count = orders.filter(
      (order) =>
        String(order.status || "").toLowerCase() ===
        status.toLowerCase()
    ).length;

    return {
      name: status,
      count,
    };
  });

  // Chart values
  const maxRevenue = Math.max(
    ...dailyRevenue.map((item) => item.revenue),
    1
  );

  const maxStatus = Math.max(
    ...orderStatuses.map((item) => item.count),
    1
  );

  // Line chart points
  const chartPoints = dailyRevenue
    .map((item, index) => {
      const x = 40 + index * 75;
      const y = 180 - (item.revenue / maxRevenue) * 145;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-7">

      {/* Header */}
      <div>
        <p className="text-[10px] tracking-[4px] uppercase text-[#A58A4A] mb-2">
          Overview
        </p>

        <h1 className="text-3xl font-bold text-[#3B2A22]">
          Admin Dashboard
        </h1>

        <p className="text-sm text-[#8B776B] mt-2">
          Welcome to TREDORA Admin Panel
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center text-[#8B776B]">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Products */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#704B49] text-white flex items-center justify-center text-xl mb-4">
                ◇
              </div>

              <p className="text-sm text-[#8B776B]">
                Products
              </p>

              <h2 className="text-2xl font-semibold text-[#3B2A22] mt-1">
                {products.length}
              </h2>
            </div>

            {/* Users */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#9B7A24] text-white flex items-center justify-center text-xl mb-4">
                ♙
              </div>

              <p className="text-sm text-[#8B776B]">
                Users
              </p>

              <h2 className="text-2xl font-semibold text-[#3B2A22] mt-1">
                {users.length}
              </h2>
            </div>

            {/* Orders */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#704B49] text-white flex items-center justify-center text-xl mb-4">
                ▣
              </div>

              <p className="text-sm text-[#8B776B]">
                Orders
              </p>

              <h2 className="text-2xl font-semibold text-[#3B2A22] mt-1">
                {orders.length}
              </h2>
            </div>

            {/* Revenue */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#9B7A24] text-white flex items-center justify-center text-xl mb-4">
                ₹
              </div>

              <p className="text-sm text-[#8B776B]">
                Total Revenue
              </p>

              <h2 className="text-2xl font-semibold text-[#9B7A24] mt-1">
                {formatCurrency(totalRevenue)}
              </h2>
            </div>

          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Daily Revenue Chart */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-[#704B49]">
                Daily Revenue
              </h2>

              <p className="text-xs text-[#8B776B] mt-1">
                Revenue generated during the last 7 days
              </p>

              <div className="mt-6 overflow-x-auto">
                <svg
                  viewBox="0 0 520 230"
                  className="w-full min-w-[420px]"
                >
                  {/* Grid lines */}
                  {[35, 83, 131, 180].map((y) => (
                    <line
                      key={y}
                      x1="40"
                      y1={y}
                      x2="490"
                      y2={y}
                      stroke="#E9E3DC"
                      strokeDasharray="3 3"
                    />
                  ))}

                  {/* Revenue line */}
                  <polyline
                    points={chartPoints}
                    fill="none"
                    stroke="#805B55"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {dailyRevenue.map((item, index) => {
                    const x = 40 + index * 75;
                    const y =
                      180 - (item.revenue / maxRevenue) * 145;

                    return (
                      <circle
                        key={item.label}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="white"
                        stroke="#805B55"
                        strokeWidth="2"
                      />
                    );
                  })}

                  {/* Date labels */}
                  {dailyRevenue.map((item, index) => (
                    <text
                      key={item.label}
                      x={40 + index * 75}
                      y="210"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#8B776B"
                    >
                      {item.label}
                    </text>
                  ))}
                </svg>
              </div>

            </div>

            {/* Orders by Status Chart */}
            <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm">

              <h2 className="text-lg font-semibold text-[#704B49]">
                Orders by Status
              </h2>

              <p className="text-xs text-[#8B776B] mt-1">
                Overview of current order statuses
              </p>

              <div className="mt-6 h-[230px] flex items-end justify-around gap-3 border-b border-[#E9E3DC] px-2">

                {orderStatuses.map((item) => (
                  <div
                    key={item.name}
                    className="flex-1 h-full flex flex-col justify-end items-center"
                  >
                    <span className="text-xs text-[#8B776B] mb-2">
                      {item.count}
                    </span>

                    <div
                      className="w-full max-w-12 bg-[#805B55] rounded-t-md hover:bg-[#9B7A24] transition"
                      style={{
                        height: `${Math.max(
                          (item.count / maxStatus) * 160,
                          item.count > 0 ? 5 : 0
                        )}px`,
                      }}
                    />

                    <span className="text-[10px] text-[#8B776B] mt-3 text-center">
                      {item.name}
                    </span>
                  </div>
                ))}

              </div>

            </div>

          </div>
        </>
      )}

    </div>
  );
}

export default AdminDashboard;