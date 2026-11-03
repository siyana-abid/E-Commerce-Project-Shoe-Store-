
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { addToCart } from "../services/cartService";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const response = await axios.get(
          `http://localhost:3000/products/${id}`
        );

        setProduct(response.data);
        setAdded(false);
      } catch (error) {
        console.log(error);
        setError("Product not found!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Add to Cart
  const handleAddToCart = async () => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

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

      await addToCart(user.id, product);

      // Keep success state until another product is opened
      setAdded(true);

    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Unable to add product to cart!");
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

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-[rgba(59,42,34,0.2)]">

        <Link to="/" className="brand-name text-2xl">
          TREDORA
        </Link>

        <Link
          to="/shop"
          className="font-semibold hover:opacity-60"
        >
          Back to Shop
        </Link>

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

          {/* Product Information */}
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
                {product.description || "No description available for this product."}
              </p>

            </div>

            <div className="flex justify-between border-t border-b border-[rgba(59,42,34,0.2)] py-5 mb-8">

              <span className="font-semibold">
                Category
              </span>

              <span>{product.category || "Not available"}</span>

            </div>

            <div className="flex justify-between mb-8">

              <span className="font-semibold">
                Available Stock
              </span>

              <span className="font-bold">
                {product.stock ?? 0} Items
              </span>

            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={Number(product.stock ?? 0) <= 0 || cartLoading}
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

            {/* View Cart Link */}
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

export default ProductDetails;
