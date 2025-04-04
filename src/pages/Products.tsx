// src/pages/Products.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Category, Product, Supplier } from "../types";
import { useCart } from "../hooks/useCart";

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    supplier: "",
    minPrice: "",
    maxPrice: "",
  });
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
          axios.get("/api/products", { params: filters }),
          axios.get("/api/categories"),
          axios.get("/api/suppliers"),
        ]);
        setProducts(productsRes.data.docs);
        setCategories(categoriesRes.data.docs);
        setSuppliers(suppliersRes.data.docs);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [filters]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Products</h2>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Search products..."
          className="rounded-md border-gray-300 shadow-sm"
        />
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filters.supplier}
          onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
          className="rounded-md border-gray-300 shadow-sm"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          placeholder="Min Price"
          className="rounded-md border-gray-300 shadow-sm"
        />
        <input
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          placeholder="Max Price"
          className="rounded-md border-gray-300 shadow-sm"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
            <Link to={`/products/${product.id}`}>
              <h3 className="text-lg font-semibold">{product.name}</h3>
            </Link>
            <p className="text-gray-600">${product.price}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
            <p className="text-sm text-gray-500">
              Category: {product.category.name}
            </p>
            <button
              onClick={() => addToCart(product)}
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;