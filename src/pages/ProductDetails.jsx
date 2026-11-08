
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  addToCart,
  getUserCart,
} from "../services/cartService";

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
          `http://localhost:3000/products/${id}`
        );

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
      alert("Please login to add products to your cart!");
      navigate("/login");
      return;
    }

    if (Number(product.stock ?? 0) <= 0) {
      alert("Sorry! This product is out of stock.");
      return;
    }

    try {
      setCartLoading(true);

      // Add product to JSON Server cart
      const updatedCart = await addToCart(user.id, product);

      // Update badge immediately using updated cart data
      const total = updatedCart.items.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
      );

      setCartCount(total);
      setAdded(true);
    } catch (error) {
      alert("Unable to add product to cart!");
    } finally {
      setCartLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(245,241,232)]">
        <h2 className="text-2xl text-[rgb(59,42,34)]">
          Loading product...
        </h2>
      </div>
    );
  }

  // Error / Product not found
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[rgb(245,241,232)]">
        <h2 className="text-2xl font-bold mb-5">
          {error || "Product not found!"}
        </h2>

        <Link to="/shop" className="underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] text-[rgb(59,42,34)]">

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
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
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
              disabled={
                Number(product.stock ?? 0) <= 0 ||
                cartLoading
              }
              className="w-full bg-[rgb(59,42,34)] text-[rgb(245,241,232)] py-4 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Number(product.stock ?? 0) <= 0
                ? "Out of Stock"
                : cartLoading
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

      <footer className="bg-[rgb(59,42,34)] text-[rgb(245,241,232)] text-center py-7">

        <p className="brand-name text-xl">
          TREDORA
        </p>

        <p className="text-sm opacity-70 mt-2">
          Every step tells your story.
        </p>

      </footer>

    </div>
  );
}

export default ProductDetails;
