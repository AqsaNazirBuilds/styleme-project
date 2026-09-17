"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

type ProfileData = {
  name: string;
  email: string;
  createdAt: string;
  styleProfile: {
    favoriteStyles: string[];
    preferredColors: string[];
    favoriteCategories: string[];
    preferredOccasions: string[];
  } | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setProfile(result.data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-destructive">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center gap-2">
          <User className="size-6 text-primary" />
          <h1 className="text-3xl">Your profile</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p>{profile.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p>{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p>
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Style preferences</CardTitle>
              <Button size="sm" variant="outline" render={<Link href="/quiz" />} nativeButton={false}>
                Retake quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!profile.styleProfile ? (
              <p className="text-sm text-muted-foreground">You haven't completed the style quiz yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {[
                  { label: "Favorite styles", values: profile.styleProfile.favoriteStyles },
                  { label: "Preferred colors", values: profile.styleProfile.preferredColors },
                  { label: "Favorite categories", values: profile.styleProfile.favoriteCategories },
                  { label: "Preferred occasions", values: profile.styleProfile.preferredOccasions },
                ].map((group) => (
                  <div key={group.label}>
                    <p className="mb-1.5 text-xs text-muted-foreground">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.values.map((v) => (
                        <span
                          key={v}
                          className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-accent-foreground"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}