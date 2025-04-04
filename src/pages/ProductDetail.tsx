import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Product } from "../types";
import { useCart } from "../hooks/useCart";

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      }
    };
    fetchProduct();
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-xl text-indigo-600 mb-2">${product.price}</p>
        <p className="text-gray-600 mb-2">Stock: {product.stock}</p>
        <p className="text-gray-600 mb-2">Category: {product.category.name}</p>
        <p className="text-gray-600 mb-4">Supplier: {product.supplier.name}</p>
        <button
          onClick={() => addToCart(product)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          disabled={product.stock === 0}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;