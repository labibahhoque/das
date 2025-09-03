"use client";
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  CalendarIcon,
  UserIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "../../store/hooks";
import { BASE_URL } from "../../utils/constant";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  photo_url?: string;
  rating?: number;
  experience?: string;
}

interface BookingFormData {
  selectedDate: string;
  selectedTime: string;
  reason: string;
  doctorId: string; 
}

interface BookingErrors {
  selectedDate?: string;
  selectedTime?: string;
  reason?: string;
}

const availableTimeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

export default function PatientDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    selectedDate: "",
    selectedTime: "",
    reason: "",
    doctorId: "", 
  });
  const [bookingErrors, setBookingErrors] = useState<BookingErrors>({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/doctors?page=1&limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctorsData = res.data?.data || [];
        setDoctors(doctorsData);

        console.log("Fetched Doctors:", doctorsData);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      }
    };

    const fetchSpecializations = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/specializations`);
        const list = res.data?.data || [];
        setSpecializations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to fetch specializations:", err);
        setSpecializations([]);
      }
    };

    fetchDoctors();
    fetchSpecializations();
  }, [token]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesSearch = doctor.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSpecialization =
        selectedSpecialization === "" ||
        doctor.specialization.toLowerCase() ===
          selectedSpecialization.toLowerCase();
      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, searchTerm, selectedSpecialization]);

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
    setIsBookingSuccess(false);
    setBookingData({
      selectedDate: "",
      selectedTime: "",
      reason: "",
      doctorId: doctor.id,
    });
    setBookingErrors({});
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setIsBookingSuccess(false);
    setBookingData({
      selectedDate: "",
      selectedTime: "",
      reason: "",
      doctorId: "",
    });
    setBookingErrors({});
  };

  const validateBookingForm = (): boolean => {
    const newErrors: BookingErrors = {};
    if (!bookingData.selectedDate)
      newErrors.selectedDate = "Please select a date";
    if (!bookingData.selectedTime)
      newErrors.selectedTime = "Please select a time";
    if (!bookingData.reason.trim())
      newErrors.reason = "Please provide a reason";
    else if (bookingData.reason.trim().length < 10)
      newErrors.reason = "At least 10 characters required";

    setBookingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDoctor?.id) {
      console.error("No doctor selected");
      setBookingErrors({ reason: "Doctor selection error. Please try again." });
      return;
    }

    if (!validateBookingForm()) return;

    setIsLoading(true);
    try {
      const dateTime = new Date(
        `${bookingData.selectedDate} ${bookingData.selectedTime}`
      ).toISOString();
      console.log("Booking with doctor ID:", selectedDoctor.id);
      console.log("Booking data being sent:", {
        doctorId: selectedDoctor.id,
        date: dateTime,
        reason: bookingData.reason,
      });
      const res = await axios.post(
        `${BASE_URL}/appointments`,
        {
          doctorId: selectedDoctor.id, 
          date: dateTime,
          reason: bookingData.reason,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsBookingSuccess(true);
    } catch (error: any) {
      setBookingErrors({
        reason: error.response?.data?.message || "Booking failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
    if (bookingErrors[field as keyof BookingErrors]) {
      setBookingErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getMinDate = () => new Date().toISOString().split("T")[0];
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSpecialization("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Patient Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Find and book appointments with our doctors
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/patient/appointments")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                My Appointments
              </button>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  Welcome, {user?.name || "Patient"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Find a Doctor</h2>
            {(searchTerm || selectedSpecialization) && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by name
              </label>
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by specialization
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
              >
                <option value="">All Specializations</option>
                {specializations.map((s) => (
                  <option key={s + "-spec"} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor, idx) => (
              <div
                key={doctor.id + "-" + idx}
                className="bg-white shadow-lg rounded-lg border p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={doctor.photo_url || "/placeholder.svg"}
                    alt={doctor.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {doctor.name}
                    </h3>
                    <p className="text-sm text-indigo-600 font-medium">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleBookAppointment(doctor)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span>Book Appointment</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">No doctors found.</div>
        )}
      </div>

      {isModalOpen && selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            {!isBookingSuccess ? (
              <form onSubmit={handleBookingSubmit}>
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-lg font-semibold">
                    Book Appointment with {selectedDoctor.name}
                  </h3>
                  <button onClick={closeModal} type="button">
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <input
                  type="date"
                  min={getMinDate()}
                  value={bookingData.selectedDate}
                  onChange={(e) =>
                    handleInputChange("selectedDate", e.target.value)
                  }
                  className="w-full border rounded-md px-3 py-2 mt-4"
                />
                {bookingErrors.selectedDate && (
                  <p className="text-sm text-red-600">
                    {bookingErrors.selectedDate}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time + "-slot"}
                      type="button"
                      onClick={() => handleInputChange("selectedTime", time)}
                      className={`py-2 px-3 text-sm rounded-md border ${
                        bookingData.selectedTime === time
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                {bookingErrors.selectedTime && (
                  <p className="text-sm text-red-600">
                    {bookingErrors.selectedTime}
                  </p>
                )}

                <textarea
                  placeholder="Reason for visit..."
                  rows={3}
                  value={bookingData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className="w-full border rounded-md px-3 py-2 mt-2"
                />
                {bookingErrors.reason && (
                  <p className="text-sm text-red-600">{bookingErrors.reason}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white py-2 rounded-md mt-2"
                >
                  {isLoading ? "Booking..." : "Book Appointment"}
                </button>
              </form>
            ) : (
              <div className="text-center">
                <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold">
                  Appointment Booked Successfully!
                </h3>
                <button
                  onClick={closeModal}
                  className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded-md"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
