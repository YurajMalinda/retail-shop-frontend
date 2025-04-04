// src/components/admin/CategoryManager.tsx
import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Category } from "../../types";

interface CategoryManagerProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  accessToken: string | null;
  setConfirmDelete: React.Dispatch<
    React.SetStateAction<{
      type: "category" | "supplier" | "product";
      id: string;
    } | null>
  >;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  setCategories,
  accessToken,
  setConfirmDelete,
}) => {
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    try {
      const response = await axios.post<Category>(
        "/api/categories",
        newCategory,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setCategories([...categories, response.data]);
      setNewCategory({ name: "", description: "" });
      toast.success("Category added successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to add category: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    }
  };

  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    try {
      const response = await axios.put<Category>(
        `/api/categories/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setCategories(
        categories.map((cat) => (cat.id === id ? response.data : cat))
      );
      toast.success("Category updated successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Failed to update category: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">Category Management</h3>
      <form
        onSubmit={handleAddCategory}
        className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <input
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
          placeholder="Category Name"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <input
          value={newCategory.description}
          onChange={(e) =>
            setNewCategory({ ...newCategory, description: e.target.value })
          }
          placeholder="Description"
          className="rounded-md border-gray-300 shadow-sm"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Add Category
        </button>
      </form>
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`bg-white p-4 rounded-lg shadow-md flex justify-between items-center ${
              category.deleted ? "opacity-50" : ""
            }`}
          >
            <div>
              <input
                value={category.name}
                onChange={(e) =>
                  handleUpdateCategory(category.id, { name: e.target.value })
                }
                className="font-medium border-none focus:ring-0"
                disabled={category.deleted}
              />
              <input
                value={category.description}
                onChange={(e) =>
                  handleUpdateCategory(category.id, {
                    description: e.target.value,
                  })
                }
                className="text-sm text-gray-600 border-none focus:ring-0"
                disabled={category.deleted}
              />
            </div>
            {!category.deleted && (
              <button
                onClick={() =>
                  setConfirmDelete({ type: "category", id: category.id })
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

export default CategoryManager;