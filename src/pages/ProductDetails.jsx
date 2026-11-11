
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Footer from "../components/Footer";

import {
  addToCart,
  getUserCart,
} from "../services/cartService";

const API_URL = import.meta.env.VITE_API_URL;

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [added, setAdded] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Get logged-in user
  const getUser = () => {
    return JSON.parse(localStorage.getItem("user") || "null");
  };

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setAdded(false);

        const response = await axios.get(
          `${API_URL}/products/${id}`
        );

        // Check whether product is active
        if (response.data.active === false) {
          setError("This product is currently unavailable!");
          return;
        }

        setProduct(response.data);

      } catch (error) {
        setError("Product not found!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch cart count
  const fetchCartCount = async () => {
    const user = getUser();

    if (!user) {
      setCartCount(0);
      return;
    }

    try {
      const cart = await getUserCart(user.id);

      if (cart && cart.items) {
        const total = cart.items.reduce(
          (sum, item) => sum + Number(item.quantity || 0),
          0
        );

        setCartCount(total);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      // Cart count fetch failed
    }
  };

  // Load cart count when page opens
  useEffect(() => {
    fetchCartCount();

    // Refresh cart count when user returns to this tab
    const handleFocus = () => {
      fetchCartCount();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Add to Cart
  const handleAddToCart = async () => {
    const user = getUser();

    if (!user) {
      toast.error("Please login to add products to your cart!");
      navigate("/login");
      return;
    }

    // Prevent adding unavailable products
    if (!product || product.active === false) {
      toast.error("This product is currently unavailable!");
      return;
    }

    try {
      setCartLoading(true);

      const updatedCart = await addToCart(user.id, product);

      const total = updatedCart.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      setCartCount(total);
      setAdded(true);

    } catch (error) {
      toast.error("Unable to add product to cart!");
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(245,241,232)]">
        <h2 className="text-2xl text-[rgb(59,42,34)]">
          Loading product...
        </h2>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(245,241,232)]">

        <h2 className="text-2xl font-bold mb-5 text-[#3B2A22]">
          {error || "Product not found!"}
        </h2>

        <Link
          to="/shop"
          className="underline text-[#3B2A22]"
        >
          Back to Shop
        </Link>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] text-[rgb(59,42,34)]">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-[rgba(59,42,34,0.2)]">

        <Link to="/" className="brand-name text-2xl">
          TREDORA
        </Link>

        <div className="flex items-center gap-5">

          <Link
            to="/cart"
            className="relative hover:opacity-60"
            aria-label={`Cart with ${cartCount} items`}
          >

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

            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}

          </Link>

          <Link
            to="/shop"
            className="font-semibold hover:opacity-60"
          >
            Back to Shop
          </Link>

        </div>
      </nav>

      {/* Product Details */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Product Image */}
          <div className="bg-white rounded-3xl p-8 h-[400px] flex items-center justify-center">

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <p>Image Not Available</p>
            )}

          </div>

          <div>

            <p className="uppercase tracking-[3px] text-sm mb-4 text-[rgba(59,42,34,0.6)]">
              {product.category}
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mb-5">
              {product.name}
            </h1>

            <p className="text-3xl font-bold mb-6">
              ₹{product.price}
            </p>

            <div className="border-t border-[rgba(59,42,34,0.2)] py-6">

              <h3 className="font-bold text-lg mb-2">
                Product Description
              </h3>

              <p className="text-[rgba(59,42,34,0.7)] leading-7">
                {product.description ||
                  "No description available for this product."}
              </p>

            </div>

            <div className="flex justify-between border-t border-b border-[rgba(59,42,34,0.2)] py-5 mb-8">

              <span className="font-semibold">
                Category
              </span>

              <span>
                {product.category || "Not available"}
              </span>

            </div>

            <div className="flex justify-between mb-8">

              <span className="font-semibold">
                Available Stock
              </span>

              <span className="font-bold">
                {product.stock ?? 0} Items
              </span>

            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={cartLoading}
              className="w-full bg-[rgb(59,42,34)] text-[rgb(245,241,232)] py-4 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cartLoading
                ? "Adding..."
                : added
                ? "✓ Added to Cart"
                : "Add to Cart"}
            </button>

            {added && (
              <Link
                to="/cart"
                className="block text-center mt-4 font-semibold underline underline-offset-4"
              >
                View My Cart →
              </Link>
            )}

          </div>

        </div>

      </section>

      <Footer />

    </div>
  );
}

export default ProductDetails;
