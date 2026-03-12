"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { adminAPI } from "@/lib/api";
import {
  Users, FileText, Eye, Trash2, Shield, Loader2,
  BarChart3, CheckCircle, XCircle, Clock
} from "lucide-react";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "users" | "posts">("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) { router.push("/login"); return; }
      if (user.role !== "admin") { router.push("/"); return; }
      fetchAll();
    }
  }, [user, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, postsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getAllPosts(),
      ]);
      setStats(statsData.stats);
      setUsers(usersData.users);
      setPosts(postsData.posts);
    } catch {}
    setLoading(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Delete this user and all their posts?")) return;
    setActionId(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) { alert(err.message); }
    setActionId(null);
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    setActionId(id);
    try {
      await adminAPI.deletePost(id);
      setPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err: any) { alert(err.message); }
    setActionId(null);
  };

  const handleVerify = async (id: string) => {
    setActionId(id);
    try {
      const data = await adminAPI.verifyPost(id);
      setPosts((prev) => prev.map((p) => p._id === id ? data.group : p));
    } catch (err: any) { alert(err.message); }
    setActionId(null);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage users and content</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {[
            { key: "overview", label: "Overview", icon: BarChart3 },
            { key: "users", label: `Users (${users.length})`, icon: Users },
            { key: "posts", label: `Posts (${posts.length})`, icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
                { label: "Total Posts", value: stats.totalPosts, icon: FileText, color: "text-primary" },
                { label: "Total Admins", value: stats.totalAdmins, icon: Shield, color: "text-purple-400" },
                { label: "Categories", value: stats.categoryCounts?.length || 0, icon: BarChart3, color: "text-green-400" },
              ].map((s) => (
                <div key={s.label} className="glass-card p-5">
                  <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
                  <p className="text-3xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>{s.value}</p>
                  <p className="text-muted-foreground text-sm">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Posts by Category</h3>
                <div className="space-y-3">
                  {stats.categoryCounts?.map((c: any) => (
                    <div key={c._id} className="flex items-center justify-between">
                      <span className="text-sm">{c._id}</span>
                      <span className="font-bold text-primary">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>Recent Posts</h3>
                <div className="space-y-3">
                  {stats.recentPosts?.map((p: any) => (
                    <div key={p._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium truncate max-w-[200px]">{p.groupName}</p>
                        <p className="text-xs text-muted-foreground">{p.createdBy?.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users tab */}
        {tab === "users" && (
          <div className="space-y-3">
            {users.map((u) => (
              <div key={u._id} className="glass-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
                  {u.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{u.name}</p>
                    {u.role === "admin" && (
                      <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  <p className="text-xs text-muted-foreground">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                {u.role !== "admin" && (
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    disabled={actionId === u._id}
                    className="p-2 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors shrink-0"
                  >
                    {actionId === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Posts tab */}
        {tab === "posts" && (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p._id} className="glass-card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{p.groupName}</p>
                    {p.isVerified && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground">By {p.createdBy?.name} · {p.category}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {p.views}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      p.status === "active" ? "border-green-500/30 text-green-400 bg-green-500/10"
                      : p.status === "rejected" ? "border-red-500/30 text-red-400 bg-red-500/10"
                      : "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleVerify(p._id)}
                    disabled={actionId === p._id}
                    className={`p-2 rounded-lg transition-colors ${
                      p.isVerified
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-muted hover:bg-primary/10 hover:text-primary"
                    }`}
                    title={p.isVerified ? "Remove verification" : "Verify post"}
                  >
                    {actionId === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDeletePost(p._id)}
                    disabled={actionId === p._id}
                    className="p-2 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    {actionId === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
