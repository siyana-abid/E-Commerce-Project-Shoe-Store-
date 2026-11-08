
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import {
  getUserCart,
  updateCart,
} from "../services/cartService";

import {
  setCartItems,
  clearCart,
} from "../redux/cartSlice";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const reduxCartItems = useSelector((state) => state.cart.items);

  const cartCount = reduxCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const checkoutItems = location.state?.items || [];

  const checkoutType = location.state?.checkoutType || "cart";

  const [formData, setFormData] = useState({
    fullName: user?.name || user?.username || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (!checkoutItems.length) {
      navigate("/cart", { replace: true });
    }
  }, [user?.id, checkoutItems.length, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const totalItems = checkoutItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const totalPrice = checkoutItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!checkoutItems.length) {
      alert("Your checkout is empty!");
      navigate("/cart");
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    try {
      const orderItems = checkoutItems.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        quantity: Number(item.quantity),
      }));

      const orderData = {
        userId: user.id,
        userName: user.name || user.username || formData.fullName,
        items: orderItems,
        totalItems,
        totalPrice,
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
        orderDate: new Date().toISOString(),
        status: "Confirmed",
      };

      await axios.post(
        "http://localhost:3000/orders",
        orderData
      );

      try {
        const cart = await getUserCart(user.id);

        if (cart) {
          let remainingItems;

          if (checkoutType === "cart") {
            remainingItems = [];
          } else {
            const purchasedIds = checkoutItems.map(
              (item) => item.productId || item.id
            );

            remainingItems = cart.items.filter(
              (item) => !purchasedIds.includes(item.productId)
            );
          }

          const updatedCart = await updateCart(
            cart.id,
            remainingItems
          );

          dispatch(setCartItems(updatedCart.items || []));
        } else {
          dispatch(clearCart());
        }
      } catch (cartError) {
        console.error("Cart update failed:", cartError);

        alert(
          "Your order was placed, but the cart could not be updated. Please check My Orders before placing another order."
        );

        navigate("/orders", { replace: true });
        return;
      }

      alert("Your order has been placed successfully!");

      navigate("/orders", { replace: true });

    } catch (error) {
      console.error("Order placement failed:", error);

      alert("Unable to place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] text-[rgb(59,42,34)] flex flex-col">

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

        </div>
      </nav>

      <section className="text-center pt-12 pb-10 px-5">

        <p className="uppercase tracking-[3px] text-sm mb-3">
          TREDORA COLLECTION
        </p>

        <h1 className="text-4xl font-bold">
          Checkout
        </h1>

        <p className="text-gray-500 mt-3">
          Enter your delivery details to place your order.
        </p>

      </section>

      <main className="flex-1">

        {checkoutItems.length > 0 && (

          <section className="max-w-6xl mx-auto px-5 pb-16">

            <form
              onSubmit={handleConfirmOrder}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >

              <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-9 shadow-sm">

                <h2 className="text-2xl font-bold mb-2">
                  Delivery Information
                </h2>

                <p className="text-gray-500 text-sm mb-7">
                  Please enter your correct delivery address.
                </p>

                <div className="space-y-5">

                  <div>
                    <label className="block font-semibold mb-2">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[rgb(59,42,34)]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[rgb(59,42,34)]"
                    />

                    <p className="text-xs text-gray-500 mt-1">
                      Enter a 10-digit phone number.
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      House Name / Street Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter house name, street and area"
                      rows="3"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none resize-none focus:border-[rgb(59,42,34)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                      <label className="block font-semibold mb-2">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[rgb(59,42,34)]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-2">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        required
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[rgb(59,42,34)]"
                      />
                    </div>

                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter 6-digit pincode"
                      pattern="[0-9]{6}"
                      maxLength="6"
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[rgb(59,42,34)]"
                    />
                  </div>

                </div>

              </div>

              <div className="bg-white rounded-3xl p-6 md:p-7 shadow-sm h-fit">

                <h2 className="text-2xl font-bold mb-6">
                  Order Summary
                </h2>

                <div className="space-y-5">

                  {checkoutItems.map((item, index) => (

                    <div
                      key={`${item.id || item.productId}-${index}`}
                      className="flex gap-4 items-center"
                    >

                      <div className="w-16 h-16 bg-[rgb(245,241,232)] rounded-xl p-2 flex items-center justify-center shrink-0">

                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs">
                            No Image
                          </span>
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <h3 className="font-semibold truncate">
                          {item.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>

                        <p className="text-sm font-semibold">
                          ₹{Number(item.price).toFixed(2)}
                        </p>

                      </div>

                      <p className="font-bold text-sm">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity)
                        ).toFixed(2)}
                      </p>

                    </div>

                  ))}

                </div>

                <div className="border-t border-gray-200 mt-6 pt-5 space-y-4">

                  <div className="flex justify-between text-gray-600">
                    <span>Total Items</span>
                    <span>{totalItems}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-700 font-semibold">
                      Free
                    </span>
                  </div>

                  <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-4">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={submitting || !checkoutItems.length}
                  className="w-full bg-[rgb(59,42,34)] text-white py-4 rounded-full mt-7 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? "Placing Order..."
                    : "Confirm Order"}
                </button>

                <Link
                  to="/cart"
                  className="block text-center mt-5 text-sm font-semibold hover:underline"
                >
                  Back to Cart
                </Link>

              </div>

            </form>

          </section>

        )}

      </main>

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

export default Checkout;
