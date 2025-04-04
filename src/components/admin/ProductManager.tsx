// src/components/admin/ProductManager.tsx
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Product, Category, Supplier } from "../../types";

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  suppliers: Supplier[];
  accessToken: string | null;
  setConfirmDelete: React.Dispatch<
    React.SetStateAction<{
      type: "category" | "supplier" | "product";
      id: string;
    } | null>
  >;
}

interface ProductFormData {
  name: string;
  price: number;
  stock: number;
  supplier: string;
  category: string;
  image: File | null;
}

const ProductManager: React.FC<ProductManagerProps> = ({
  products,
  setProducts,
  categories,
  suppliers,
  accessToken,
  setConfirmDelete,
}) => {
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    name: "",
    price: 0,
    stock: 0,
    supplier: "",
    category: "",
    image: null,
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price.toString());
      formData.append("stock", newProduct.stock.toString());
      formData.append("supplier", newProduct.supplier);
      formData.append("category", newProduct.category);
      if (newProduct.image) formData.append("image", newProduct.image);
      const response = await axios.post<Product>("/api/products", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProducts([...products, response.data]);
      setNewProduct({
        name: "",
        price: 0,
        stock: 0,
        supplier: "",
        category: "",
        image: null,
      });
      toast.success("Product added successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to add product: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    }
  };

  const handleUpdateProduct = async (
    id: string,
    data: Partial<Product> & { image?: File }
  ) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    try {
      const formData = new FormData();
      if (data.name) formData.append("name", data.name);
      if (data.price !== undefined)
        formData.append("price", data.price.toString());
      if (data.stock !== undefined)
        formData.append("stock", data.stock.toString());
      if (data.image) formData.append("image", data.image);
      const response = await axios.put<Product>(
        `/api/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setProducts(
        products.map((prod) => (prod.id === id ? response.data : prod))
      );
      toast.success("Product updated successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to update product: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Product Management</h3>
      <form
        onSubmit={handleAddProduct}
        className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4"
      >
        <input
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          placeholder="Product Name"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
          }
          placeholder="Price"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <input
          type="number"
          value={newProduct.stock}
          onChange={(e) =>
            setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })
          }
          placeholder="Stock"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
          className="rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={newProduct.supplier}
          onChange={(e) =>
            setNewProduct({ ...newProduct, supplier: e.target.value })
          }
          className="rounded-md border-gray-300 shadow-sm"
          required
        >
          <option value="">Select Supplier</option>
          {suppliers.map((sup) => (
            <option key={sup.id} value={sup.id}>
              {sup.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewProduct({ ...newProduct, image: e.target.files?.[0] || null })
          }
          className="rounded-md border-gray-300 shadow-sm"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Product
        </button>
      </form>
      <div className="space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className={`bg-white p-4 rounded-lg shadow-md flex justify-between items-center ${
              product.deleted ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center space-x-4">
              {product.imageUrl && (
                <img
                  src={`http://localhost:5000${product.imageUrl}`}
                  alt={product.name}
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              <div>
                <input
                  value={product.name}
                  onChange={(e) =>
                    handleUpdateProduct(product.id, { name: e.target.value })
                  }
                  className="font-medium border-none focus:ring-0"
                  disabled={product.deleted}
                />
                <input
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    handleUpdateProduct(product.id, {
                      price: parseFloat(e.target.value),
                    })
                  }
                  className="text-sm text-gray-600 border-none focus:ring-0"
                  disabled={product.deleted}
                />
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) =>
                    handleUpdateProduct(product.id, {
                      stock: parseInt(e.target.value),
                    })
                  }
                  className="text-sm text-gray-600 border-none focus:ring-0"
                  disabled={product.deleted}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleUpdateProduct(product.id, {
                      image: e.target.files?.[0] || undefined,
                    })
                  }
                  className="text-sm text-gray-600"
                  disabled={product.deleted}
                />
              </div>
            </div>
            {!product.deleted && (
              <button
                onClick={() =>
                  setConfirmDelete({ type: "product", id: product.id })
                }
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManager;
