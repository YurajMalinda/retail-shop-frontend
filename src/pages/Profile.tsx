// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

interface ApiError {
  message?: string;
}

interface ProfileData {
  phone: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

const Profile: React.FC = () => {
  const { accessToken, user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    phone: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken || !user?.id) {
        toast.error("Authentication required");
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get<ProfileData>(
          `/api/customers/${user.id}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setProfile({
          phone: response.data.phone || "",
          billingAddress: response.data.billingAddress || {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
          },
        });
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiError>;
        toast.error(
          `Failed to fetch profile: ${
            axiosError.response?.data?.message || axiosError.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [accessToken, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      toast.error("Authentication required");
      return;
    }
    setLoading(true);
    try {
      await axios.put("/api/customers", profile, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiError>;
      toast.error(
        `Failed to update profile: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Street
            </label>
            <input
              value={profile.billingAddress.street}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  billingAddress: {
                    ...profile.billingAddress,
                    street: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              value={profile.billingAddress.city}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  billingAddress: {
                    ...profile.billingAddress,
                    city: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              value={profile.billingAddress.state}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  billingAddress: {
                    ...profile.billingAddress,
                    state: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              value={profile.billingAddress.postalCode}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  billingAddress: {
                    ...profile.billingAddress,
                    postalCode: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              value={profile.billingAddress.country}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  billingAddress: {
                    ...profile.billingAddress,
                    country: e.target.value,
                  },
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;