import AppShell from '@/components/layout/app-shell'
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import React from 'react'

export default function Notfound() {
  return (
    <AppShell>
      <div className="min-h-[calc(100vh-184px)] flex flex-col items-center justify-center text-center space-y-6">
        
        {/* Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500">
          <AlertTriangle className="w-10 h-10" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800">Page Not Found</h1>

        {/* Description */}
        <p className="text-gray-500 max-w-md">
          Oops! The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/">
            <Button className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md cursor-pointer">Go to Dashboard</Button>
          </Link>
          {/* <Link href="/appointments">
            <Button variant="outline">View Appointments</Button>
          </Link> */}
        </div>
      </div>
    </AppShell>
  )
}
