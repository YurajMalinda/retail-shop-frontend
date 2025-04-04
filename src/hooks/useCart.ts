import { useState, useEffect } from "react";
import axios from "axios";
import { CartApiResponse, CartItem, Product } from "../types";
import { useAuth } from "./useAuth";

export const useCart = () => {
  const { user, accessToken } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("guestCart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const syncCart = async () => {
      if (user && accessToken) {
        try {
          const response = await axios.get<CartApiResponse>("/api/cart", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setCart(response.data.items);
          localStorage.removeItem("guestCart");
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      } else {
        localStorage.setItem("guestCart", JSON.stringify(cart));
      }
    };
    syncCart();
  }, [user, accessToken, cart]);

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (user && accessToken) {
      try {
        const response = await axios.post<CartApiResponse>(
          "/api/cart",
          { productId: product.id, quantity },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setCart(response.data.items);
      } catch (error) {
        console.error("Failed to add to cart:", error);
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find(
          (item) => item.product.id === product.id
        );
        if (existingItem) {
          return prevCart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prevCart, { product, quantity }];
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user && accessToken) {
      try {
        const response = await axios.delete<CartApiResponse>(
          `/api/cart/item/${productId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setCart(response.data.items);
      } catch (error) {
        console.error("Failed to remove from cart:", error);
      }
    } else {
      setCart((prevCart) =>
        prevCart.filter((item) => item.product.id !== productId)
      );
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (user && accessToken) {
      try {
        const response = await axios.put<CartApiResponse>(
          "/api/cart/item",
          { productId, quantity },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setCart(response.data.items);
      } catch (error) {
        console.error("Failed to update cart quantity:", error);
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user && accessToken) {
      try {
        await axios.delete("/api/cart/clear", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCart([]);
      } catch (error) {
        console.error("Failed to clear cart:", error);
      }
    } else {
      setCart([]);
    }
  };

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart };
};
