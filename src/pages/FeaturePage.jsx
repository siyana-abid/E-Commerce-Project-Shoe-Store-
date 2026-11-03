
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  getUserCart,
  addToCart,
  updateCart,
} from "../services/cartService";

function FeaturePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [cart, setCart] = useState([]);
  const [cartRecord, setCartRecord] = useState(null);

  const [wishlist, setWishlist] = useState(() =>
    JSON.parse(localStorage.getItem("wishlist") || "[]")
  );

  const [loading, setLoading] = useState(true);

  const isCartPage = location.pathname === "/cart";
  const isWishlistPage = location.pathname === "/wishlist";
  const isOrdersPage = location.pathname === "/orders";

  // Fetch logged-in user's cart from JSON Server
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserCart(user.id);

        if (data) {
          setCartRecord(data);

          // Convert productId into id for UI
          const formattedItems = data.items.map((item) => ({
            ...item,
            id: item.productId,
          }));

          setCart(formattedItems);
        } else {
          setCartRecord(null);
          setCart([]);
        }
      } catch (error) {
        console.error("Cart loading error:", error);
        alert("Unable to load your cart!");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Save wishlist in localStorage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Save updated cart items to JSON Server
  // const saveCartItems = async (updatedItems) => {
  //   if (!cartRecord) return;

  //   try {
  //     // Convert id back into productId before saving
  //     const formattedItems = updatedItems.map(
  //       ({ id, ...item }) => ({
  //         ...item,
  //         productId: id,
  //       })
  //     );

  //     const response = await updateCart(
  //       cartRecord.id,
  //       formattedItems
  //     );

  //     setCartRecord(response);
  //     setCart(updatedItems);
  //   } catch (error) {
  //     console.error("Cart update error:", error);
  //     alert("Unable to update your cart!");
  //   }
  // };
const saveCartItems = async (updatedItems) => {
  if (!cartRecord) return;

  // Keep old cart in case API update fails
  const previousCart = cart;

  // Update UI immediately
  setCart(updatedItems);

  try {
    const formattedItems = updatedItems.map(
      ({ id, ...item }) => ({
        ...item,
        productId: id,
      })
    );

    const response = await updateCart(
      cartRecord.id,
      formattedItems
    );

    setCartRecord(response);

  } catch (error) {
    console.error("Cart update error:", error);

    // Restore old cart if API fails
    setCart(previousCart);

    alert("Unable to update your cart!");
  }
};
  // Increase quantity
  const increaseQuantity = async (id) => {
    const item =  cart.find((product) => product.id === id);

    if (!item) return;

    if (item.quantity >= Number(item.stock || 0)) {
      alert("Maximum available stock reached!");
      return;
    }

    const updatedItems = cart.map((product) =>
      product.id === id
        ? { ...product, quantity: product.quantity + 1 }
        : product
    );

    await saveCartItems(updatedItems);
  };

  // Decrease quantity
  const decreaseQuantity = async (id) => {
    const updatedItems = cart.map((item) =>
      item.id === id && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );

    await saveCartItems(updatedItems);
  };

  // Remove cart item
  const removeFromCart = async (id) => {
    const updatedItems = cart.filter((item) => item.id !== id);

    await saveCartItems(updatedItems);
  };

  // Remove wishlist item
  const removeFromWishlist = (id) => {
    setWishlist((previousWishlist) =>
      previousWishlist.filter((item) => item.id !== id)
    );
  };

  // Add wishlist product to JSON Server cart
  const addWishlistToCart = async (product) => {
    if (!user) {
      alert("Please login to add products to your cart!");
      navigate("/login");
      return;
    }

    try {
      const existingItem = cart.find(
        (item) => item.id === product.id
      );

      if (
        existingItem &&
        existingItem.quantity >= Number(existingItem.stock || 0)
      ) {
        alert("Maximum available stock reached!");
        return;
      }

      if (
        !existingItem &&
        Number(product.stock || 0) < 1
      ) {
        alert("This product is out of stock!");
        return;
      }

      const response = await addToCart(user.id, product);

      setCartRecord(response);

      const formattedItems = response.items.map((item) => ({
        ...item,
        id: item.productId,
      }));

      setCart(formattedItems);

      alert("Product added to cart!");
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Unable to add product to cart!");
    }
  };

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const pageTitle = isCartPage
    ? "My Cart"
    : isWishlistPage
    ? "My Wishlist"
    : "My Orders";

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] text-[rgb(59,42,34)]">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-[rgba(59,42,34,0.2)]">

        <Link to="/" className="brand-name text-2xl">
          TREDORA
        </Link>

        <Link to="/shop" className="font-semibold hover:opacity-60">
          Continue Shopping
        </Link>

      </nav>

      {/* Heading */}
      <section className="text-center pt-12 pb-10 px-5">

        <p className="uppercase tracking-[3px] text-sm mb-3">
          TREDORA COLLECTION
        </p>

        <h1 className="text-4xl font-bold">
          {pageTitle}
        </h1>

      </section>

      {/* CART PAGE */}
      {isCartPage && (
        <section className="max-w-5xl mx-auto px-5 pb-16">

          {loading ? (
            <p className="text-center py-16 text-lg">
              Loading your cart...
            </p>
          ) : cart.length === 0 ? (
            <div className="text-center bg-white rounded-3xl p-12 shadow-sm">

              <p className="text-5xl mb-5">🛒</p>

              <h2 className="text-2xl font-bold mb-3">
                Your Cart is Empty
              </h2>

              <p className="text-gray-500 mb-7">
                Looks like you haven't added any shoes yet.
              </p>

              <Link
                to="/shop"
                className="inline-block bg-[rgb(59,42,34)] text-white px-8 py-3 rounded-full hover:bg-[rgb(81,57,46)] transition"
              >
                Explore Shoes
              </Link>

            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-5">

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-3xl p-5 flex flex-col sm:flex-row gap-5 shadow-sm"
                  >

                    {/* Image */}
                    <div className="w-full sm:w-36 h-36 bg-[rgb(245,241,232)] rounded-2xl flex items-center justify-center p-3">

                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-sm">No Image</span>
                      )}

                    </div>

                    {/* Details */}
                    <div className="flex-1">

                      <p className="text-xs uppercase tracking-widest text-gray-500">
                        {item.category}
                      </p>

                      <h2 className="text-xl font-bold mt-1">
                        {item.name}
                      </h2>

                      <p className="text-xl font-bold mt-3">
                        ₹{item.price}
                      </p>

                      {/* Quantity */}
                      <div className="flex items-center gap-3 mt-4">

                        <button
                        type="button"
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-9 h-9 rounded-full bg-[rgb(245,241,232)] font-bold"
                        >
                          −
                        </button>

                        <span className="font-bold">
                          {item.quantity}
                        </span>

                        <button
                        type="button"
                          onClick={() => increaseQuantity(item.id)}
                          className="w-9 h-9 rounded-full bg-[rgb(245,241,232)] font-bold"
                        >
                          +
                        </button>

                      </div>

                      <p className="font-semibold mt-3">
                        Subtotal: ₹
                        {Number(item.price || 0) * item.quantity}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-3 px-5 py-2 rounded-full text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all duration-300"
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                ))}

              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-3xl p-7 shadow-sm h-fit">

                <h2 className="text-2xl font-bold mb-6">
                  Order Summary
                </h2>

                <div className="flex justify-between mb-4">
                  <span>Products</span>
                  <span>{cart.length}</span>
                </div>

                <div className="flex justify-between mb-4">
                  <span>Total Items</span>
                  <span>
                    {cart.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-5 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                <button
                  onClick={() =>
                    alert("Checkout will be implemented later!")
                  }
                  className="w-full mt-7 bg-[rgb(59,42,34)] text-white py-4 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition"
                >
                  Proceed to Checkout
                </button>

              </div>

            </div>
          )}

        </section>
      )}

      {/* WISHLIST PAGE */}
      {isWishlistPage && (
        <section className="max-w-6xl mx-auto px-5 pb-16">

          {wishlist.length === 0 ? (
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

                    <button
                      onClick={() => addWishlistToCart(item)}
                      className="w-full mt-5 bg-[rgb(59,42,34)] text-white py-3 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition"
                    >
                      Add to Cart
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full mt-3 border border-[rgb(59,42,34)] py-3 rounded-full font-semibold hover:bg-[rgb(245,241,232)] transition"
                    >
                      Remove from Wishlist
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </section>
      )}

      {/* ORDERS PAGE */}
      {isOrdersPage && (
        <section className="max-w-4xl mx-auto px-5 pb-16 text-center">

          <div className="bg-white rounded-3xl p-12 shadow-sm">

            <p className="text-5xl mb-5">📦</p>

            <h2 className="text-2xl font-bold mb-3">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mb-7">
              Your orders will appear here after checkout.
            </p>

            <Link
              to="/shop"
              className="inline-block bg-[rgb(59,42,34)] text-white px-8 py-3 rounded-full"
            >
              Start Shopping
            </Link>

          </div>

        </section>
      )}

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

export default FeaturePage;
