"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import { groupsAPI } from "@/lib/api";
import Link from "next/link";
import {
  PlusCircle, Edit2, Trash2, Eye, Heart, Users,
  Loader2, BarChart3, FileText
} from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    if (user) fetchGroups();
  }, [user, authLoading]);

  const fetchGroups = async () => {
    try {
      const data = await groupsAPI.getMyGroups();
      setGroups(data.groups);
    } catch {}
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this group post?")) return;
    setDeletingId(id);
    try {
      await groupsAPI.delete(id);
      setGroups((prev) => prev.filter((g) => g._id !== id));
    } catch (err: any) {
      alert(err.message);
    }
    setDeletingId(null);
  };

  const totalViews = groups.reduce((sum, g) => sum + (g.views || 0), 0);
  const totalLikes = groups.reduce((sum, g) => sum + (g.likes?.length || 0), 0);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link href="/create-post" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Group
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Posts", value: groups.length, icon: FileText, color: "text-primary" },
            { label: "Total Views", value: totalViews, icon: Eye, color: "text-blue-400" },
            { label: "Total Likes", value: totalLikes, icon: Heart, color: "text-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div className={`${stat.color} mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold" style={{ fontFamily: "Syne, sans-serif" }}>{stat.value}</p>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "Syne, sans-serif" }}>My Groups</h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : groups.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>No groups yet</h3>
              <p className="text-muted-foreground mb-6">Share your first Instagram community group link</p>
              <Link href="/create-post" className="btn-primary inline-flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Create First Post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const imageUrl = group.groupImage
                  ? group.groupImage.startsWith("http") ? group.groupImage : `${API_URL}${group.groupImage}`
                  : null;
                return (
                  <div key={group._id} className="glass-card p-4 flex items-center gap-4 hover:border-primary/20 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={group.groupName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground/30" style={{ fontFamily: "Syne, sans-serif" }}>
                          {group.groupName[0]}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/group/${group._id}`} className="font-semibold hover:text-primary transition-colors truncate block">
                        {group.groupName}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {group.views}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {group.likes?.length || 0}</span>
                        <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-xs">{group.category}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <Link
                        href={`/group/${group._id}`}
                        className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(group._id)}
                        disabled={deletingId === group._id}
                        className="p-2 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
                        title="Delete"
                      >
                        {deletingId === group._id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
