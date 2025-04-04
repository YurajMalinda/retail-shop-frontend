import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to E-Shop</h1>
      <p className="text-lg mb-8">Discover amazing products and great deals!</p>
      <div className="space-x-4">
        <Link
          to="/products"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          Shop Now
        </Link>
        {!user && (
          <Link
            to="/register"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Sign Up
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;