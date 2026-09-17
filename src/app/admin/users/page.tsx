"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  suspended: boolean;
  createdAt: string;
  _count: { wardrobeItems: number; outfits: number };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadUsers = (q: string) => {
    fetch(`/api/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setUsers(result.data);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadUsers("");
  }, []);

  const debouncedSearch = useDebouncedCallback((q: string) => {
    loadUsers(q);
  }, 400);

  const toggleSuspend = async (user: AdminUser) => {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: !user.suspended }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, suspended: !u.suspended } : u))
      );
    }
  };

  const handleDelete = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl">User management</h1>

        <Input
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedSearch(e.target.value);
          }}
          className="mb-6 max-w-sm"
        />

        {isLoading ? (
          <p className="text-muted-foreground">Loading users...</p>
        ) : (
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-md border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium">
                    {user.name}{" "}
                    {user.role === "ADMIN" && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Admin
                      </span>
                    )}
                    {user.suspended && (
                      <span className="ml-2 rounded-full bg-destructive/20 px-2 py-0.5 text-xs text-destructive">
                        Suspended
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {user._count.wardrobeItems} items · {user._count.outfits} outfits
                  </p>
                </div>

                {user.role !== "ADMIN" && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleSuspend(user)}>
                      {user.suspended ? "Unsuspend" : "Suspend"}
                    </Button>

                    {confirmDeleteId === user.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDeleteId(user.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}