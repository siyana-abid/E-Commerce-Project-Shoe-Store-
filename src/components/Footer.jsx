import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#3B2A22] text-[#F5F1E8] mt-16 px-6 py-8 text-center">

      <h2 className="font-serif text-2xl mb-3">
        TREDORA
      </h2>

      <div className="flex justify-center gap-6 text-sm mb-5">
        <Link to="/shop">Shop</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/orders">Orders</Link>
      </div>

      <p className="text-xs text-[#D8CFC5]">
        © {new Date().getFullYear()} TREDORA. All rights reserved.
      </p>

    </footer>
  );
}

export default Footer;