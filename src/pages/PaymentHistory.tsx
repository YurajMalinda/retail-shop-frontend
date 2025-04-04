// src/pages/PaymentHistory.tsx
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

interface Payment {
  id: string;
  order: { orderNumber: string };
  amount: number;
  status: string;
  transactionId: string;
  errorMessage?: string;
  createdAt: string;
}

interface ApiError {
  message?: string;
}

const PaymentHistory: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get<{ docs: Payment[]; pages: number }>(
          "/api/payments",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page, limit: 10 },
          }
        );
        setPayments(response.data.docs);
        setTotalPages(response.data.pages);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiError>;
        toast.error(
          `Failed to fetch payments: ${
            axiosError.response?.data?.message || axiosError.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [accessToken, page]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment History</h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : payments.length === 0 ? (
        <p>No payments found</p>
      ) : (
        <div className="space-y-6">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">
                Order #{payment.order.orderNumber}
              </h3>
              <p className="text-gray-600">Amount: ${payment.amount}</p>
              <p className="text-gray-600">Status: {payment.status}</p>
              <p className="text-gray-600">
                Transaction ID: {payment.transactionId}
              </p>
              {payment.errorMessage && (
                <p className="text-red-600">Error: {payment.errorMessage}</p>
              )}
              <p className="text-gray-600">
                Date: {new Date(payment.createdAt).toLocaleDateString()}
              </p>
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

export default PaymentHistory;