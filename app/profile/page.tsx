"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { authAPI } from "@/lib/api";
import { Upload, Loader2, Save, Lock, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (user) setName(user.name);
  }, [user, authLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setProfileError(""); setProfileSuccess(false);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("profileImage", image);
      await authAPI.updateProfile(formData);
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(""); setPwSuccess(false);
    if (passwords.newPass !== passwords.confirm) return setPwError("New passwords don't match");
    if (passwords.newPass.length < 6) return setPwError("Password must be at least 6 characters");
    setPwSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      setPwSuccess(true);
      setPasswords({ current: "", newPass: "", confirm: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const avatarUrl = preview || (user?.profileImage
    ? user.profileImage.startsWith("http") ? user.profileImage : `${API_URL}${user.profileImage}`
    : null);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "Syne, sans-serif" }}>Profile Settings</h1>

        {/* Profile form */}
        <div className="glass-card p-8 mb-6">
          <h2 className="font-bold text-lg mb-6" style={{ fontFamily: "Syne, sans-serif" }}>Personal Info</h2>
          <form onSubmit={handleProfileSave} className="space-y-5">
            {profileError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">{profileError}</div>
            )}
            {profileSuccess && (
              <div className="bg-green-950/50 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Profile updated successfully!
              </div>
            )}

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div
                onClick={() => fileRef.current?.click()}
                className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border border-border cursor-pointer hover:border-primary/30 transition-colors group"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground/30" style={{ fontFamily: "Syne, sans-serif" }}>
                    {user?.name[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-muted-foreground text-xs">{user?.email}</p>
                <button type="button" onClick={() => fileRef.current?.click()} className="text-primary text-xs hover:underline mt-1">
                  Change photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" className="input-field opacity-60 cursor-not-allowed" value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                user?.role === "admin" ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted border border-border text-muted-foreground"
              }`}>
                {user?.role}
              </span>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="glass-card p-8">
          <h2 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
            <Lock className="w-5 h-5" /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-5">
            {pwError && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">{pwError}</div>
            )}
            {pwSuccess && (
              <div className="bg-green-950/50 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Password changed successfully!
              </div>
            )}

            {[
              { label: "Current Password", key: "current", val: passwords.current },
              { label: "New Password", key: "newPass", val: passwords.newPass },
              { label: "Confirm New Password", key: "confirm", val: passwords.confirm },
            ].map(({ label, key, val }) => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">{label}</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={val}
                  onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })}
                  required
                />
              </div>
            ))}

            <button type="submit" disabled={pwSaving} className="btn-primary flex items-center gap-2">
              {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {pwSaving ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
