
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Footer from "../components/Footer";
import {
  getUserCart,
  addToCart,
} from "../services/cartService";

import { setCartItems, clearCart } from "../redux/cartSlice";
import Navbar from "../components/navbar";

function Wishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const wishlistKey = user ? `wishlist_${user.id}` : null;

  const reduxCartItems = useSelector((state) => state.cart.items);

  const [wishlist, setWishlist] = useState(() => {
    if (!wishlistKey) return [];

    return JSON.parse(localStorage.getItem(wishlistKey) || "[]");
  });

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
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
      } catch (error) {
        console.error("Unable to load cart:", error);
        toast.error("Unable to load your cart!");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (wishlistKey) {
      localStorage.setItem(
        wishlistKey,
        JSON.stringify(wishlist)
      );
    }
  }, [wishlist, wishlistKey]);

  const removeFromWishlist = (id) => {
    setWishlist((previousWishlist) =>
      previousWishlist.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  const addWishlistToCart = async (product) => {
    if (!user) {
      toast.error("Please login to add products to your cart!");
      navigate("/login");
      return;
    }

    if (isUpdating) return;

    setIsUpdating(true);

    try {
      const response = await addToCart(user.id, product);

      dispatch(setCartItems(response.items || []));

      toast.success("Product added to cart!");
    } catch (error) {
      toast.error(error.message || "Unable to add product to cart!");
    } finally {
      setIsUpdating(false);
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
          My Wishlist
        </h1>

      </section>

      <main className="flex-1">

        <section className="max-w-6xl mx-auto px-5 pb-16">

          {loading ? (
            <p className="text-center py-16 text-lg">
              Loading your wishlist...
            </p>
          ) : wishlist.length === 0 ? (

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
                      {isUpdating ? "Adding..." : "Add to Cart"}
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full mt-3 border border-[rgb(59,42,34)] py-3 rounded-full font-semibold hover:bg-[rgb(245,241,232)] transition disabled:opacity-40"
                    >
                      Remove from Wishlist
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

     <Footer/>
    </div>
  );
}

export default Wishlist;
