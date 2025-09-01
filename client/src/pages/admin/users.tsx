import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import CSVUpload from "@/components/csv-upload";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Users, ShieldCheck, Search } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "user" | "coordinator" | "super_admin";
  isApproved: boolean;
  createdAt?: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return (await res.json()) as AdminUser[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to approve user");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "User approved" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => toast({ title: "Failed to approve user", variant: "destructive" }),
  });



  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!Array.isArray(users)) return [] as AdminUser[];
    if (!term) return users;
    return users.filter(u =>
      (u.username || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  }, [users, search]);

  return (
    <div className="p-6 space-y-8 bg-tech-light min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-tech text-tech-dark">Users</h1>
          <p className="text-tech-grey mt-2 font-tech">Manage access, approvals and bulk import</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Import */}
        <div className="lg:col-span-1">
          <CSVUpload onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] })} />
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border-tech-grey/20">
            <CardHeader>
              <CardTitle className="text-tech-dark">All Users</CardTitle>
              <CardDescription className="text-tech-grey">Approve access for imported users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tech-grey" />
                  <Input
                    placeholder="Search by username or email"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-[540px] overflow-auto pr-1">
                {isLoading && <p className="text-sm text-tech-grey">Loading users…</p>}
                {!isLoading && filtered.length === 0 && (
                  <p className="text-sm text-tech-grey">No users found.</p>
                )}

                {filtered.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-tech-grey/10">
                    <div>
                      <p className="font-medium text-tech-dark">{u.username}</p>
                      <p className="text-xs text-tech-grey">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={u.isApproved ? "default" : "secondary"}>
                        {u.isApproved ? "Approved" : "Pending"}
                      </Badge>
                      {u.isApproved ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <Button size="sm" onClick={() => approveMutation.mutate(u.id)}>
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
