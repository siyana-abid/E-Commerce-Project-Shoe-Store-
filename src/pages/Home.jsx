
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getUserCart } from "../services/cartService";
import { setCartItems, clearCart } from "../redux/cartSlice";

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const cartItems = useSelector((state) => state.cart.items);

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Fetch cart from JSON Server
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        if (!user?.id) {
          dispatch(clearCart());
          return;
        }

        const cart = await getUserCart(user.id);
        dispatch(setCartItems(cart?.items || []));
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    };

    fetchCartCount();

    window.addEventListener("focus", fetchCartCount);

    return () => {
      window.removeEventListener("focus", fetchCartCount);
    };
  }, [user?.id, dispatch]);

  const handleFeatureClick = (path) => {
    if (!user) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    dispatch(clearCart());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#38251C]">

      <nav className="flex justify-between items-center px-6 md:px-12 py-5 bg-[#FAF7F2] border-b border-[#38251C]/10">

        <Link to="/home" className="text-3xl font-bold tracking-tight">
          TREDORA
        </Link>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link to="/home" className="border-b-2 border-[#38251C] pb-1">
            Home
          </Link>

          <Link to="/shop" className="hover:text-[#A16D4F] transition">
            Shop
          </Link>

          <button
            onClick={() => handleFeatureClick("/wishlist")}
            className="hover:text-[#A16D4F] transition"
          >
            Wishlist
          </button>

          <button
            onClick={() => handleFeatureClick("/orders")}
            className="hover:text-[#A16D4F] transition"
          >
            Orders
          </button>

          <button
            onClick={() => handleFeatureClick("/cart")}
            className="relative hover:text-[#A16D4F]"
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

            {user && cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-2">
          {!user ? (
            <>
              <Link
                to="/login"
                className="border border-[#38251C] px-4 py-2 rounded-full text-sm hover:bg-[#38251C] hover:text-white transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-[#38251C] text-white px-4 py-2 rounded-full text-sm hover:bg-[#624431] transition"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-[#38251C] text-white px-5 py-2 rounded-full text-sm hover:bg-[#624431] transition"
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      <section className="grid md:grid-cols-2 items-center gap-8 px-6 md:px-16 py-14 md:py-20">

        <div>
          <p className="text-sm tracking-[4px] uppercase mb-4 text-[#986D52]">
            Step into style
          </p>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
            TREDORA
          </h1>

          <h2 className="text-2xl md:text-4xl font-semibold mb-5">
            Walk Better. <br />
            Live Stylish.
          </h2>

          <p className="text-[#76645A] leading-7 max-w-md mb-8">
            Discover footwear that combines comfort, quality and
            timeless style. Find your perfect pair.
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="bg-[#38251C] text-white px-8 py-3 rounded-full hover:bg-[#684632] transition"
          >
            Explore Collection →
          </button>
        </div>

        <div className="rounded-3xl overflow-hidden bg-[#EFE3D6]">
          <img
            src="https://i.pinimg.com/736x/35/3c/47/353c474ecbbdc65ea28dcbcf68124e7b.jpg"
            alt="Stylish sneaker"
            className="w-full h-[300px] md:h-[530px] object-cover"
          />
        </div>

      </section>

      <section className="px-6 md:px-16 py-12 bg-white">

        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-[3px] text-[#986D52] mb-2">
            Find your favourite
          </p>

          <h2 className="text-3xl font-bold">
            Explore Our Collection
          </h2>

          <p className="text-[#76645A] mt-2">
            Simple styles. Everyday comfort.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">

          <div className="bg-[#FAF7F2] rounded-2xl overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/9e/1a/2b/9e1a2b05fd51e580357a0d31c03082f4.jpg"
              
              alt="Classic sneakers"
              className="w-full h-52 object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold">Classic Collection</h3>
              <p className="text-sm text-[#76645A] mt-2">
                Timeless shoes for everyday wear.
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-4 font-semibold text-sm hover:text-[#986D52]"
              >
                Explore →
              </button>
            </div>
          </div>

          <div className="bg-[#FAF7F2] rounded-2xl overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/ca/a6/ed/caa6ed93265e0844737016d831289a9c.jpg"
              alt="Casual footwear"
              className="w-full h-52 object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold">Casual Collection</h3>
              <p className="text-sm text-[#76645A] mt-2">
                Comfort made for every day.
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-4 font-semibold text-sm hover:text-[#986D52]"
              >
                Explore →
              </button>
            </div>
          </div>

          <div className="bg-[#FAF7F2] rounded-2xl overflow-hidden">
            <img
              src="https://i.pinimg.com/736x/5c/54/e2/5c54e21bb5e0aab58325f88863ee6354.jpg"
              alt="Sporty sneakers"
              className="w-full h-52 object-cover"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold">Sporty Collection</h3>
              <p className="text-sm text-[#76645A] mt-2">
                Move freely with every step.
              </p>
              <button
                onClick={() => navigate("/shop")}
                className="mt-4 font-semibold text-sm hover:text-[#986D52]"
              >
                Explore →
              </button>
            </div>
          </div>

        </div>
      </section>

      <section className="px-6 md:px-16 py-12">

        <div className="bg-[#67432F] rounded-2xl px-8 md:px-14 py-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">

          <div>
            <p className="text-sm tracking-widest uppercase text-[#E9D4C0]">
              Special Offer
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-2">
              Flat 20% OFF
            </h2>

            <p className="mt-2 text-[#E9D4C0]">
              On selected sneakers
            </p>
          </div>

          <button
            onClick={() => navigate("/shop")}
            className="bg-[#FAF7F2] text-[#38251C] px-7 py-3 rounded-full font-semibold hover:bg-[#E9D4C0] transition"
          >
            Shop Now →
          </button>

        </div>
      </section>

      <section className="px-6 md:px-16 py-12 bg-white">

        <h2 className="text-3xl font-bold text-center mb-10">
          Why Choose TREDORA?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

          <div>
            <p className="text-3xl mb-3">🚚</p>
            <h3 className="font-semibold">Free Shipping</h3>
            <p className="text-sm text-[#76645A] mt-1">
              On selected orders
            </p>
          </div>

          <div>
            <p className="text-3xl mb-3">🛡️</p>
            <h3 className="font-semibold">Secure Payments</h3>
            <p className="text-sm text-[#76645A] mt-1">
              Safe checkout
            </p>
          </div>

          <div>
            <p className="text-3xl mb-3">↩️</p>
            <h3 className="font-semibold">Easy Returns</h3>
            <p className="text-sm text-[#76645A] mt-1">
              Hassle-free
            </p>
          </div>

          <div>
            <p className="text-3xl mb-3">💬</p>
            <h3 className="font-semibold">Customer Support</h3>
            <p className="text-sm text-[#76645A] mt-1">
              We're here to help
            </p>
          </div>

        </div>
      </section>

      <section className="px-6 md:px-16 py-12">

        <h2 className="text-3xl font-bold text-center mb-8">
          Your Shopping Space
        </h2>

        <div className="grid sm:grid-cols-3 gap-5">

          <button
            onClick={() => navigate("/shop")}
            className="text-left bg-white p-6 rounded-2xl border border-[#38251C]/10 hover:shadow-md transition"
          >
            <h3 className="text-xl font-bold mb-2">Shop</h3>
            <p className="text-[#76645A]">
              Explore our latest shoe collection.
            </p>
            <p className="mt-5 font-semibold">Explore →</p>
          </button>

          <button
            onClick={() => handleFeatureClick("/wishlist")}
            className="text-left bg-white p-6 rounded-2xl border border-[#38251C]/10 hover:shadow-md transition"
          >
            <h3 className="text-xl font-bold mb-2">Wishlist</h3>
            <p className="text-[#76645A]">
              Keep your favourite shoes in one place.
            </p>
            <p className="mt-5 font-semibold">View Wishlist →</p>
          </button>

          <button
            onClick={() => handleFeatureClick("/orders")}
            className="text-left bg-white p-6 rounded-2xl border border-[#38251C]/10 hover:shadow-md transition"
          >
            <h3 className="text-xl font-bold mb-2">My Orders</h3>
            <p className="text-[#76645A]">
              Keep track of your shopping orders.
            </p>
            <p className="mt-5 font-semibold">View Orders →</p>
          </button>

        </div>
      </section>

      <footer className="bg-[#38251C] text-[#FAF7F2] px-6 md:px-16 py-10">

        <div className="grid md:grid-cols-3 gap-8">

          <div>
            <h2 className="text-3xl font-bold">TREDORA</h2>
            <p className="text-sm opacity-70 mt-2">
              Every step tells your story.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <div className="flex flex-col gap-2 text-sm opacity-80">
              <Link to="/home">Home</Link>
              <Link to="/shop">Shop</Link>
              <button
                onClick={() => handleFeatureClick("/wishlist")}
                className="text-left"
              >
                Wishlist
              </button>
              <button
                onClick={() => handleFeatureClick("/orders")}
                className="text-left"
              >
                Orders
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">About TREDORA</h3>
            <p className="text-sm opacity-70 leading-6">
              Bringing comfort and style together for every journey.
            </p>
          </div>

        </div>

        <div className="border-t border-white/20 mt-8 pt-5 text-center text-sm opacity-60">
          © 2026 TREDORA. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default Home;
