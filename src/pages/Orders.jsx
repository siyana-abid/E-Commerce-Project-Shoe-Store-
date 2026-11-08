
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import { getUserCart } from "../services/cartService";
import { setCartItems, clearCart } from "../redux/cartSlice";

function Orders() {
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const reduxCartItems = useSelector((state) => state.cart.items);

  const totalItems = reduxCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          `http://localhost:3000/orders?userId=${encodeURIComponent(user.id)}`
        );

        const sortedOrders = [...response.data].sort(
          (a, b) =>
            new Date(b.orderDate).getTime() -
            new Date(a.orderDate).getTime()
        );

        setOrders(sortedOrders);
      } catch (error) {
        console.error("Unable to load orders:", error);
        alert("Unable to load your orders!");
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [user?.id, dispatch]);

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

      <section className="text-center pt-12 pb-10 px-5">

        <p className="uppercase tracking-[3px] text-sm mb-3">
          TREDORA COLLECTION
        </p>

        <h1 className="text-4xl font-bold">
          My Orders
        </h1>

      </section>

      <main className="flex-1">

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

            <div className="space-y-7">

              {orders.map((order) => (

                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 md:p-8 shadow-sm"
                >

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

                  <div className="space-y-5">

                    {order.items?.map((item, index) => (

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
                            Price: ₹{item.price}
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

export default Orders;
