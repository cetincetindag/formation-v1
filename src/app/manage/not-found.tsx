"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AlertTriangle, ArrowLeft, Plus } from "lucide-react";
export default function NotFound() {
  const router = useRouter();
  return (
    <div className="container flex h-[80vh] flex-col items-center justify-center">
      <Card className="mx-auto w-full max-w-md shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Form Not Found</CardTitle>
          <CardDescription>
            The form you are looking for doesn&apos;t exist or you don&apos;t
            have access to it.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center">
          <p>
            Please check the form URL or try again with the correct credentials.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            className="w-full"
            onClick={() => router.push("/")}
            variant="default"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => router.push("/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Form
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
