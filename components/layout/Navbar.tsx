"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Users,
  LogOut,
  User,
  LayoutDashboard,
  PlusCircle,
  Shield,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setDropdownOpen(false);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";
  const avatarUrl = user?.profileImage
    ? user.profileImage.startsWith("http")
      ? user.profileImage
      : `${API_URL}${user.profileImage}`
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
              Group<span className="text-primary">Share</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn-ghost text-sm">Home</Link>
            {user && (
              <>
                <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
                <Link href="/create-post" className="btn-ghost text-sm flex items-center gap-1">
                  <PlusCircle className="w-4 h-4" /> New Group
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="btn-ghost text-sm flex items-center gap-1 text-primary">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 overflow-hidden flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary font-bold text-sm">{user.name[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium max-w-24 truncate">{user.name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-12 w-48 glass-card border border-border rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-sm transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-sm transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-sm text-primary transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <hr className="border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-muted text-sm text-destructive w-full transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link href="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <Link href="/" className="block btn-ghost text-sm" onClick={() => setMobileOpen(false)}>Home</Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block btn-ghost text-sm" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                <Link href="/create-post" className="block btn-ghost text-sm" onClick={() => setMobileOpen(false)}>New Group</Link>
                <Link href="/profile" className="block btn-ghost text-sm" onClick={() => setMobileOpen(false)}>Profile</Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="block btn-ghost text-sm text-primary" onClick={() => setMobileOpen(false)}>Admin Panel</Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left btn-ghost text-sm text-destructive">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block btn-ghost text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/register" className="block btn-primary text-sm text-center" onClick={() => setMobileOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
