
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  getUserCart,
  updateCart,
} from "../services/cartService";

import { setCartItems, clearCart } from "../redux/cartSlice";

function CartList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const reduxCartItems = useSelector((state) => state.cart.items);

  const totalItems = reduxCartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const [cart, setCart] = useState([]);
  const [cartRecord, setCartRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const cartActionLock = useRef(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setCart([]);
        dispatch(clearCart());
        setLoading(false);
        return;
      }

      try {
        const data = await getUserCart(user.id);

        if (data) {
          setCartRecord(data);

          const formattedItems = (data.items || []).map((item) => ({
            ...item,
            id: item.productId,
          }));

          setCart(formattedItems);
          dispatch(setCartItems(data.items || []));
        } else {
          setCartRecord(null);
          setCart([]);
          dispatch(clearCart());
        }
      } catch (error) {
        console.error("Unable to load cart:", error);
        alert("Unable to load your cart!");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user?.id, dispatch]);

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

      const response = await updateCart(cartRecord.id, formattedItems);

      setCartRecord(response);
      dispatch(setCartItems(response.items || formattedItems));
    } catch (error) {
      console.error("Unable to update cart:", error);
      setCart(previousCart);
      alert("Unable to update your cart!");
    } finally {
      cartActionLock.current = false;
      setIsUpdating(false);
    }
  };

  const increaseQuantity = async (id) => {
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

  const removeFromCart = async (id) => {
    if (cartActionLock.current) return;

    const updatedItems = cart.filter(
      (item) => String(item.id) !== String(id)
    );

    await saveCartItems(updatedItems);
  };

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const handleBuyNow = (item) => {
    navigate("/checkout", {
      state: {
        items: [item],
        checkoutType: "single",
      },
    });
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    navigate("/checkout", {
      state: {
        items: cart,
        checkoutType: "cart",
      },
    });
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
          My Cart
        </h1>
      </section>

    
      <main className="flex-1">

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

                    
                      <div className="flex items-center gap-3 mt-4">

                        <button
                          type="button"
                          disabled={
                            isUpdating ||
                            item.quantity <= 1
                          }
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
                          disabled={isUpdating}
                          onClick={() => increaseQuantity(item.id)}
                          className="w-9 h-9 rounded-full bg-[rgb(245,241,232)] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>

                      </div>

                      <p className="font-semibold mt-3">
                        Subtotal: ₹
                        {(
                          Number(item.price || 0) *
                          Number(item.quantity || 1)
                        ).toFixed(2)}
                      </p>

                    
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleBuyNow(item)}
                        className="mt-4 px-6 py-2 rounded-full text-sm font-semibold bg-[rgb(59,42,34)] text-white hover:bg-[rgb(81,57,46)] transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Buy Now
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => removeFromCart(item.id)}
                        className="mt-3 ml-2 px-5 py-2 rounded-full text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>

                    </div>
                  </div>
                ))}

              </div>

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
                      (total, item) =>
                        total + Number(item.quantity || 0),
                      0
                    )}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-5 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isUpdating}
                  className="w-full mt-7 bg-[rgb(59,42,34)] text-white py-4 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>

              </div>
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

export default CartList;
