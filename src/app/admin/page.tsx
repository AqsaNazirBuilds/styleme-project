"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type OverviewData = {
  totalUsers: number;
  newUsersThisWeek: number;
  totalWardrobeItems: number;
  totalOutfits: number;
  totalAIConversations: number;
  popularStyles: { name: string; count: number }[];
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setData(result.data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading admin overview...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-destructive">Failed to load admin data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl">Admin dashboard</h1>
          <Link href="/admin/users" className="text-sm text-primary underline">
            Manage users →
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Total users", value: data.totalUsers },
            { label: "New this week", value: data.newUsersThisWeek },
            { label: "Wardrobe items", value: data.totalWardrobeItems },
            { label: "Outfits", value: data.totalOutfits },
            { label: "AI conversations", value: data.totalAIConversations },
          ].map((stat) => (
            <div key={stat.label} className="rounded-md border border-border bg-card p-4 text-center">
              <p className="text-2xl text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-border bg-card p-4">
          <p className="mb-3 font-medium">Popular styles</p>
          {data.popularStyles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No outfit style data yet.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {data.popularStyles.map((s) => (
                <li key={s.name} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="text-muted-foreground">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}