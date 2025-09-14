"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

interface RedirectPageProps {
  params: Promise<{ formUrl: string }>;
}

export default function EditRedirectPage({ params }: RedirectPageProps) {
  const router = useRouter();
  const formUrl = React.use(params).formUrl;

  useEffect(() => {
    // Redirect to the manage page with edit tab parameter
    router.replace(`/manage/${formUrl}?tab=edit`);
  }, [router, formUrl]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading edit form...</span>
      </div>
    </div>
  );
}