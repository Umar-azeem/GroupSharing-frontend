"use client";

import Link from "next/link";
import { Heart, Eye, ExternalLink, Shield, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { groupsAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/components/providers/SocketProvider";
import { useRouter } from "next/navigation";
import TimeAgo from "@/components/ui/TimeAgo";

interface Group {
  _id: string;
  groupName: string;
  groupLink: string;
  imageUrl: string;
  description: string;
  category: string;
  createdBy: { _id: string; name: string; profileImage: string };
  likes: string[];
  views: number;
  isVerified: boolean;
  createdAt: string;
}

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

export default function GroupCard({ group }: { group: Group }) {
  const { user } = useAuth();
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(group.likes?.length || 0);
  const [liked, setLiked] = useState(
    user ? group.likes?.some((id: any) => (typeof id === 'string' ? id === user._id : id._id === user._id)) : false,
  );
  const [views, setViews] = useState(group.views || 0);
  const [liking, setLiking] = useState(false);
  const { socket } = useSocket();

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:8000";
  const imageUrl = group.imageUrl
    ? group.imageUrl.startsWith("http")
      ? group.imageUrl
      : `${API_URL}${group.imageUrl}`
    : null;

  // Real-time updates for THIS card
  useEffect(() => {
    const handleGroupLiked = ({ groupId, likesCount, userId, isLiked }: any) => {
      if (groupId === group._id) {
        setLikesCount(likesCount);
        // Only update 'liked' state if it's from another device/user 
        // OR we need to sync with the server response
        if (user && userId === user._id) {
          setLiked(isLiked);
        }
      }
    };

    const handleGroupViewed = ({ groupId, viewsCount }: any) => {
      if (groupId === group._id) {
        setViews(viewsCount);
      }
    };

    socket.on("group:liked", handleGroupLiked);
    socket.on("group:viewed", handleGroupViewed);

    return () => {
      socket.off("group:liked", handleGroupLiked);
      socket.off("group:viewed", handleGroupViewed);
    };
  }, [group._id, socket, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || liking) return;

    // Optimistic Update
    const previousLiked = liked;
    const previousCount = likesCount;
    
    setLiked(!previousLiked);
    setLikesCount(prev => previousLiked ? prev - 1 : prev + 1);
    setLiking(true);

    try {
      await groupsAPI.like(group._id);
      // We don't need to do anything here because the socket event 
      // will eventually sync the state if needed, or the optimistic update is enough.
    } catch (err) {
      // Rollback on error
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setLiking(false);
    }
  };

  // timeAgo function removed in favor of TimeAgo component

  const handleCardClick = () => {
    router.push(`/group/${group._id}`);
  };

  return (
    <article
      onClick={handleCardClick}
      className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300 hover:glow-orange hover:-translate-y-0.5 group cursor-pointer h-full flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] bg-muted overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={group.groupName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="text-4xl font-bold text-muted-foreground/20"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              {group.groupName[0]}
            </div>
          </div>
        )}
        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={`category-badge ${CATEGORY_COLORS[group.category] || CATEGORY_COLORS.Other}`}
          >
            {group.category}
          </span>
        </div>
        {group.isVerified && (
          <div className="absolute top-3 right-3">
            <CheckCircle className="w-5 h-5 text-primary fill-primary/20" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-base mb-1 truncate group-hover:text-primary transition-colors"
          style={{ fontFamily: "Syne, sans-serif" }}
        >
          {group.groupName}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1 mb-3">
          {group.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 transition-colors ${
                liked ? "text-red-400" : "hover:text-red-400"
              } ${!user ? "cursor-default" : ""}`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              {likesCount}
            </button>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {views}
            </span>
            <TimeAgo date={group.createdAt} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (group.groupLink) {
                window.open(group.groupLink, "_blank", "noopener,noreferrer");
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
          >
            Join <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
}
