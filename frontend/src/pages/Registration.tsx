import type React from "react";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon, PhotoIcon } from "@heroicons/react/24/outline";

type UserRole = "patient" | "doctor";

interface PatientFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  photo_url?: string;
}

interface DoctorFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  specialization: string;
  photo_url?: string;
}

type FormData = PatientFormData | DoctorFormData;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  specialization?: string;
  photo_url?: string;
  general?: string;
}

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<UserRole>("patient");
  const [patientData, setPatientData] = useState<PatientFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    photo_url: "",
  });
  const [doctorData, setDoctorData] = useState<DoctorFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    photo_url: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentFormData = (): FormData => {
    return activeTab === "patient" ? patientData : doctorData;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const formData = getCurrentFormData();

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Doctor-specific validation
    if (activeTab === "doctor") {
      const doctorFormData = formData as DoctorFormData;
      if (!doctorFormData.specialization.trim()) {
        newErrors.specialization = "Specialization is required for doctors";
      }
    }

    // Photo URL validation (optional but if provided, should be valid)
    if (formData.photo_url && formData.photo_url.trim()) {
      try {
        new URL(formData.photo_url);
      } catch {
        newErrors.photo_url = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const formData = getCurrentFormData();
      console.log("Registration attempt:", { ...formData, role: activeTab });

      // For demo purposes, simulate a registration error
      if (formData.email === "test@error.com") {
        setErrors({ general: "Email already exists" });
      } else {
        // Redirect to login or dashboard
        window.location.href = "/login";
      }
    } catch (error) {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof PatientFormData | keyof DoctorFormData,
    value: string
  ) => {
    if (activeTab === "patient") {
      setPatientData((prev) => ({ ...prev, [field]: value }));
    } else {
      setDoctorData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formData = getCurrentFormData();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join our medical platform
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
                Patient Registration
              </button>
              <button
                onClick={() => setActiveTab("doctor")}
                className={`px-3 py-2 font-medium text-sm rounded-md transition-colors ${
                  activeTab === "doctor"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Doctor Registration
              </button>
            </nav>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                      errors.name
                        ? "ring-red-300 focus:ring-red-600"
                        : "ring-gray-300 focus:ring-indigo-600"
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                      errors.email
                        ? "ring-red-300 focus:ring-red-600"
                        : "ring-gray-300 focus:ring-indigo-600"
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Specialization Field (Doctor only) */}
              {activeTab === "doctor" && (
                <div>
                  <label
                    htmlFor="specialization"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Specialization
                  </label>
                  <div className="mt-2">
                    <select
                      id="specialization"
                      name="specialization"
                      value={(formData as DoctorFormData).specialization}
                      onChange={(e) =>
                        handleInputChange("specialization", e.target.value)
                      }
                      className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                        errors.specialization
                          ? "ring-red-300 focus:ring-red-600"
                          : "ring-gray-300 focus:ring-indigo-600"
                      }`}
                    >
                      <option value="">Select your specialization</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="dermatology">Dermatology</option>
                      <option value="endocrinology">Endocrinology</option>
                      <option value="gastroenterology">Gastroenterology</option>
                      <option value="general-practice">General Practice</option>
                      <option value="neurology">Neurology</option>
                      <option value="oncology">Oncology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="psychiatry">Psychiatry</option>
                      <option value="radiology">Radiology</option>
                      <option value="surgery">Surgery</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.specialization && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.specialization}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`block w-full rounded-md border-0 py-1.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                      errors.password
                        ? "ring-red-300 focus:ring-red-600"
                        : "ring-gray-300 focus:ring-indigo-600"
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Confirm Password
                </label>
                <div className="mt-2 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`block w-full rounded-md border-0 py-1.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                      errors.confirmPassword
                        ? "ring-red-300 focus:ring-red-600"
                        : "ring-gray-300 focus:ring-indigo-600"
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Photo URL Field (Optional) */}
              <div>
                <label
                  htmlFor="photo_url"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Profile Photo URL{" "}
                  <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="mt-2 relative">
                  <input
                    id="photo_url"
                    name="photo_url"
                    type="url"
                    value={formData.photo_url || ""}
                    onChange={(e) =>
                      handleInputChange("photo_url", e.target.value)
                    }
                    className={`block w-full rounded-md border-0 py-1.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 ${
                      errors.photo_url
                        ? "ring-red-300 focus:ring-red-600"
                        : "ring-gray-300 focus:ring-indigo-600"
                    }`}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <PhotoIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  {errors.photo_url && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.photo_url}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  `Create ${
                    activeTab === "doctor" ? "Doctor" : "Patient"
                  } Account`
                )}
              </button>
            </div>

            {/* Additional Links */}
            <div className="text-center">
              <div className="text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <a
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
