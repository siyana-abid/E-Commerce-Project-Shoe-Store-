
import { useEffect, useState } from "react";
import Navbar from "../components/navbar";

import { getProducts } from "../services/productService";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [visibleCount, setVisibleCount] = useState(12);

  // Fetch active products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();

        // Remove inactive products
        const activeProducts = data.filter(
          (item) => item.active !== false
        );

        // Remove duplicate products
        const uniqueProducts = activeProducts.filter(
          (item, index, array) =>
            array.findIndex(
              (product) => product.id === item.id
            ) === index
        );

        setProducts(uniqueProducts);

      } catch (error) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Debouncing Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

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
      .includes(debouncedSearch.trim().toLowerCase());

    const productCategory = (item.category || "")
      .trim()
      .toLowerCase();

    const selectedCategory = category.trim().toLowerCase();

    const matchesCategory =
      selectedCategory === "all" ||
      productCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort products
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

  // View More
  const handleViewMore = () => {
    setVisibleCount((previousCount) => previousCount + 12);
  };

  // Search change
  const handleSearchChange = (value) => {
    setSearch(value);
    setVisibleCount(12);
  };

  // Category change
  const handleCategoryChange = (value) => {
    setCategory(value);
    setVisibleCount(12);
  };

  // Sort change
  const handleSortChange = (value) => {
    setSort(value);
    setVisibleCount(12);
  };

  const visibleProducts = filteredProducts.slice(0, visibleCount);

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

      <Navbar />

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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full py-3 outline-none bg-transparent text-[rgb(59,42,34)] placeholder:text-[rgba(59,42,34,0.5)]"
          />

          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="text-sm font-semibold"
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* Category and Sort */}
      <div className="max-w-5xl mx-auto px-5 mb-12 grid grid-cols-1 sm:grid-cols-2 gap-5">

        <div>
          <label className="block font-semibold mb-2">
            Filter by Category
          </label>

          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full p-3 rounded-xl bg-white border border-[rgba(59,42,34,0.2)] outline-none"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-2">
            Sort Products
          </label>

          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full p-3 rounded-xl bg-white border border-[rgba(59,42,34,0.2)] outline-none"
          >
            <option value="default">Default</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

      </div>

      {/* Products */}
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

          {visibleProducts.length > 0 ? (
            visibleProducts.map((item) => (
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

        {/* View More */}
        {visibleCount < filteredProducts.length && (
          <div className="flex justify-center mt-12">

            <button
              onClick={handleViewMore}
              className="bg-[rgb(59,42,34)] text-[rgb(245,241,232)] px-10 py-3 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition"
            >
              View More
            </button>

          </div>
        )}

      </section>

      <Footer />

    </div>
  );
}

export default Shop;
