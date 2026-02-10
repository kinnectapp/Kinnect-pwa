/**
 * Login Component Example
 * Shows how to use the auth hook with Zustand store
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/api/auth";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";

const LoginExample: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { useLoginMutation } = useAuth();
  const { mutate: loginMutation, isPending } = useLoginMutation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation(formData, {
      onSuccess: async (response) => {
        const { user, accessToken, refreshToken } = response.data;

        // Store in Zustand
        await login(user, accessToken, refreshToken);

        toast.success("Login successful!");
        navigate("/app");
      },
      onError: (error: any) => {
        const errorMessage = handleApiError(error);
        toast.error(errorMessage);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isPending ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default LoginExample;
