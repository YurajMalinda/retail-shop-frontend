// src/components/admin/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 fixed">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav className="space-y-2">
        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-indigo-600" : "hover:bg-gray-700"
            }`
          }
        >
          Analytics
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-indigo-600" : "hover:bg-gray-700"
            }`
          }
        >
          Categories
        </NavLink>
        <NavLink
          to="/admin/suppliers"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-indigo-600" : "hover:bg-gray-700"
            }`
          }
        >
          Suppliers
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `block px-4 py-2 rounded ${
              isActive ? "bg-indigo-600" : "hover:bg-gray-700"
            }`
          }
        >
          Products
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;