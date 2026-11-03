
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";

function Shop() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  // Fetch products from JSON Server
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();

        // Remove duplicate products using ID
        const uniqueProducts = data.filter(
          (item, index, array) =>
            array.findIndex(
              (product) => product.id === item.id
            ) === index
        );

        setProducts(uniqueProducts);
      } catch (error) {
        setError("Failed to load products");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Get unique categories
  const categories = [
    "All",
    ...new Set(
      products
        .map((item) => item.category?.trim())
        .filter((item) => item)
    ),
  ];

  // Search and category filter
  let filteredProducts = products.filter((item) => {
    const matchesSearch = (item.name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase());

    const productCategory = (item.category || "")
      .trim()
      .toLowerCase();

    const selectedCategory = category.trim().toLowerCase();

    const matchesCategory =
      selectedCategory === "all" ||
      productCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sorting
  if (sort === "lowToHigh") {
    filteredProducts.sort(
      (a, b) => Number(a.price) - Number(b.price)
    );
  } else if (sort === "highToLow") {
    filteredProducts.sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
  } else if (sort === "name") {
    filteredProducts.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(245,241,232)] flex items-center justify-center">
        <h2 className="text-2xl text-[rgb(59,42,34)]">
          Loading products...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[rgb(245,241,232)] flex items-center justify-center">
        <h2 className="text-xl text-red-700">
          {error}
        </h2>
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

        <div className="flex gap-5 items-center">

          <Link to="/home" className="hover:opacity-60">
            Home
          </Link>

          {!user ? (
            <>
              <Link
                to="/login"
                className="border border-[rgb(59,42,34)] px-4 py-2 rounded-full text-sm hover:bg-[rgb(59,42,34)] hover:text-[rgb(245,241,232)] transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-[rgb(59,42,34)] text-[rgb(245,241,232)] px-4 py-2 rounded-full text-sm hover:bg-[rgb(81,57,46)] transition"
              >
                Register
              </Link>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-[rgb(59,42,34)] text-[rgb(245,241,232)] px-5 py-2 rounded-full text-sm hover:bg-[rgb(81,57,46)] transition"
            >
              Logout
            </button>
          )}

        </div>
      </nav>

      {/* Heading */}
      <section className="text-center px-5 pt-14 pb-8">

        <p className="uppercase tracking-[4px] text-sm mb-3">
          Find your perfect pair
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Our Collection
        </h1>

        <p className="text-[rgba(59,42,34,0.7)]">
          Explore footwear made for your everyday style.
        </p>

      </section>

      {/* Search */}
      <div className="max-w-xl mx-auto px-5 mb-6">

        <div className="flex items-center bg-white rounded-full border border-[rgba(59,42,34,0.2)] px-5 py-2 shadow-sm">

          <span className="text-xl mr-3">⌕</span>

          <input
            type="text"
            placeholder="Search your favourite shoes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 outline-none bg-transparent text-[rgb(59,42,34)] placeholder:text-[rgba(59,42,34,0.5)]"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm font-semibold"
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Category and Sort */}
      <div className="max-w-5xl mx-auto px-5 mb-12 grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Category Filter */}
        <div>
          <label className="block font-semibold mb-2">
            Filter by Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-xl bg-white border border-[rgba(59,42,34,0.2)] outline-none"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block font-semibold mb-2">
            Sort Products
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full p-3 rounded-xl bg-white border border-[rgba(59,42,34,0.2)] outline-none"
          >
            <option value="default">Default</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

      </div>

      {/* Product List */}
      <section className="px-6 md:px-12 pb-16">

        <div className="flex justify-between items-center mb-7">

          <h2 className="text-2xl font-bold">
            {category === "All" ? "All Shoes" : category}
          </h2>

          <p className="text-sm text-[rgba(59,42,34,0.7)]">
            {filteredProducts.length} Products
          </p>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {filteredProducts.length > 0 ? (
            filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
              />
            ))
          ) : (
            <p className="text-center text-lg col-span-full py-16">
              No products found!
            </p>
          )}

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

export default Shop;
