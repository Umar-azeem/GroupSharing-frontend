"use client";

import Link from "next/link";
import { Heart, Eye, ExternalLink, Shield, CheckCircle } from "lucide-react";
import { useState } from "react";
import { groupsAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

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
  const [likes, setLikes] = useState(group.likes?.length || 0);
  const [liked, setLiked] = useState(
    user ? group.likes?.includes(user._id) : false,
  );
  const [liking, setLiking] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "http://localhost:8000";
  const imageUrl = group.imageUrl
    ? group.imageUrl.startsWith("http")
      ? group.imageUrl
      : `${API_URL}${group.imageUrl}`
    : null;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || liking) return;
    setLiking(true);
    try {
      const data = await groupsAPI.like(group._id);
      setLikes(data.likes);
      setLiked(data.isLiked);
    } catch {}
    setLiking(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

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
              {likes}
            </button>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {group.views}
            </span>
            <span>{timeAgo(group.createdAt)}</span>
          </div>
          <a
            href={group.groupLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Join <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </article>
  );
}
