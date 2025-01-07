"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

export default function ManagePage() {
  const router = useRouter();
  const [formUrl, setFormUrl] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formUrl, password }),
      });

      if (response.ok) {
        router.push(`/manage/dashboard/${formUrl}`);
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-md p-6">
        <h1 className="mb-6 text-2xl font-bold">Manage Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Form URL"
              value={formUrl}
              onChange={(e: any) => setFormUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Form Password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Access Dashboard
          </Button>
        </form>
      </Card>
    </div>
  );
}
