// src/pages/admin/AdminOrders.tsx
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "../../hooks/useAuth";
import { Order } from "../../types";
import { toast } from "react-toastify";

interface ApiError {
  message?: string;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get<{ docs: Order[]; pages: number }>(
          "/api/orders",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page, limit: 10 },
          }
        );
        setOrders(response.data.docs);
        setTotalPages(response.data.pages);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiError>;
        toast.error(
          `Failed to fetch orders: ${
            axiosError.response?.data?.message || axiosError.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [accessToken, page]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    try {
      const response = await axios.put<Order>(
        `/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setOrders(
        orders.map((order) => (order.id === orderId ? response.data : order))
      );
      toast.success("Order status updated");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        `Failed to update status: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order Management</h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">
                Order #{order.orderNumber}
              </h3>
              <p className="text-gray-600">Status: {order.status}</p>
              <p className="text-gray-600">Total: ${order.total}</p>
              <div className="mt-4">
                <h4 className="font-medium">Items:</h4>
                <ul className="list-disc pl-5">
                  {order.orderDetails.map((detail) => (
                    <li key={detail.id}>
                      {detail.product.name} - ${detail.price} x{" "}
                      {detail.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              <select
                value={order.status}
                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                className="mt-2 rounded-md border-gray-300 shadow-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          ))}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-gray-200 px-4 py-2 rounded-lg"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-gray-200 px-4 py-2 rounded-lg"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;