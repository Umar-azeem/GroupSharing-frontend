"use client";

import React, { useState, useEffect } from "react";

interface TimeAgoProps {
  date: string;
}

export default function TimeAgo({ date }: TimeAgoProps) {
  const [timeAgoStr, setTimeAgoStr] = useState("");

  useEffect(() => {
    const calculateTimeAgo = () => {
      const diff = Date.now() - new Date(date).getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return "just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days === 1) return "yesterday";
      if (days < 7) return `${days}d ago`;
      if (days < 30) return `${Math.floor(days / 7)}w ago`;
      return `${Math.floor(days / 30)}mo ago`;
    };

    setTimeAgoStr(calculateTimeAgo());

    const interval = setInterval(() => {
      setTimeAgoStr(calculateTimeAgo());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <span>{timeAgoStr}</span>;
}
