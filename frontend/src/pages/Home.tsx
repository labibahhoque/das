"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom" 

import {
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"

interface Stats {
  totalDoctors: number
  specializations: string[]
  totalAppointments: number
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalDoctors: 0,
    specializations: [],
    totalAppointments: 0,
  })
  const [loading, setLoading] = useState(true)

  const features = [
    {
      icon: CalendarDaysIcon,
      title: "Easy Appointment Booking",
      description: "Schedule appointments with your preferred doctors in just a few clicks.",
    },
    {
      icon: UserGroupIcon,
      title: "Qualified Doctors",
      description: "Access a network of experienced healthcare professionals across multiple specializations.",
    },
    {
      icon: ClockIcon,
      title: "Flexible Scheduling",
      description: "Book appointments that fit your schedule with real-time availability.",
    },
    {
      icon: ShieldCheckIcon,
      title: "Secure & Private",
      description: "Your health information is protected with enterprise-grade security.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <HeartIcon className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">MediCare Connect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Your Health, <span className="text-indigo-600">Our Priority</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with qualified healthcare professionals and manage your appointments seamlessly. Experience
            healthcare that puts you first.
          </p>
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.totalDoctors}+</div>
                <div className="text-gray-600">Qualified Doctors</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-indigo-600 mb-2">{stats.specializations.length}+</div>
                <div className="text-gray-600">Medical Specializations</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200 flex items-center justify-center"
            >
              Book Your First Appointment
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">Why Choose MediCare Connect?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We make healthcare accessible, convenient, and personalized for every patient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {!loading && stats.specializations.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4">Medical Specializations Available</h3>
              <p className="text-xl text-gray-600">Find the right specialist for your healthcare needs</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stats.specializations.slice(0, 8).map((specialization, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow duration-200"
                >
                  <div className="text-sm font-medium text-gray-900">{specialization}</div>
                </div>
              ))}
            </div>

            {stats.specializations.length > 8 && (
              <div className="text-center mt-8">
                <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-medium">
                  View all {stats.specializations.length} specializations →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-extrabold text-white mb-4">Ready to Take Control of Your Health?</h3>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust MediCare Connect for their healthcare needs.
          </p>
          <Link
            to="/register"
            className="bg-white text-indigo-600 hover:bg-gray-50 px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200 inline-flex items-center"
          >
            Start Your Journey Today
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <HeartIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <span className="text-lg font-semibold text-gray-900">MediCare Connect</span>
            </div>
            <div className="text-sm text-gray-500">© 2024 MediCare Connect. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
