
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";

import { getUserCart } from "../services/cartService";
import { setCartItems, clearCart } from "../redux/cartSlice";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

const API_URL = import.meta.env.VITE_API_URL;

function Orders() {
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchPageData = async () => {
      if (!user) {
        setOrders([]);
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

        const response = await axios.get(
          `${API_URL}/orders`,
          {
            params: {
              userId: user.id,
            },
          }
        );

        const sortedOrders = [...response.data].sort(
          (a, b) =>
            new Date(b.orderDate).getTime() -
            new Date(a.orderDate).getTime()
        );

        setOrders(sortedOrders);
      } catch (error) {
        console.error("Unable to load orders:", error);
        toast.error("Unable to load your orders!");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [user?.id, dispatch]);

  // Print selected order
  useEffect(() => {
    if (selectedOrderId === null) return;

    const handleAfterPrint = () => {
      setSelectedOrderId(null);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    window.print();

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [selectedOrderId]);

  const handlePrint = (orderId) => {
    setSelectedOrderId(orderId);
  };

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] text-[rgb(59,42,34)] flex flex-col">

      <style>
        {`
          @media print {
            body {
              background: white !important;
            }

            .invoice-card {
              box-shadow: none !important;
              border-radius: 0 !important;
              background: white !important;
            }

            @page {
              margin: 15mm;
            }
          }
        `}
      </style>

      <div className="print:hidden">
        <Navbar />
      </div>

      <section className="text-center pt-12 pb-10 px-5 print:hidden">
        <p className="uppercase tracking-[3px] text-sm mb-3">
          TREDORA COLLECTION
        </p>

        <h1 className="text-4xl font-bold">
          My Orders
        </h1>
      </section>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-5 pb-16 print:max-w-none print:px-0 print:pb-0">

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

          ) : loading ? (

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

            <div className="space-y-7 print:space-y-0">
              {orders.map((order) => {

                // Original subtotal
                const subtotal = Number(
                  order.subtotal ??
                  order.items?.reduce(
                    (total, item) =>
                      total +
                      Number(item.price || 0) *
                      Number(item.quantity || 0),
                    0
                  ) ??
                  order.totalPrice ??
                  0
                );

                // Coupon discount
                const discountAmount = Number(
                  order.discountAmount || 0
                );

                // Final amount after discount
                const finalTotal = Number(
                  order.totalPrice || 0
                );

                return (
                  <div
                    key={order.id}
                    className={`
                      invoice-card bg-white rounded-3xl p-6 md:p-8 shadow-sm
                      print:p-0
                      ${
                        selectedOrderId !== null &&
                        String(selectedOrderId) !== String(order.id)
                          ? "hidden"
                          : ""
                      }
                    `}
                  >

                    {/* Invoice Heading */}
                    <div className="hidden print:block text-center border-b border-gray-300 pb-6 mb-6">

                      <h1 className="text-3xl font-bold tracking-widest">
                        TREDORA
                      </h1>

                      <p className="text-sm tracking-widest mt-2">
                        PREMIUM FOOTWEAR COLLECTION
                      </p>

                      <h2 className="text-xl font-bold mt-5">
                        ORDER INVOICE
                      </h2>

                    </div>

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
                        <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold print:bg-transparent print:text-black print:p-0">
                          {order.status}
                        </span>

                        <p className="font-bold text-lg mt-2">
                          ₹{finalTotal.toFixed(2)}
                        </p>

                        <p className="text-xs text-gray-500">
                          Final Amount
                        </p>
                      </div>

                    </div>

                    {/* Ordered Products */}
                    <div className="space-y-5">
                      {order.items?.map((item, index) => (

                        <div
                          key={`${order.id}-${item.productId}-${index}`}
                          className="flex flex-col sm:flex-row items-center gap-5"
                        >

                          <div className="w-24 h-24 bg-[rgb(245,241,232)] rounded-2xl p-3 flex items-center justify-center print:hidden">

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

                          <div className="flex-1 text-center sm:text-left">
                            <h3 className="font-bold text-lg">
                              {item.name}
                            </h3>

                            <p className="text-gray-500 mt-1">
                              Quantity: {item.quantity}
                            </p>

                            <p className="text-gray-500">
                              Price: ₹{Number(item.price).toFixed(2)}
                            </p>
                          </div>

                          <p className="font-bold text-lg">
                            ₹
                            {(
                              Number(item.price) *
                              Number(item.quantity)
                            ).toFixed(2)}
                          </p>

                        </div>

                      ))}
                    </div>

                    {/* Delivery Address */}
                    {order.shippingAddress && (
                      <div className="border-t border-gray-200 mt-6 pt-5">
                        <h3 className="font-bold text-lg mb-3">
                          Delivery Address
                        </h3>

                        <p className="font-semibold">
                          {order.shippingAddress.fullName}
                        </p>

                        <p className="text-gray-600 mt-1">
                          {order.shippingAddress.phone}
                        </p>

                        <p className="text-gray-600 mt-1">
                          {order.shippingAddress.address}
                        </p>

                        <p className="text-gray-600">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state} -{" "}
                          {order.shippingAddress.pincode}
                        </p>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="border-t border-gray-200 mt-6 pt-5 space-y-4">

                      <div className="flex justify-between text-gray-600">
                        <span>Total Items</span>
                        <span>{order.totalItems}</span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>

                      {discountAmount > 0 && (
                        <>
                          <div className="flex justify-between text-green-700">
                            <span>
                              Coupon ({order.couponCode || "Discount"})
                            </span>

                            <span className="font-semibold">
                              Applied
                            </span>
                          </div>

                          <div className="flex justify-between text-green-700 font-semibold">
                            <span>Discount</span>
                            <span>
                              - ₹{discountAmount.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between text-gray-600">
                        <span>Delivery</span>
                        <span className="text-green-700 font-semibold">
                          Free
                        </span>
                      </div>

                      <div className="flex justify-between text-xl font-bold border-t border-gray-200 pt-4">
                        <span>Final Total</span>
                        <span>₹{finalTotal.toFixed(2)}</span>
                      </div>

                    </div>

                    {/* Print Button */}
                    <div className="mt-6 text-right print:hidden">
                      <button
                        type="button"
                        onClick={() => handlePrint(order.id)}
                        className="bg-[rgb(59,42,34)] text-white px-6 py-3 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition"
                      >
                        🖨 Print Invoice
                      </button>
                    </div>

                    {/* Invoice Footer */}
                    <div className="hidden print:block border-t border-gray-300 mt-8 pt-5 text-center text-sm">
                      <p>Thank you for shopping with TREDORA!</p>
                      <p className="mt-2">
                        We appreciate your trust in us.
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          )}

        </section>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>

    </div>
  );
}

export default Orders;
