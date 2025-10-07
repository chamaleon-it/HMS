"use client"

import type React from "react"
import { Sidebar } from "./sidebar"
import Header from "./topbar"
import Footer from "./Footer"
import { useAuth } from "@/auth/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

type AppShellProps = {
  children: React.ReactNode
}

export default function AppShell({ children,  }: AppShellProps) {
  const {  isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if(!isAuthenticated){
        router.push("/")
      }
    
    }, [isAuthenticated,router])
    

  return (
    <div className="flex">
      <Sidebar />
      <div className="min-h-screen flex-1">
      <Header />
        {children}
        <Footer />
      </div>
    </div>
  )
}
