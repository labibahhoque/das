import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { BASE_URL } from "../../utils/constant";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store/index";
import { setCredentials } from "../../store/slices/authSlice";

type UserRole = "patient" | "doctor";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("patient");
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: activeTab.toUpperCase(),
      });

      dispatch(
        setCredentials({ user: response.data.data.user, token: response.data.data.token })
      );
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));

      navigate(activeTab === "doctor" ? "/doctor/dashboard" : "/patient/dashboard");
    } catch (error: any) {
      setErrors({ general: error.response?.data?.message || "Invalid email or password" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your medical portal
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-8">
          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("patient")}
                className={`px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                  activeTab === "patient"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Patient Login
              </button>
              <button
                onClick={() => setActiveTab("doctor")}
                className={`px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                  activeTab === "doctor"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Doctor Login
              </button>
            </nav>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 px-3 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                placeholder="Enter your email"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 pr-10 shadow-sm ring-1 ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4 text-gray-400" /> : <EyeIcon className="h-4 w-4 text-gray-400" />}
                </button>
                {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
              </div>
            </div>
            {errors.general && <p className="text-red-600 text-sm">{errors.general}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : `Sign in as ${activeTab === "doctor" ? "Doctor" : "Patient"}`}
            </button>
          </form>

          <div className="mt-4 flex justify-between text-sm">
            
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Need an account? Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
