"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { groupsAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/components/providers/SocketProvider";
import {
  ExternalLink, Heart, Eye, CheckCircle, Calendar, User,
  ArrowLeft, Edit2, Trash2, Loader2, Tag
} from "lucide-react";
import Link from "next/link";

const CATEGORY_COLORS: Record<string, string> = {
  WhatsApp: "border-green-500/40 text-green-400 bg-green-500/10",
  Instagram: "border-pink-500/40 text-pink-400 bg-pink-500/10",
  LinkedIn: "border-blue-600/40 text-blue-500 bg-blue-600/10",
  Facebook: "border-blue-500/40 text-blue-400 bg-blue-500/10",
  Discord: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10",
  Slack: "border-purple-500/40 text-purple-400 bg-purple-500/10",
  Telegram: "border-sky-500/40 text-sky-400 bg-sky-500/10",
  Twitter: "border-sky-400/40 text-sky-300 bg-sky-400/10",
  Other: "border-border text-muted-foreground bg-muted",
};

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";
  const { socket } = useSocket();
  const viewedRef = useRef(false);

  useEffect(() => {
    fetchGroup();

    // View Increment Logic
    if (!viewedRef.current && id) {
      const viewedGroupsString = localStorage.getItem("gs_viewed") || "[]";
      let viewedGroups = [];
      try {
        viewedGroups = JSON.parse(viewedGroupsString);
      } catch (e) {
        viewedGroups = [];
      }

      console.log(`[View Debug] Checking ID: ${id}, Already Viewed: ${viewedGroups.includes(id)}`);

      if (!viewedGroups.includes(id)) {
        viewedRef.current = true;
        // Optimistically mark as viewed in localStorage
        const updatedViewed = [...viewedGroups, id];
        localStorage.setItem("gs_viewed", JSON.stringify(updatedViewed));
        
        console.log(`[View Debug] Triggering API.view for ${id}`);
        // The backend handles the actual atomic de-duplication by IP/UserID
        groupsAPI.view(id as string).catch(err => {
          console.error("View increment error:", err);
        });
      } else {
        viewedRef.current = true; // Mark as done even if skipped
      }
    }



  }, [id]);

  // Real-time updates
  useEffect(() => {
    const handleGroupLiked = ({ groupId, likesCount, userId, isLiked }: any) => {
      if (groupId === id) {
        setLikes(likesCount);
        if (user && userId === user._id) {
          setLiked(isLiked);
        }
      }
    };

    const handleGroupViewed = ({ groupId, viewsCount }: any) => {
      if (groupId === id) {
        setGroup((prev: any) => prev ? { ...prev, views: viewsCount } : prev);
      }
    };

    socket.on("group:liked", handleGroupLiked);
    socket.on("group:viewed", handleGroupViewed);

    return () => {
      socket.off("group:liked", handleGroupLiked);
      socket.off("group:viewed", handleGroupViewed);
    };
  }, [id, socket, user]);

  const fetchGroup = async () => {
    try {
      const data = await groupsAPI.getOne(id as string);
      setGroup(data.group);
      setLikes(data.group.likes?.length || 0);
      setLiked(user ? data.group.likes?.includes(user._id) : false);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) return router.push("/login");
    try {
      const data = await groupsAPI.like(id as string);
      setLikes(data.likes);
      setLiked(data.isLiked);
    } catch { }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    setDeleting(true);
    try {
      await groupsAPI.delete(id as string);
      router.push("/dashboard");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = user && group?.createdBy?._id === user._id;
  const isAdmin = user?.role === "admin";
  const imageUrl = group?.imageUrl
    ? group.imageUrl.startsWith("http") ? group.imageUrl : `${API_URL}${group.imageUrl}`
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!group) return null;
  console.log("img", group);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10 w-full flex-1">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <article className="glass-card overflow-hidden">
          {/* Hero Image */}

          {group.imageUrl && (
            <div className="aspect-video relative overflow-hidden">
              <img src={group.imageUrl} alt={group.groupName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className={`category-badge ${CATEGORY_COLORS[group.category] || CATEGORY_COLORS.Other}`}>
                  {group.category}
                </span>
              </div>
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {!imageUrl && (
                  <span className={`category-badge ${CATEGORY_COLORS[group.category] || CATEGORY_COLORS.Other} mb-3 inline-block`}>
                    {group.category}
                  </span>
                )}
                <h1 className="text-3xl font-bold flex items-center gap-2" style={{ fontFamily: "Syne, sans-serif" }}>
                  {group.groupName}
                  {group.isVerified && <CheckCircle className="w-6 h-6 text-primary fill-primary/20" />}
                </h1>
              </div>
              {(isOwner || isAdmin) && (
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/create-post?edit=${id}`}
                    className="p-2 rounded-lg bg-muted hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-2 rounded-lg bg-muted hover:bg-destructive/20 hover:text-destructive transition-colors"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {group.createdBy?.name || "Unknown"}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(group.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" /> {group.views} views
              </span>
            </div>

            {/* Description */}
            <p className="text-foreground/80 leading-relaxed text-base mb-8">{group.description}</p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={group.groupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center justify-center gap-2 flex-1 py-3 text-base"
              >
                <ExternalLink className="w-5 h-5" /> Join Group
              </a>
              <button
                onClick={handleLike}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg border font-semibold text-sm transition-all ${liked
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "border-border hover:border-red-400/30 hover:text-red-400"
                  }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                {likes} {likes === 1 ? "Like" : "Likes"}
              </button>
            </div>
          </div>
        </article>

        {/* Group link display */}
        <div className="mt-4 glass-card p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-0.5">Group Link</p>
            <a
              href={group.groupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-sm truncate block hover:underline"
            >
              {group.groupLink}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
