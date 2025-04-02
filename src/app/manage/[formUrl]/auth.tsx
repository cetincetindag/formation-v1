"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Lock } from "lucide-react";
import { toast } from "sonner";
export default function FormAuth({ formUrl }: { formUrl: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/forms/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formUrl, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("formAuthToken", data.token || "authenticated");

        if (data.formId && data.title) {
          try {
            const recentForm = {
              id: data.formId,
              title: data.title,
              createdAt: data.createdAt,
              lastAccessed: new Date().toISOString(),
            };
            const recentForms = JSON.parse(
              localStorage.getItem("recentForms") || "[]",
            );

            // Filter out forms with the same id or title
            const filteredForms = recentForms.filter(
              (form: any) =>
                form.id !== data.formId && form.title !== data.title,
            );

            // Add the current form to the beginning
            const updatedForms = [recentForm, ...filteredForms].slice(0, 5);
            localStorage.setItem("recentForms", JSON.stringify(updatedForms));
          } catch (e) {
            console.error("Error updating localStorage:", e);
          }
        }

        router.refresh();
      } else {
        toast.error("Invalid password");
      }
    } catch (error) {
      toast.error("An error occurred while trying to authenticate");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container flex h-[70vh] flex-col items-center justify-center">
      <Card className="mx-auto w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Lock className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="text-xl">Authentication Required</CardTitle>
          <CardDescription>
            Please enter the password to access this form&apos;s dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="form-password"
                  className="text-sm font-medium leading-none"
                >
                  Password
                </label>
                <Input
                  id="form-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter form password"
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Access Dashboard"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
