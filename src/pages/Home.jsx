
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserCart } from "../services/cartService";

function Home() {
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Get cart count from JSON Server
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        if (!user?.id) return;

        const cart = await getUserCart(user.id);

        if (cart && cart.items) {
          const totalQuantity = cart.items.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
          );

          setCartCount(totalQuantity);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.log("Failed to fetch cart count:", error);
      }
    };

    fetchCartCount();

    // Refresh count when user returns to this page
    window.addEventListener("focus", fetchCartCount);

    return () => {
      window.removeEventListener("focus", fetchCartCount);
    };
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem("user");

    alert("Logged out successfully!");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 bg-white shadow-sm">

        <Link to="/" className="text-2xl font-bold">
          TREDORA
        </Link>

        <div className="flex items-center gap-6">

          <Link
            to="/home"
            className="font-semibold hover:text-gray-500"
          >
            Home
          </Link>

          <Link
            to="/orders"
            className="font-semibold hover:text-gray-500"
          >
            Orders
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative hover:opacity-70"
            aria-label={`Cart with ${cartCount} items`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>

            {/* Cart Count Badge */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className="bg-[rgb(59,42,34)] text-white px-5 py-2 rounded-full hover:bg-[rgb(81,57,46)] transition"
          >
            Logout
          </button>

        </div>
      </nav>

      {/* Home Content */}
      <div className="p-10">

        <h1 className="text-3xl font-bold">
          Welcome {user?.name || "User"}!
        </h1>

      </div>

    </div>
  );
}

export default Home;
