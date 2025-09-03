"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline"
import { useAppSelector } from "../../store/hooks" 
import { BASE_URL } from "../../utils/constant"

type AppointmentStatus = "PENDING" | "COMPLETE" | "CANCELLED" 

interface Appointment {
  id: string
  doctorName: string
  doctorSpecialization: string
  doctorPhoto?: string
  date: string
  time: string
  reason: string
  status: AppointmentStatus
  bookedAt: string
}

export default function MyAppointments() {
  const user = useAppSelector((state) => state.auth.user)
  const token = useAppSelector((state) => state.auth.token)

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("all")
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  const fetchAppointments = async () => {
    if (!token) return
    setFetching(true)
    try {
      const res = await axios.get(
        `${BASE_URL}/appointments/patient${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = res.data?.data || []
      console.log("Raw appointments from API:", data);
      setAppointments(data.map((apt: any) => ({
        id: apt._id,
        doctorName: apt.doctor?.name || "Unknown Doctor",
        doctorSpecialization: apt.doctor?.specialization || "N/A",
        doctorPhoto: apt.doctor?.photo_url,
        date: apt.date.split("T")[0],
        time: new Date(apt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reason: apt.reason,
        status: apt.status,
        bookedAt: apt.createdAt,
      })))
    } catch (err) {
      console.error("Failed to fetch appointments:", err)
      setAppointments([])
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [statusFilter, token])

  const filteredAppointments = appointments 

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING": return "text-orange-600 bg-orange-100"
      case "COMPLETE": return "text-green-600 bg-green-100"
      case "CANCELLED": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING": return <ClockIcon className="h-4 w-4" />
      case "COMPLETE": return <CheckCircleIcon className="h-4 w-4" />
      case "CANCELLED": return <XCircleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const handleCancelAppointment = (appointment: Appointment) => {
    setAppointmentToCancel(appointment)
    setShowCancelModal(true)
  }

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel || !token) return
    setIsLoading(true)
    try {
      await axios.patch(
        `${BASE_URL}/appointments/${appointmentToCancel.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Update locally
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentToCancel.id ? { ...apt, status: "CANCELLED" } : apt
        )
      )
      setShowCancelModal(false)
      setAppointmentToCancel(null)
    } catch (err) {
      console.error("Failed to cancel appointment:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setAppointmentToCancel(null)
  }

  const getAppointmentCounts = () => {
    return {
      all: appointments.length,
      pending: appointments.filter((apt) => apt.status === "PENDING").length,
      completed: appointments.filter((apt) => apt.status === "COMPLETE").length,
      cancelled: appointments.filter((apt) => apt.status === "CANCELLED").length,
    }
  }

  const counts = getAppointmentCounts()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">My Appointments</h1>
                <p className="mt-1 text-sm text-gray-600">Manage and track your scheduled appointments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Book New Appointment
              </button>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">Welcome, {user?.name || "Patient"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filter by Status</h2>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setStatusFilter("all")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>All ({counts.all})</button>
              <button onClick={() => setStatusFilter("PENDING")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "PENDING" ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Pending ({counts.pending})</button>
              <button onClick={() => setStatusFilter("COMPLETE")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "COMPLETE" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Completed ({counts.completed})</button>
              <button onClick={() => setStatusFilter("CANCELLED")} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${statusFilter === "CANCELLED" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>Cancelled ({counts.cancelled})</button>
            </div>
          </div>
        </div>

        {fetching ? (
          <p className="text-center text-gray-500">Loading appointments...</p>
        ) : filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <img src={appointment.doctorPhoto || "/placeholder.svg"} alt={appointment.doctorName} className="h-16 w-16 rounded-full object-cover border-2 border-gray-200" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.doctorName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                      </div>
                      <p className="text-sm text-indigo-600 font-medium mb-2">{appointment.doctorSpecialization}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4" />
                          <span>Booked on {new Date(appointment.bookedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    {appointment.status === "PENDING" && (
                      <button onClick={() => handleCancelAppointment(appointment)} className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors">Cancel</button>
                    )}
                    {appointment.status === "COMPLETE" && (
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">Completed</button>
                    )}
                    {appointment.status === "CANCELLED" && (
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">Cancelled</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No {statusFilter !== "all" ? statusFilter : ""} appointments found</h3>
              <p className="mt-2 text-sm text-gray-600">{statusFilter === "all" ? "You haven't booked any appointments yet." : `You don't have any ${statusFilter} appointments.`}</p>
              <button onClick={() => (window.location.href = "/patient/dashboard")} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Book Your First Appointment</button>
            </div>
          </div>
        )}
      </div>
      {showCancelModal && appointmentToCancel && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
            <div className="text-center">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Cancel Appointment</h3>
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Doctor:</span> {appointmentToCancel.doctorName}</p>
                  <p><span className="font-medium">Date:</span> {new Date(appointmentToCancel.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {appointmentToCancel.time}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
              <div className="mt-6 flex justify-center space-x-3">
                <button onClick={closeCancelModal} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Keep Appointment</button>
                <button onClick={confirmCancelAppointment} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isLoading ? "Cancelling..." : "Yes, Cancel Appointment"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
