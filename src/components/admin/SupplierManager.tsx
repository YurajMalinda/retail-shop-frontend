// src/components/admin/SupplierManager.tsx
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Supplier } from "../../types";

interface SupplierManagerProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  accessToken: string | null;
  setConfirmDelete: React.Dispatch<
    React.SetStateAction<{
      type: "category" | "supplier" | "product";
      id: string;
    } | null>
  >;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({
  suppliers,
  setSuppliers,
  accessToken,
  setConfirmDelete,
}) => {
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contactEmail: "",
    contactPhone: "",
    address: { street: "", city: "", state: "", postalCode: "", country: "" },
  });

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    try {
      const response = await axios.post<Supplier>(
        "/api/suppliers",
        newSupplier,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setSuppliers([...suppliers, response.data]);
      setNewSupplier({
        name: "",
        contactEmail: "",
        contactPhone: "",
        address: {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        },
      });
      toast.success("Supplier added successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to add supplier: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    }
  };

  const handleUpdateSupplier = async (id: string, data: Partial<Supplier>) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    try {
      const response = await axios.put<Supplier>(`/api/suppliers/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSuppliers(
        suppliers.map((sup) => (sup.id === id ? response.data : sup))
      );
      toast.success("Supplier updated successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to update supplier: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Supplier Management</h3>
      <form
        onSubmit={handleAddSupplier}
        className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4"
      >
        <input
          value={newSupplier.name}
          onChange={(e) =>
            setNewSupplier({ ...newSupplier, name: e.target.value })
          }
          placeholder="Supplier Name"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <input
          value={newSupplier.contactEmail}
          onChange={(e) =>
            setNewSupplier({ ...newSupplier, contactEmail: e.target.value })
          }
          placeholder="Email"
          type="email"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <input
          value={newSupplier.contactPhone}
          onChange={(e) =>
            setNewSupplier({ ...newSupplier, contactPhone: e.target.value })
          }
          placeholder="Phone"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <input
          value={newSupplier.address.street}
          onChange={(e) =>
            setNewSupplier({
              ...newSupplier,
              address: { ...newSupplier.address, street: e.target.value },
            })
          }
          placeholder="Street"
          className="rounded-md border-gray-300 shadow-sm"
        />
        <input
          value={newSupplier.address.city}
          onChange={(e) =>
            setNewSupplier({
              ...newSupplier,
              address: { ...newSupplier.address, city: e.target.value },
            })
          }
          placeholder="City"
          className="rounded-md border-gray-300 shadow-sm"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Supplier
        </button>
      </form>
      <div className="space-y-2">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className={`bg-white p-4 rounded-lg shadow-md flex justify-between items-center ${
              supplier.deleted ? "opacity-50" : ""
            }`}
          >
            <div>
              <input
                value={supplier.name}
                onChange={(e) =>
                  handleUpdateSupplier(supplier.id, { name: e.target.value })
                }
                className="font-medium border-none focus:ring-0"
                disabled={supplier.deleted}
              />
              <input
                value={supplier.contactEmail}
                onChange={(e) =>
                  handleUpdateSupplier(supplier.id, {
                    contactEmail: e.target.value,
                  })
                }
                className="text-sm text-gray-600 border-none focus:ring-0"
                disabled={supplier.deleted}
              />
              <input
                value={supplier.contactPhone}
                onChange={(e) =>
                  handleUpdateSupplier(supplier.id, {
                    contactPhone: e.target.value,
                  })
                }
                className="text-sm text-gray-600 border-none focus:ring-0"
                disabled={supplier.deleted}
              />
            </div>
            {!supplier.deleted && (
              <button
                onClick={() =>
                  setConfirmDelete({ type: "supplier", id: supplier.id })
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

export default SupplierManager;
