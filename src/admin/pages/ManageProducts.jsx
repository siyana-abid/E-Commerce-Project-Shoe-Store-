
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
    description: "",
    stock: ""
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      image: "",
      description: "",
      stock: ""
    });

    setEditingId(null);
    setShowForm(false);
  };

  // Add or Update product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      Number(formData.price) <= 0 ||
      Number(formData.stock) < 0
    ) {
      toast.error("Enter valid price and stock");
      return;
    }

    const duplicate = products.some(
      (product) =>
        String(product.id) !== String(editingId) &&
        product.name.trim().toLowerCase() ===
          formData.name.trim().toLowerCase()
    );

    if (duplicate) {
      toast.error("Product already exists");
      return;
    }

    try {
      const productData = {
        ...formData,
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock)
      };

      if (editingId !== null) {
        // Update existing product
        const response = await axios.patch(
          `${API_URL}/products/${editingId}`,
          productData
        );

        setProducts((prev) =>
          prev.map((product) =>
            String(product.id) === String(editingId)
              ? response.data
              : product
          )
        );

        toast.success("Product updated successfully");
      } else {
        // Add new product
        const response = await axios.post(
          `${API_URL}/products`,
          {
            ...productData,
            active: true
          }
        );

        setProducts((prev) => [...prev, response.data]);

        toast.success("Product added successfully");
      }

      resetForm();

    } catch (error) {
      toast.error(
        editingId !== null
          ? "Failed to update product"
          : "Failed to add product"
      );
    }
  };

  // Open form for editing
  const handleEdit = (product) => {
    setFormData({
      name: product.name || "",
      category: product.category || "",
      price: product.price ?? "",
      image: product.image || "",
      description: product.description || "",
      stock: product.stock ?? ""
    });

    setEditingId(product.id);
    setShowForm(true);
  };

  // Activate or Deactivate product
  const handleToggleActive = async (product) => {
    const updatedStatus = product.active === false;

    try {
      const response = await axios.patch(
        `${API_URL}/products/${product.id}`,
        { active: updatedStatus }
      );

      setProducts((prev) =>
        prev.map((item) =>
          String(item.id) === String(product.id)
            ? response.data
            : item
        )
      );

      toast.success(
        updatedStatus
          ? "Product activated successfully"
          : "Product deactivated successfully"
      );

    } catch (error) {
      toast.error("Failed to update product status");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Get unique categories
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category))
  ];

  // Filter products
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (product) => product.category === selectedCategory
        );

  return (
    <div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-[#3B2A22] mb-2">
        Manage Products
      </h1>

      <p className="text-[#8B776B] mb-8">
        View and manage your TREDORA shoe collection.
      </p>

      {/* Add Product Button */}
      <button
        onClick={() => {
          if (showForm) {
            resetForm();
          } else {
            resetForm();
            setShowForm(true);
          }
        }}
        className="bg-[#3B2A22] text-white px-6 py-3 rounded-xl mb-6 hover:bg-[#51392e]"
      >
        {showForm ? "Close Form" : "+ Add Product"}
      </button>

      {/* Add / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl border border-[#3B2A22]/10 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <h2 className="text-xl font-semibold text-[#3B2A22] md:col-span-2">
            {editingId !== null ? "Edit Product" : "Add New Product"}
          </h2>

          <input
            type="text"
            placeholder="Product Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            className="p-3 rounded-xl border"
          />

          <input
            type="text"
            placeholder="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
            className="p-3 rounded-xl border"
          />

          <input
            type="number"
            placeholder="Price"
            min="0.01"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
            className="p-3 rounded-xl border"
          />

          <input
            type="url"
            placeholder="Image URL"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            required
            className="p-3 rounded-xl border"
          />

          <textarea
            placeholder="Product Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            className="p-3 rounded-xl border md:col-span-2"
          />

          <input
            type="number"
            placeholder="Stock"
            min="0"
            step="1"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            required
            className="p-3 rounded-xl border"
          />

          <button
            type="submit"
            className="bg-[#3B2A22] text-white rounded-xl p-3 hover:bg-[#51392e]"
          >
            {editingId !== null ? "Update Product" : "Save Product"}
          </button>

        </form>
      )}

      {/* Category Filter */}
      <div className="bg-white p-5 rounded-2xl mb-6 border border-[#3B2A22]/10">

        <label className="block text-[#3B2A22] font-semibold mb-3">
          Filter by Category
        </label>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 p-3 rounded-xl border border-[#3B2A22]/20 bg-[#F5F1E8] text-[#3B2A22]"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

      </div>

      {/* Product Count */}
      <div className="bg-white p-6 rounded-2xl border border-[#3B2A22]/10 mb-6">

        <p className="text-[#8B776B] text-sm">
          Products Found
        </p>

        <h2 className="text-3xl font-bold text-[#3B2A22] mt-2">
          {loading ? "..." : filteredProducts.length}
        </h2>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#3B2A22]/10 overflow-hidden">

        <div className="p-6 border-b border-[#3B2A22]/10">
          <h2 className="text-xl font-semibold text-[#3B2A22]">
            All Products
          </h2>
        </div>

        {loading ? (
          <p className="p-6">Loading products...</p>
        ) : filteredProducts.length === 0 ? (
          <p className="p-6 text-[#8B776B]">
            No products found in this category.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-[#F5F1E8] text-[#3B2A22]">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-t border-[#3B2A22]/10 text-[#3B2A22]"
                  >
                    <td className="p-4">{product.id}</td>
                    <td className="p-4 font-medium">{product.name}</td>
                    <td className="p-4">{product.category}</td>
                    <td className="p-4">₹{product.price}</td>
                    <td className="p-4">{product.stock}</td>

                    {/* Product Status */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          product.active === false
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {product.active === false ? "Inactive" : "Active"}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-[#3B2A22] text-white px-4 py-2 rounded-lg hover:bg-[#51392e]"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleActive(product)}
                          className={`text-white px-4 py-2 rounded-lg ${
                            product.active === false
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {product.active === false
                            ? "Activate"
                            : "Deactivate"}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default ManageProducts;
