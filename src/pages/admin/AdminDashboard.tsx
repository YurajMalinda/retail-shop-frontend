// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import axios, { AxiosResponse, AxiosError } from "axios";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { Category, Supplier, Product } from "../../types";
import Sidebar from "../../components/admin/Sidebar";
import AnalyticsPanel from "../../components/admin/AnalyticsPanel";
import CategoryManager from "../../components/admin/CategoryManager";
import SupplierManager from "../../components/admin/SupplierManager";
import ProductManager from "../../components/admin/ProductManager";
import ConfirmDialog from "../../components/admin/ConfirmDialog";

interface Analytics {
  totalSales: number;
  orderCount: number;
  topProducts: { id: string; name: string; sales: number }[];
}

const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState({
    includeDeleted: false,
    datePreset: "thisMonth" as "today" | "thisWeek" | "thisMonth" | "thisYear",
  });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "category" | "supplier" | "product";
    id: string;
  } | null>(null);
  const { accessToken } = useAuth();
  const location = useLocation();

  const fetchData = useCallback(async () => {
    if (!accessToken) {
      toast.error("Please log in to access the dashboard");
      return;
    }
    setLoading(true);
    try {
      // Conditionally fetch analytics
      const isAnalyticsRoute =
        location.pathname === "/admin/analytics" ||
        location.pathname === "/admin/";
      const analyticsPromise = isAnalyticsRoute
        ? axios.get<Analytics>("/api/admin/analytics", {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { preset: filters.datePreset },
          })
        : Promise.resolve(null as AxiosResponse<Analytics> | null);

      // Fetch other data unconditionally
      const [analyticsRes, categoriesRes, suppliersRes, productsRes] =
        await Promise.all([
          analyticsPromise,
          axios.get<{ docs: Category[] }>("/api/categories", {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { includeDeleted: filters.includeDeleted },
          }),
          axios.get<{ docs: Supplier[] }>("/api/suppliers", {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { includeDeleted: filters.includeDeleted },
          }),
          axios.get<{ docs: Product[] }>("/api/products", {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { includeDeleted: filters.includeDeleted },
          }),
        ]);

      // Set state with proper null handling
      setAnalytics(analyticsRes ? analyticsRes.data : null);
      setCategories(categoriesRes.data.docs);
      setSuppliers(suppliersRes.data.docs);
      setProducts(productsRes.data.docs);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to fetch data: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, filters, location.pathname]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async () => {
    if (!confirmDelete || !accessToken) return;
    try {
      const endpoint =
        confirmDelete.type === "category"
          ? "/api/categories"
          : confirmDelete.type === "supplier"
          ? "/api/suppliers"
          : "/api/products";
      await axios.delete(`${endpoint}/${confirmDelete.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (confirmDelete.type === "category")
        setCategories(categories.filter((cat) => cat.id !== confirmDelete.id));
      else if (confirmDelete.type === "supplier")
        setSuppliers(suppliers.filter((sup) => sup.id !== confirmDelete.id));
      else setProducts(products.filter((prod) => prod.id !== confirmDelete.id));
      toast.success(`${confirmDelete.type} deleted successfully`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to delete ${confirmDelete.type}: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    } finally {
      setConfirmDelete(null);
    }
  }, [accessToken, confirmDelete, categories, suppliers, products]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-6">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        <div className="mb-6 flex space-x-4">
          <select
            value={filters.datePreset}
            onChange={(e) =>
              setFilters({
                ...filters,
                datePreset: e.target.value as
                  | "today"
                  | "thisWeek"
                  | "thisMonth"
                  | "thisYear",
              })
            }
            className="rounded-md border-gray-300 shadow-sm"
          >
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="thisYear">This Year</option>
          </select>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.includeDeleted}
              onChange={(e) =>
                setFilters({ ...filters, includeDeleted: e.target.checked })
              }
              className="mr-2"
            />
            Include Deleted
          </label>
        </div>

        <Routes>
          <Route
            path="/analytics"
            element={<AnalyticsPanel analytics={analytics} />}
          />
          <Route
            path="/categories"
            element={
              <CategoryManager
                categories={categories}
                setCategories={setCategories}
                accessToken={accessToken}
                setConfirmDelete={setConfirmDelete}
              />
            }
          />
          <Route
            path="/suppliers"
            element={
              <SupplierManager
                suppliers={suppliers}
                setSuppliers={setSuppliers}
                accessToken={accessToken}
                setConfirmDelete={setConfirmDelete}
              />
            }
          />
          <Route
            path="/products"
            element={
              <ProductManager
                products={products}
                setProducts={setProducts}
                categories={categories}
                suppliers={suppliers}
                accessToken={accessToken}
                setConfirmDelete={setConfirmDelete}
              />
            }
          />
          <Route path="/" element={<AnalyticsPanel analytics={analytics} />} />
        </Routes>

        {confirmDelete && (
          <ConfirmDialog
            type={confirmDelete.type}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;