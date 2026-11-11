
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

import {
  getUserCart,
  updateCart,
} from "../services/cartService";

import {
  setCartItems,
  clearCart,
} from "../redux/cartSlice";

import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;
const COUPON_CODE = "WELCOME20";
const DISCOUNT_PERCENTAGE = 20;

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

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

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponChecking, setCouponChecking] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/register", { replace: true });
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

  // Calculate subtotal
  const totalItems = checkoutItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const subtotal = checkoutItems.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // Calculate coupon discount
  const discountAmount = appliedCoupon
    ? (subtotal * DISCOUNT_PERCENTAGE) / 100
    : 0;

  const finalTotal = subtotal - discountAmount;

  // Check whether this user can use the coupon
  const checkCouponEligibility = async () => {
    const [userResponse, ordersResponse] = await Promise.all([
      axios.get(`${API_URL}/users/${user.id}`),
      axios.get(`${API_URL}/orders?userId=${user.id}`),
    ]);

    const currentUser = userResponse.data;
    const previousOrders = ordersResponse.data;

    const alreadyUsed =
      currentUser.welcomeCouponUsed === true ||
      previousOrders.some(
        (order) => order.couponCode === COUPON_CODE
      );

    const hasPreviousOrder = previousOrders.length > 0;

    return !alreadyUsed && !hasPreviousOrder;
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    if (couponInput.trim().toUpperCase() !== COUPON_CODE) {
      toast.error("Invalid coupon code.");
      setAppliedCoupon("");
      return;
    }

    if (couponChecking) return;

    setCouponChecking(true);

    try {
      const eligible = await checkCouponEligibility();

      if (!eligible) {
        setAppliedCoupon("");
        toast.error("This coupon is only valid for your first order.");
        return;
      }

      setAppliedCoupon(COUPON_CODE);
      toast.success("WELCOME20 applied! You got 20% off.");
    } catch (error) {
      console.error("Coupon check failed:", error);
      toast.error("Unable to verify coupon. Please try again.");
    } finally {
      setCouponChecking(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    toast.success("Coupon removed.");
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/register");
      return;
    }

    if (!checkoutItems.length) {
      toast.error("Your checkout is empty!");
      navigate("/cart");
      return;
    }

    if (submitting) return;

    setSubmitting(true);

    const updatedProducts = [];
    let orderCreated = false;

    try {
      // 1. Verify coupon again before placing order
      if (appliedCoupon === COUPON_CODE) {
        const eligible = await checkCouponEligibility();

        if (!eligible) {
          throw new Error(
            "This coupon is no longer available for your account."
          );
        }
      }

      // 2. Check latest stock for every product
      for (const item of checkoutItems) {
        const productId = item.productId || item.id;
        const quantity = Number(item.quantity);

        if (
          !productId ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          throw new Error("Invalid product quantity.");
        }

        const response = await axios.get(
          `${API_URL}/products/${productId}`
        );

        const product = response.data;
        const availableStock = Number(product.stock ?? 0);

        if (quantity > availableStock) {
          throw new Error(
            `${product.name} has only ${availableStock} items available.`
          );
        }

        updatedProducts.push({
          ...product,
          oldStock: availableStock,
          newStock: availableStock - quantity,
        });
      }

      // 3. Reduce product stock
      for (const product of updatedProducts) {
        await axios.patch(
          `${API_URL}/products/${product.id}`,
          {
            stock: product.newStock,
          }
        );
      }

      // 4. Prepare order items
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
        subtotal,
        discountAmount,
        couponCode: appliedCoupon || null,
        totalPrice: finalTotal,

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

      // 5. Save order
      await axios.post(`${API_URL}/orders`, orderData);

      // Only mark the order as created after successful POST
      orderCreated = true;

      // 6. Mark coupon as used after successful order
      if (appliedCoupon === COUPON_CODE) {
        try {
          await axios.patch(`${API_URL}/users/${user.id}`, {
            welcomeCouponUsed: true,
          });
        } catch (couponError) {
          // The saved order's couponCode also records its usage
          console.error("Coupon flag update failed:", couponError);
        }
      }

      // 7. Update cart after successful order
      try {
        const cart = await getUserCart(user.id);

        if (cart) {
          let remainingItems;

          if (checkoutType === "cart") {
            remainingItems = [];
          } else {
            const purchasedIds = checkoutItems.map(
              (item) => String(item.productId || item.id)
            );

            remainingItems = cart.items.filter(
              (item) =>
                !purchasedIds.includes(String(item.productId))
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

        toast.error(
          "Your order was placed, but the cart could not be updated. Please check My Orders."
        );

        navigate("/orders", { replace: true });
        return;
      }

      toast.success("Your order has been placed successfully!");
      navigate("/orders", { replace: true });

    } catch (error) {
      console.error("Order placement failed:", error);

      // Restore stock if order was not created
      if (!orderCreated) {
        for (const product of updatedProducts) {
          try {
            await axios.patch(
              `${API_URL}/products/${product.id}`,
              {
                stock: product.oldStock,
              }
            );
          } catch (rollbackError) {
            console.error(
              "Stock restoration failed:",
              rollbackError
            );
          }
        }
      }

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Unable to place your order. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] text-[rgb(59,42,34)] flex flex-col">

      <Navbar />

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

              {/* Delivery Information */}
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

              {/* Order Summary */}
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

                {/* Coupon Section */}
                <div className="border-t border-gray-200 mt-6 pt-5">

                  <h3 className="font-bold mb-3">
                    Have a Coupon?
                  </h3>

                  {!appliedCoupon ? (
                    <div className="flex gap-2">

                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value)
                        }
                        placeholder="Enter coupon code"
                        className="min-w-0 flex-1 border border-gray-300 rounded-xl px-3 py-3 outline-none uppercase focus:border-[rgb(59,42,34)]"
                      />

                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponChecking}
                        className="bg-[rgb(59,42,34)] text-white px-4 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50"
                      >
                        {couponChecking ? "Checking..." : "Apply"}
                      </button>

                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">

                      <div>
                        <p className="font-bold text-green-800">
                          {appliedCoupon} Applied
                        </p>

                        <p className="text-xs text-green-700">
                          20% discount added
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-sm font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>

                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Use WELCOME20 for 20% off your first order.
                  </p>

                </div>

                {/* Price Details */}
                <div className="border-t border-gray-200 mt-6 pt-5 space-y-4">

                  <div className="flex justify-between text-gray-600">
                    <span>Total Items</span>
                    <span>{totalItems}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Coupon Discount (20%)</span>
                      <span>- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="text-green-700 font-semibold">
                      Free
                    </span>
                  </div>

                  <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-4">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
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

      <Footer />

    </div>
  );
}

export default Checkout;
