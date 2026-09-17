"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { generateInsights } from "@/lib/analytics/insights";
import { Lightbulb } from "lucide-react";

type AnalyticsData = {
  totalItems: number;
  totalOutfits: number;
  totalFavoriteItems: number;
  totalFavoriteOutfits: number;
  upcomingLooksCount: number;
  categoryDistribution: { name: string; value: number }[];
  colorDistribution: { name: string; value: number }[];
  styleDistribution: { name: string; value: number }[];
  occasionDistribution: { name: string; value: number }[];
};

const CHART_COLORS = ["#5c1a2b", "#8a3348", "#b85a6f", "#d68a9a", "#eec0cb", "#f5dce2"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setData(result.data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading your analytics...</p>
      </div>
    );
  }

  if (!data || data.totalItems === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background text-center">
        <p className="text-lg">No data yet</p>
        <p className="text-sm text-muted-foreground">
          Add wardrobe items to start seeing your style analytics.
        </p>
      </div>
    );
  }

  const insights = generateInsights(data);

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl">Style analytics</h1>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Items", value: data.totalItems },
            { label: "Outfits", value: data.totalOutfits },
            { label: "Favorite items", value: data.totalFavoriteItems },
            { label: "Favorite outfits", value: data.totalFavoriteOutfits },
            { label: "Upcoming looks", value: data.upcomingLooksCount },
          ].map((stat) => (
            <div key={stat.label} className="rounded-md border border-border bg-card p-4 text-center">
              <p className="text-2xl text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-md border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="size-5 text-primary" />
            <p className="font-medium">Smart insights</p>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
            {insights.map((insight, i) => (
              <li key={i}>• {insight}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-md border border-border bg-card p-4">
            <p className="mb-3 font-medium">Category distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.name}
                >
                  {data.categoryDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-md border border-border bg-card p-4">
            <p className="mb-3 font-medium">Color distribution</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.colorDistribution}>
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {data.styleDistribution.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="mb-3 font-medium">Style distribution</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.styleDistribution}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {data.occasionDistribution.length > 0 && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="mb-3 font-medium">Occasion distribution</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.occasionDistribution}>
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}