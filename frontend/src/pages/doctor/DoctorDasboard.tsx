"use client";
import { useState, useEffect, useMemo } from "react";
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAppSelector } from "../../store/hooks";
import { BASE_URL } from "../../utils/constant";

type AppointmentStatus = "PENDING" | "COMPLETED" | "CANCELLED";

interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  patientPhone: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  bookedAt: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [appointmentToUpdate, setAppointmentToUpdate] = useState<{
    appointment: Appointment;
    newStatus: AppointmentStatus;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const fetchAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (dateFilter) params.append("date", dateFilter);
      params.append("page", currentPage.toString());

      const res = await fetch(
        `${BASE_URL}/appointments/doctor?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rawData = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(rawData));

      const appointmentsData = rawData.data || [];
      const mappedAppointments: Appointment[] = appointmentsData.map(
        (apt: any) => ({
          id: apt.id,
          patientName: apt.patient?.name || "Unknown",
          patientAge: apt.patient?.age || 0,
          patientPhone: apt.patient?.phone || "N/A",
          date: apt.date,
          time: new Date(apt.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          reason: apt.reason || "N/A",
          status: apt.status.toUpperCase() as AppointmentStatus,
          bookedAt: apt.createdAt,
        })
      );

      setAppointments(mappedAppointments);
      setTotalPages(rawData.totalPages || 1);
    } catch (err) {
      console.error(err);
      setAppointments([]);
      setTotalPages(1);
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter, currentPage]);

  const paginatedAppointments = useMemo(() => appointments, [appointments]);

  // Helpers
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return "text-orange-600 bg-orange-100";
      case "COMPLETED":
        return "text-green-600 bg-green-100";
      case "CANCELLED":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return <ClockIcon className="h-4 w-4" />;
      case "COMPLETED":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (
    appointment: Appointment,
    newStatus: AppointmentStatus
  ) => {
    setAppointmentToUpdate({ appointment, newStatus });
    setShowConfirmModal(true);
  };

  const confirmStatusUpdate = async () => {
    if (!appointmentToUpdate) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/appointments/update-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_id: appointmentToUpdate.appointment.id,
          status: appointmentToUpdate.newStatus,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to update appointment: ${text}`);
      }

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentToUpdate.appointment.id
            ? { ...apt, status: appointmentToUpdate.newStatus }
            : apt
        )
      );
      setShowConfirmModal(false);
      setAppointmentToUpdate(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setAppointmentToUpdate(null);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDateFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">
                Doctor Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your appointments and patient schedule
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{appointments.length}</span>{" "}
                appointments
                {dateFilter && (
                  <span> on {new Date(dateFilter).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {user?.name || "Doctor"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Filter Appointments
            </h2>
            {(statusFilter !== "all" || dateFilter) && (
              <button
                onClick={clearFilters}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {["all", "PENDING", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() =>
                  setStatusFilter(status as AppointmentStatus | "all")
                }
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div>
            <label
              htmlFor="dateFilter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Filter by Date
            </label>
            <input
              type="date"
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full md:w-auto rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        {loadingAppointments ? (
          <div className="text-center py-12">Loading appointments...</div>
        ) : paginatedAppointments.length > 0 ? (
          paginatedAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-4 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {apt.patientName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Age: {apt.patientAge} • {apt.patientPhone}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {getStatusIcon(apt.status)}
                      <span className="ml-1 capitalize">{apt.status}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {new Date(apt.date).toLocaleDateString()} at {apt.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4" />
                      <span>
                        Booked on {new Date(apt.bookedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Reason for visit:</span>{" "}
                      {apt.reason}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  {apt.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(apt, "COMPLETED")}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-500 transition-colors"
                      >
                        Mark Completed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(apt, "CANCELLED")}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {apt.status === "COMPLETED" && (
                    <div className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md text-center">
                      ✓ Completed
                    </div>
                  )}
                  {apt.status === "CANCELLED" && (
                    <div className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md text-center">
                      ✗ Cancelled
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">No appointments found</div>
        )}
      </div>

      {showConfirmModal && appointmentToUpdate && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-orange-500" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {appointmentToUpdate.newStatus === "COMPLETED"
                  ? "Mark as Completed"
                  : "Cancel Appointment"}
              </h3>
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Patient:</span>{" "}
                    {appointmentToUpdate.appointment.patientName}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(
                      appointmentToUpdate.appointment.date
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {appointmentToUpdate.appointment.time}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {appointmentToUpdate.newStatus === "COMPLETED"
                  ? "Are you sure you want to mark this appointment as completed?"
                  : "Are you sure you want to cancel this appointment? This action cannot be undone."}
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={closeConfirmModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    appointmentToUpdate.newStatus === "COMPLETED"
                      ? "bg-green-600 hover:bg-green-500 focus:ring-green-500"
                      : "bg-red-600 hover:bg-red-500 focus:ring-red-500"
                  }`}
                >
                  {isLoading
                    ? appointmentToUpdate.newStatus === "COMPLETED"
                      ? "Completing..."
                      : "Cancelling..."
                    : appointmentToUpdate.newStatus === "COMPLETED"
                    ? "Yes, Mark Completed"
                    : "Yes, Cancel Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
