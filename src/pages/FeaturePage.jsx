
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import {
  getUserCart,
  addToCart,
  updateCart,
} from "../services/cartService";

function FeaturePage() {
  console.count("FeaturePage rendered");

  useEffect(() => {
    console.log("FeaturePage MOUNTED");

    return () => {
      console.log("FeaturePage UNMOUNTED");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log("DOCUMENT IS RELOADING");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const wishlistKey = user ? `wishlist_${user.id}` : null;

  const [cart, setCart] = useState([]);
  const [cartRecord, setCartRecord] = useState(null);
  const [orders, setOrders] = useState([]);

  const [wishlist, setWishlist] = useState(() => {
    if (!wishlistKey) return [];

    return JSON.parse(localStorage.getItem(wishlistKey) || "[]");
  });

  const [loading, setLoading] = useState(true);
  console.log("CART LOADING:", loading);
  const [isUpdating, setIsUpdating] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const cartActionLock = useRef(false);

  const isCartPage = location.pathname === "/cart";
  const isWishlistPage = location.pathname === "/wishlist";
  const isOrdersPage = location.pathname === "/orders";

  // Fetch logged-in user's cart
  useEffect(() => {
    const fetchCart = async () => {
      console.log("FETCH CART CALLED");
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserCart(user.id);

        if (data) {
          setCartRecord(data);

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

  // Fetch previous orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isOrdersPage) return;

      if (!user) {
        setOrders([]);
        return;
      }

      setOrdersLoading(true);

      try {
        const response = await axios.get(
          `http://localhost:3000/orders?userId=${encodeURIComponent(user.id)}`
        );

        setOrders(response.data);
      } catch (error) {
        console.error("Orders loading error:", error);
        alert("Unable to load your orders!");
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [location.pathname]);

  // Save wishlist
  useEffect(() => {
    if (wishlistKey) {
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
    }
  }, [wishlist, wishlistKey]);

  // Common cart update function
  const saveCartItems = async (updatedItems) => {
    if (cartActionLock.current || !cartRecord) return;

    cartActionLock.current = true;
    setIsUpdating(true);

    const previousCart = cart;

    setCart(updatedItems);

    try {
      const formattedItems = updatedItems.map(({ id, ...item }) => ({
        ...item,
        productId: id,
      }));

console.log("BEFORE PATCH");

const response = await updateCart(cartRecord.id, formattedItems);

console.log("AFTER PATCH");
setTimeout(() => {
  console.log("2 SECONDS AFTER PATCH");
}, 2000);
console.log("CURRENT URL:", window.location.href);
console.log("NAVIGATION TYPE:", performance.getEntriesByType("navigation")[0].type);
console.log("PATCH COMPLETED AT:", new Date().toLocaleTimeString());
// setCartRecord(response);
    } catch (error) {
      console.error("Cart update error:", error);
      setCart(previousCart);
      alert("Unable to update your cart!");
    } finally {
      cartActionLock.current = false;
      setIsUpdating(false);
    }
  };

  // Increase quantity
  const increaseQuantity = async (id) => {
      console.log("INCREASE CLICKED");
    if (cartActionLock.current) return;

    const item = cart.find(
      (product) => String(product.id) === String(id)
    );

    if (!item) return;

    const stock =
      item.stock == null ? Infinity : Number(item.stock);

    if (Number(item.quantity) >= stock) {
      alert("Maximum available stock reached!");
      return;
    }

    const updatedItems = cart.map((product) =>
      String(product.id) === String(id)
        ? {
            ...product,
            quantity: Number(product.quantity || 1) + 1,
          }
        : product
    );

    await saveCartItems(updatedItems);
  };

  // Decrease quantity
  const decreaseQuantity = async (id) => {
    if (cartActionLock.current) return;

    const updatedItems = cart.map((item) =>
      String(item.id) === String(id) &&
      Number(item.quantity) > 1
        ? {
            ...item,
            quantity: Number(item.quantity) - 1,
          }
        : item
    );

    await saveCartItems(updatedItems);
  };

  // Remove cart item
  const removeFromCart = async (id) => {
    if (cartActionLock.current) return;

    const updatedItems = cart.filter(
      (item) => String(item.id) !== String(id)
    );

    await saveCartItems(updatedItems);
  };

  // Remove wishlist item
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

    if (cartActionLock.current) return;

    cartActionLock.current = true;
    setIsUpdating(true);

    try {
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
      alert(error.message || "Unable to add product to cart!");
    } finally {
      cartActionLock.current = false;
      setIsUpdating(false);
    }
  };

  // Cart total price
  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  // Cart total quantity
  const totalItems = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Common order function
  const placeOrder = async (itemsToOrder) => {
    if (!user) {
      alert("Please login to continue!");
      navigate("/login");
      return;
    }

    if (itemsToOrder.length === 0) {
      alert("No products available to order!");
      return;
    }

    if (!cartRecord) {
      alert("Cart information not found!");
      return;
    }

    if (cartActionLock.current) return;

    const orderTotalItems = itemsToOrder.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0
    );

    const orderTotalPrice = itemsToOrder.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) * Number(item.quantity || 1),
      0
    );

    const confirmed = window.confirm(
      `Confirm your order?\n\nProducts: ${itemsToOrder.length}\nTotal Items: ${orderTotalItems}\nTotal Amount: ₹${orderTotalPrice.toFixed(2)}`
    );

    if (!confirmed) return;

    cartActionLock.current = true;
    setCheckoutLoading(true);

    let orderSaved = false;

    try {
      const orderData = {
        userId: user.id,
        userName: user.name,

        items: itemsToOrder.map((item) => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),

        totalItems: orderTotalItems,
        totalPrice: orderTotalPrice,
        orderDate: new Date().toISOString(),
        status: "Confirmed",
      };

      // Save order
      const orderResponse = await axios.post(
        "http://localhost:3000/orders",
        orderData
      );

      orderSaved = true;

      // Remove only ordered products from cart
      const remainingItems = cart.filter(
        (cartItem) =>
          !itemsToOrder.some(
            (orderedItem) =>
              String(orderedItem.id) === String(cartItem.id)
          )
      );

      const formattedItems = remainingItems.map(({ id, ...item }) => ({
        ...item,
        productId: id,
      }));
console.log("BEFORE PATCH");
      const response = await updateCart(
        cartRecord.id,
        formattedItems
      );
      console.log("AFTER PATCH");

      setCartRecord(response);
      setCart(remainingItems);

      setOrders((previousOrders) => [
        orderResponse.data,
        ...previousOrders,
      ]);

      alert(
        "Order placed successfully! Thank you for shopping with TREDORA."
      );

      navigate("/orders");
    } catch (error) {
      console.error("Checkout error:", error);

      if (orderSaved) {
        alert(
          "Your order was saved, but the cart could not be updated. Please check your Orders page before ordering again."
        );

        navigate("/orders");
      } else {
        alert("Unable to place your order. Please try again!");
      }
    } finally {
      cartActionLock.current = false;
      setCheckoutLoading(false);
    }
  };

  // Buy only one product
  const handleBuyNow = (item) => {
    placeOrder([item]);
  };

  // Order all cart products
  const handleCheckout = () => {
    placeOrder(cart);
  };

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

        <div className="flex gap-5 items-center text-sm md:text-base">

          <Link to="/" className="font-semibold hover:opacity-60">
            Home
          </Link>

          <Link to="/wishlist" className="font-semibold hover:opacity-60">
            Wishlist
          </Link>

          <Link to="/orders" className="font-semibold hover:opacity-60">
            Orders
          </Link>

          {/* Cart Icon with Count */}
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
                          disabled={isUpdating || checkoutLoading || item.quantity <= 1}
                          onClick={() => decreaseQuantity(item.id)}
                          className="w-9 h-9 rounded-full bg-[rgb(245,241,232)] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          −
                        </button>

                        <span className="font-bold">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={isUpdating || checkoutLoading}
                          onClick={() => increaseQuantity(item.id)}
                          className="w-9 h-9 rounded-full bg-[rgb(245,241,232)] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>

                      </div>

                      <p className="font-semibold mt-3">
                        Subtotal: ₹
                        {Number(item.price || 0) *
                          Number(item.quantity || 1)}
                      </p>

                      {/* Buy Now Button */}
                      <button
                        type="button"
                        disabled={isUpdating || checkoutLoading}
                        onClick={() => handleBuyNow(item)}
                        className="mt-4 px-6 py-2 rounded-full text-sm font-semibold bg-[rgb(59,42,34)] text-white hover:bg-[rgb(81,57,46)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {checkoutLoading ? "Processing..." : "Buy Now"}
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        disabled={isUpdating || checkoutLoading}
                        onClick={() => removeFromCart(item.id)}
                        className="mt-3 ml-2 px-5 py-2 rounded-full text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
                  <span>{totalItems}</span>
                </div>

                <div className="border-t border-gray-200 pt-5 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                {/* Checkout All Products */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || isUpdating}
                  className="w-full mt-7 bg-[rgb(59,42,34)] text-white py-4 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading
                    ? "Processing Order..."
                    : "Proceed to Checkout"}
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
                      type="button"
                      disabled={isUpdating}
                      onClick={() => addWishlistToCart(item)}
                      className="w-full mt-5 bg-[rgb(59,42,34)] text-white py-3 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
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
        <section className="max-w-5xl mx-auto px-5 pb-16">

          {!user ? (
            <div className="text-center bg-white rounded-3xl p-12 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">
                Please Login
              </h2>

              <p className="text-gray-500 mb-7">
                Login to view your orders.
              </p>

              <Link
                to="/login"
                className="inline-block bg-[rgb(59,42,34)] text-white px-8 py-3 rounded-full"
              >
                Login
              </Link>
            </div>
          ) : ordersLoading ? (
            <p className="text-center py-16 text-lg">
              Loading your orders...
            </p>
          ) : orders.length === 0 ? (
            <div className="text-center bg-white rounded-3xl p-12 shadow-sm">
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
          ) : (
            <div className="space-y-7">

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm"
                >

                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-gray-200 pb-5 mb-5">

                    <div>
                      <h2 className="text-xl font-bold">
                        Order #{order.id}
                      </h2>

                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(order.orderDate).toLocaleString()}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                        {order.status}
                      </span>

                      <p className="font-bold text-lg mt-2">
                        ₹{Number(order.totalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Ordered Products */}
                  <div className="space-y-5">

                    {order.items.map((item, index) => (
                      <div
                        key={`${order.id}-${item.productId}-${index}`}
                        className="flex flex-col sm:flex-row items-center gap-5"
                      >

                        <div className="w-24 h-24 bg-[rgb(245,241,232)] rounded-2xl p-3 flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-xs">No Image</span>
                          )}
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="font-bold text-lg">
                            {item.name}
                          </h3>

                          <p className="text-gray-500 mt-1">
                            Quantity: {item.quantity}
                          </p>

                          <p className="text-gray-500">
                            Price: ₹{item.price}
                          </p>
                        </div>

                        <p className="font-bold text-lg">
                          ₹
                          {Number(item.price) *
                            Number(item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Total */}
                  <div className="border-t border-gray-200 mt-6 pt-5 flex justify-between font-bold">
                    <span>
                      Total Items: {order.totalItems}
                    </span>

                    <span>
                      Total: ₹
                      {Number(order.totalPrice).toFixed(2)}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
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
