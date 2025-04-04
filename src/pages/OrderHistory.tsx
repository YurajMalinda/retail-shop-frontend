// src/pages/OrderHistory.tsx
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import { Order } from "../types";
import { toast } from "react-toastify";

interface ApiError {
  message?: string;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
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
          "/api/orders/history",
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

  const handleDeleteOrder = async () => {
    if (!confirmDelete || !accessToken) return;
    try {
      await axios.delete(`/api/orders/${confirmDelete}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setOrders(orders.filter((order) => order.id !== confirmDelete));
      toast.success("Order deleted successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        `Failed to delete order: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Order History</h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">
                Order #{order.orderNumber}
              </h3>
              <p className="text-gray-600">Status: {order.status}</p>
              <p className="text-gray-600">Total: ${order.total}</p>
              <p className="text-gray-600">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
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
              {order.status === "pending" && (
                <button
                  onClick={() => setConfirmDelete(order.id)}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  Cancel Order
                </button>
              )}
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
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Cancel</h3>
            <p>Are you sure you want to cancel this order?</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg"
              >
                No
              </button>
              <button
                onClick={handleDeleteOrder}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;