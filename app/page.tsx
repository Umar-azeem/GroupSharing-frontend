"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GroupCard from "@/components/groups/GroupCard";
import { groupsAPI } from "@/lib/api";
import { Search, Flame, Clock, TrendingUp, Users, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const CATEGORIES = ["All", "WhatsApp", "Instagram", "LinkedIn", "Facebook", "Discord", "Slack", "Telegram", "Twitter", "Other"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest", icon: Clock },
  { value: "popular", label: "Most Viewed", icon: Eye },
  { value: "trending", label: "Trending", icon: TrendingUp },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Eye } from "lucide-react";

export default function HomePage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { sort, page: String(page), limit: "12" };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      const data = await groupsAPI.getAll(params);
      setGroups(data.groups);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    const timer = setTimeout(fetchGroups, search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchGroups]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5" /> Discover Communities
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight" style={{ fontFamily: "Syne, sans-serif" }}>
            Find Your{" "}
            <span className="gradient-text">Perfect</span>
            <br />Community
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Discover and share Instagram group links. Connect with communities around Tech, Gaming, Business, and more.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groups by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-lg"
            />
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {pagination?.total || 0} groups listed</span>
            <Link href="/create-post" className="flex items-center gap-1 text-primary hover:underline">
              Share yours <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 w-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  sort === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Groups Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <div className="skeleton aspect-video" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-5 rounded w-3/4" />
                  <div className="skeleton h-4 rounded w-full" />
                  <div className="skeleton h-4 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "Syne, sans-serif" }}>No groups found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters</p>
            <Link href="/create-post" className="btn-primary inline-flex items-center gap-2">
              <Flame className="w-4 h-4" /> Share a Group
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {groups.map((group, i) => (
                <div key={group._id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <GroupCard group={group} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10 pb-4">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-muted text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, pagination.pages))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg bg-muted text-sm disabled:opacity-40 hover:bg-secondary transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
