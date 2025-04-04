// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string>; // Updated to Promise<string>
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshToken: async () => "", // Default implementation returns empty string
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSubscribers, setRefreshSubscribers] = useState<
    ((token: string) => void)[]
  >([]);
  const navigate = useNavigate();

  // Check token expiry
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.post<{ accessToken: string }>(
          "/api/users/refresh-token",
          {},
          { withCredentials: true }
        );
        setAccessToken(response.data.accessToken);
        const userResponse = await axios.get<User>("/api/users/me", {
          headers: { Authorization: `Bearer ${response.data.accessToken}` },
        });
        setUser(userResponse.data);
      } catch {
        setUser(null);
        setAccessToken(null);
      }
    };
    checkAuth();
  }, []);

  // Axios interceptor for token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        if (accessToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: AxiosError) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (!isRefreshing) {
            setIsRefreshing(true);
            try {
              const response = await axios.post<{ accessToken: string }>(
                "/api/users/refresh-token",
                {},
                { withCredentials: true }
              );
              const newToken = response.data.accessToken;
              setAccessToken(newToken);
              refreshSubscribers.forEach((callback) => callback(newToken));
              setRefreshSubscribers([]);
              setIsRefreshing(false);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            } catch (refreshError: unknown) {
              setIsRefreshing(false);
              setUser(null);
              setAccessToken(null);
              navigate("/login");
              toast.error("Session expired. Please log in again.");
              return Promise.reject(refreshError);
            }
          } else {
            return new Promise((resolve) => {
              setRefreshSubscribers((prev) => [
                ...prev,
                (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(axios(originalRequest));
                },
              ]);
            });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, isRefreshing, navigate, refreshSubscribers]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<{
        user: User;
        accessToken: string;
      }>("/api/users/login", { email, password }, { withCredentials: true });
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      toast.success("Logged in successfully");
      navigate(response.data.user.role === "admin" ? "/admin" : "/");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Login failed: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => {
    try {
      const response = await axios.post<{
        user: User;
        accessToken: string;
      }>(
        "/api/users/register",
        { email, password, name, role },
        { withCredentials: true }
      );
      setUser(response.data.user);
      setAccessToken(response.data.accessToken);
      toast.success("Registered successfully");
      navigate("/");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Registration failed: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/users/logout", {}, { withCredentials: true });
      setUser(null);
      setAccessToken(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast.error(
        `Logout failed: ${
          axiosError.response?.data?.message || axiosError.message
        }`
      );
      throw error;
    }
  };

  const refreshToken = useCallback(async (): Promise<string> => {
    if (isRefreshing) {
      return new Promise<string>((resolve) => {
        setRefreshSubscribers((prev) => [...prev, resolve]);
      });
    }
    try {
      setIsRefreshing(true);
      const response = await axios.post<{ accessToken: string }>(
        "/api/users/refresh-token",
        {},
        { withCredentials: true }
      );
      const newToken = response.data.accessToken;
      setAccessToken(newToken);
      refreshSubscribers.forEach((callback) => callback(newToken));
      setRefreshSubscribers([]);
      setIsRefreshing(false);
      return newToken;
    } catch (error: unknown) {
      setUser(null);
      setAccessToken(null);
      navigate("/login");
      toast.error("Session expired. Please log in again.");
      throw error;
    }
  }, [isRefreshing, navigate, refreshSubscribers]);

  // Proactive token refresh before expiry
  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      if (accessToken && isTokenExpired(accessToken)) {
        refreshToken();
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [accessToken, refreshToken]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, register, logout, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};