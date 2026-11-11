
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/cartSlice";
function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const reduxCartItems = useSelector((state) => state.cart.items);

  const totalItems = reduxCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(clearCart());
    setIsMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="relative flex justify-between items-center px-4 sm:px-6 md:px-12 py-5 border-b border-[rgba(59,42,34,0.2)]">
      {/* Logo */}
      <Link to="/home" className="brand-name text-2xl" onClick={closeMenu}>
        TREDORA
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8 font-medium text-sm">
        <Link to="/home">Home</Link>
        <Link to="/shop">Shop</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/orders">Orders</Link>

 <Link to="/cart" className="relative flex items-center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="25"
    height="25"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2 3h2l2.5 12.5a2 2 0 0 0 2 1.5h9.5a2 2 0 0 0 2-1.5L22 7H5" />
    <path d="M10 7v7M15 7v7" />
  </svg>

  {totalItems > 0 && (
    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
      {totalItems}
    </span>
  )}
</Link>
      </div>

      {/* Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-2xl"
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? "✕" : "☰"}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full md:left-auto md:right-4 md:w-48 bg-[#FAF7F2] shadow-lg border-t border-[#38251C]/10 flex flex-col items-center gap-5 py-6 z-50">

          {/* Mobile Navigation */}
          <div className="flex md:hidden flex-col items-center gap-5">
            <Link to="/home" onClick={closeMenu}>Home</Link>
            <Link to="/shop" onClick={closeMenu}>Shop</Link>
            <Link to="/wishlist" onClick={closeMenu}>Wishlist</Link>
            <Link to="/orders" onClick={closeMenu}>Orders</Link>
    <Link to="/cart" onClick={closeMenu}>
  Cart ({totalItems})
</Link>
          </div>

     {user ? (
  <button onClick={handleLogout}>
    Logout
  </button>
) : (
  <>
    <Link to="/login" onClick={closeMenu}>
      Login
    </Link>

    <Link to="/register" onClick={closeMenu}>
      Register
    </Link>
  </>
)}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
