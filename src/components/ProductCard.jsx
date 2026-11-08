
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { addToCart } from "../services/cartService";
import { setCartItems } from "../redux/cartSlice";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const wishlistKey = user ? `wishlist_${user.id}` : null;

  const [isWishlisted, setIsWishlisted] = useState(() => {
    if (!wishlistKey) return false;

    const wishlist = JSON.parse(
      localStorage.getItem(wishlistKey) || "[]"
    );

    return wishlist.some(
      (item) => String(item.id) === String(product.id)
    );
  });

  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    const currentUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!currentUser) {
      alert("Please login to add products to your cart!");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      // Add product to JSON Server cart
      const updatedCart = await addToCart(
        currentUser.id,
        product
      );

      // Update Redux with latest cart items
      dispatch(setCartItems(updatedCart.items || []));

      setAdded(true);
    } catch (error) {
      alert(error.message || "Unable to add product to cart!");
    } finally {
      setLoading(false);
    }
  };

  const handleWishlist = () => {
    const currentUser = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!currentUser) {
      alert("Please login to use your wishlist!");
      navigate("/login");
      return;
    }

    const key = `wishlist_${currentUser.id}`;

    let wishlist = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    const alreadyExists = wishlist.some(
      (item) => String(item.id) === String(product.id)
    );  

    if (alreadyExists) {
      wishlist = wishlist.filter(
        (item) => String(item.id) !== String(product.id)
      );
    } else {
      wishlist.push(product);
    }

    localStorage.setItem(key, JSON.stringify(wishlist));
    setIsWishlisted(!alreadyExists);
  };

  return (
    <div className="group w-full bg-white rounded-[28px] p-3 border border-[rgba(59,42,34,0.10)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      <div className="relative h-56 sm:h-60 bg-[rgb(245,241,232)] rounded-[24px] overflow-hidden flex items-center justify-center p-4">

        {product.image && !imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <p className="text-[rgba(59,42,34,0.5)] text-sm">
            Image Not Available
          </p>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white text-[rgb(59,42,34)] shadow-md flex items-center justify-center text-2xl hover:scale-110 transition"
        >
          {isWishlisted ? "♥" : "♡"}
        </button>

      </div>

      <div className="px-2 pt-4 pb-2">

        <p className="text-xs uppercase tracking-[2px] text-[rgba(59,42,34,0.55)] mb-1">
          {product.category}
        </p>

        <h2
          className="text-lg font-bold text-[rgb(59,42,34)] truncate"
          title={product.name}
        >
          {product.name}
        </h2>

        <div className="flex items-center justify-between mt-4">

          <p className="text-2xl font-bold text-[rgb(59,42,34)]">
            ₹{product.price}
          </p>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={loading}
            aria-label="Add to cart"
            className="w-12 h-12 rounded-2xl bg-[rgb(245,241,232)] text-[rgb(59,42,34)] flex items-center justify-center hover:bg-[rgb(59,42,34)] hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <span className="text-sm">...</span>
            ) : added ? (
              <span className="text-xl">✓</span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="23"
                height="23"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6" />
                <circle cx="10" cy="21" r="1" />
                <circle cx="18" cy="21" r="1" />
                <path d="M16 3v6" />
                <path d="M13 6h6" />
              </svg>
            )}
          </button>

        </div>

        <Link
          to={`/product/${product.id}`}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[rgb(59,42,34)] text-[rgb(245,241,232)] py-3 rounded-full text-sm font-semibold hover:bg-[rgb(81,57,46)] transition-all duration-300"
        >
          View Details
          <span className="text-lg">→</span>
        </Link>

      </div>
    </div>
  );
}

export default ProductCard;
