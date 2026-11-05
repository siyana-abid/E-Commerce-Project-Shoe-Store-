import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getUserCart,
  addToCart,
} from "../services/cartService";

import { setCartItems, clearCart } from "../redux/cartSlice";

function Wishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const wishlistKey = user ? `wishlist_${user.id}` : null;

  // Redux cart items
  const reduxCartItems = useSelector((state) => state.cart.items);

  const totalItems = reduxCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Wishlist state
  const [wishlist, setWishlist] = useState(() => {
    if (!wishlistKey) return [];

    return JSON.parse(localStorage.getItem(wishlistKey) || "[]");
  });

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch cart for Redux badge
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        dispatch(clearCart());
        setLoading(false);
        return;
      }

      try {
        const cart = await getUserCart(user.id);

        if (cart) {
          dispatch(setCartItems(cart.items || []));
        } else {
          dispatch(clearCart());
        }
      } catch (error) {
        console.error("Unable to load cart:", error);
        alert("Unable to load your cart!");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user?.id, dispatch]);

  // Save wishlist in localStorage
  useEffect(() => {
    if (wishlistKey) {
      localStorage.setItem(
        wishlistKey,
        JSON.stringify(wishlist)
      );
    }
  }, [wishlist, wishlistKey]);

  // Remove product from wishlist
  const removeFromWishlist = (id) => {
    setWishlist((previousWishlist) =>
      previousWishlist.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  // Add wishlist product to cart
  const addWishlistToCart = async (product) => {
    if (!user) {
      alert("Please login to add products to your cart!");
      navigate("/login");
      return;
    }

    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const response = await addToCart(user.id, product);

      // Update Redux after API success
      dispatch(setCartItems(response.items || []));

      alert("Product added to cart!");
    } catch (error) {
      alert(error.message || "Unable to add product to cart!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] text-[rgb(59,42,34)] flex flex-col">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-[rgba(59,42,34,0.2)]">

        <Link to="/home" className="brand-name text-2xl">
          TREDORA
        </Link>

        <div className="flex gap-5 items-center text-sm md:text-base">

          <Link to="/home" className="font-semibold hover:opacity-60">
            Home
          </Link>

          <Link to="/shop" className="font-semibold hover:opacity-60">
            Shop
          </Link>

          <Link to="/wishlist" className="font-semibold hover:opacity-60">
            Wishlist
          </Link>

          <Link to="/orders" className="font-semibold hover:opacity-60">
            Orders
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative hover:opacity-60"
            aria-label={`Cart with ${totalItems} items`}
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

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

        </div>
      </nav>

      {/* Heading */}
      <section className="text-center pt-12 pb-10 px-5">

        <p className="uppercase tracking-[3px] text-sm mb-3">
          TREDORA COLLECTION
        </p>

        <h1 className="text-4xl font-bold">
          My Wishlist
        </h1>

      </section>

      {/* Wishlist Content */}
      <main className="flex-1">

        <section className="max-w-6xl mx-auto px-5 pb-16">

          {loading ? (
            <p className="text-center py-16 text-lg">
              Loading your wishlist...
            </p>
          ) : wishlist.length === 0 ? (

            <div className="text-center bg-white rounded-3xl p-12 shadow-sm">

              <p className="text-5xl mb-5">♡</p>

              <h2 className="text-2xl font-bold mb-3">
                Your Wishlist is Empty
              </h2>

              <p className="text-gray-500 mb-7">
                Save your favourite shoes here.
              </p>

              <Link
                to="/shop"
                className="inline-block bg-[rgb(59,42,34)] text-white px-8 py-3 rounded-full hover:bg-[rgb(81,57,46)] transition"
              >
                Explore Shoes
              </Link>

            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">

              {wishlist.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 shadow-sm hover:shadow-lg transition"
                >

                  {/* Product Image */}
                  <div className="h-56 bg-[rgb(245,241,232)] rounded-2xl p-4 flex items-center justify-center">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span>No Image</span>
                    )}

                  </div>

                  {/* Product Details */}
                  <div className="pt-5">

                    <p className="text-xs uppercase tracking-widest text-gray-500">
                      {item.category}
                    </p>

                    <h2 className="text-xl font-bold mt-2">
                      {item.name}
                    </h2>

                    <p className="text-2xl font-bold mt-3">
                      ₹{item.price}
                    </p>

                    {/* Add to Cart */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => addWishlistToCart(item)}
                      className="w-full mt-5 bg-[rgb(59,42,34)] text-white py-3 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Adding..." : "Add to Cart"}
                    </button>

                    {/* Remove Wishlist */}
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full mt-3 border border-[rgb(59,42,34)] py-3 rounded-full font-semibold hover:bg-[rgb(245,241,232)] transition disabled:opacity-40"
                    >
                      Remove from Wishlist
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

      {/* Footer */}
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

export default Wishlist;
