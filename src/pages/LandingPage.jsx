
import { Link, useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleFeatureClick = (path) => {
    if (!user) {
      navigate("/register");
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] text-[#3B2A22]">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-[#3B2A22]/20">

        <h1 className="brand-name text-3xl">
          TREDORA
        </h1>

        <div className="hidden md:flex items-center gap-8 font-medium">
         <Link to="/home" className="hover:opacity-60">
  Home
</Link>

          <Link to="/shop" className="hover:opacity-60">
            Shop
          </Link>

          <button
            onClick={() => handleFeatureClick("/wishlist")}
            className="hover:opacity-60"
          >
            Wishlist
          </button>

          <button
            onClick={() => handleFeatureClick("/cart")}
            className="hover:opacity-60"
          >
            Cart
          </button>
        </div>

        {/* Login / Register / Logout */}
        <div className="flex gap-3">

          {!user ? (
            <>
              <Link
                to="/login"
                className="border border-[#3B2A22] px-4 py-2 rounded-full text-sm hover:bg-[#3B2A22] hover:text-[#F5F1E8] transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-[#3B2A22] text-[#F5F1E8] px-4 py-2 rounded-full text-sm hover:bg-[#51392e] transition"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-[#3B2A22] text-[#F5F1E8] px-5 py-2 rounded-full text-sm hover:bg-[#51392e] transition"
            >
              Logout
            </button>
          )}

        </div>

      </nav>

      {/* Hero Section */}
      <section className="px-6 md:px-16 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">

        <div>
          <p className="uppercase tracking-[4px] text-sm mb-5">
            Walk with confidence
          </p>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Step Into
            <br />
            Your <span className="italic font-normal">Style.</span>
          </h1>

          <p className="text-lg leading-8 max-w-lg mb-8 opacity-80">
            Discover footwear that combines comfort, quality and timeless
            style. Find the perfect pair for every step of your journey.
          </p>

          <button
            onClick={() => navigate("/shop")}
            className="bg-[#3B2A22] text-[#F5F1E8] px-8 py-4 rounded-full font-semibold hover:bg-[#51392e] transition"
          >
            Explore Collection →
          </button>
        </div>

        {/* Hero Visual */}
        <div className="bg-[#3B2A22] rounded-3xl min-h-[350px] md:min-h-[480px] flex items-center justify-center p-8">

          <div className="text-center text-[#F5F1E8]">
            <p className="uppercase tracking-[5px] text-sm mb-5">
              The perfect pair
            </p>

            <h2 className="text-5xl md:text-6xl font-bold">
              YOUR
              <br />
              STYLE.
            </h2>

            <p className="mt-5 opacity-70">
              Comfort in every step
            </p>
          </div>

        </div>

      </section>

      {/* Features Section */}
      <section className="px-6 md:px-16 py-16 border-t border-[#3B2A22]/20">

        <div className="text-center mb-12">
          <p className="uppercase tracking-[4px] text-sm mb-3">
            Explore more
          </p>

          <h2 className="text-3xl md:text-4xl font-bold">
            Your Shopping Space
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Shop */}
          <button
            onClick={() => navigate("/shop")}
            className="text-left bg-white/50 border border-[#3B2A22]/20 p-8 rounded-2xl hover:bg-[#3B2A22] hover:text-[#F5F1E8] transition"
          >
            <h3 className="text-2xl font-bold mb-3">
              Shop
            </h3>

            <p>
              Explore our latest shoe collection.
            </p>

            <p className="mt-6 font-semibold">
              Explore →
            </p>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => handleFeatureClick("/wishlist")}
            className="text-left bg-white/50 border border-[#3B2A22]/20 p-8 rounded-2xl hover:bg-[#3B2A22] hover:text-[#F5F1E8] transition"
          >
            <h3 className="text-2xl font-bold mb-3">
              Wishlist
            </h3>

            <p>
              Keep your favourite shoes in one place.
            </p>

            <p className="mt-6 font-semibold">
              View Wishlist →
            </p>
          </button>

          {/* My Orders */}
          <button
            onClick={() => handleFeatureClick("/orders")}
            className="text-left bg-white/50 border border-[#3B2A22]/20 p-8 rounded-2xl hover:bg-[#3B2A22] hover:text-[#F5F1E8] transition"
          >
            <h3 className="text-2xl font-bold mb-3">
              My Orders
            </h3>

            <p>
              Keep track of your shopping orders.
            </p>

            <p className="mt-6 font-semibold">
              View Orders →
            </p>
          </button>

        </div>

      </section>

      {/* Footer */}
      <footer className="bg-[#3B2A22] text-[#F5F1E8] text-center py-8">

        <p className="brand-name text-xl">
          TREDORA
        </p>

        <p className="text-sm opacity-70">
          Find your style. Take every step with confidence.
        </p>

      </footer>

    </div>
  );
}

export default LandingPage;
