"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const FormSuccessContent = () => {
  const [formLink, setFormLink] = React.useState("");
  const [copyMessage, setCopyMessage] = React.useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const formId = searchParams.get("id");
    if (formId) {
      setFormLink(`${window.location.origin}/view/${formId}`);
    } else {
      router.push("/");
    }
  }, [router, searchParams]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formLink);
      setCopyMessage("Link copied to clipboard");
      setTimeout(() => setCopyMessage(""), 3000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="flex min-h-screen w-2/3 flex-col items-center justify-center bg-black">
      <div className="w-full rounded-lg bg-black p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">
          Form Created Successfully
        </h1>
        <p className="mb-4 text-center">
          Please copy this link to share your form:
        </p>
        <div className="mb-4 flex items-center">
          <input
            type="text"
            value={formLink}
            readOnly
            className="flex-grow rounded-l-md border p-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={copyToClipboard}
            className="txt-black rounded-r-md bg-blue-500 px-4 py-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Copy
          </button>
        </div>
        {copyMessage && (
          <p className="text-center text-green-600">{copyMessage}</p>
        )}
        <button
          onClick={() => router.push("/")}
          className="mt-6 w-full rounded-md bg-gray-500 px-4 py-2 text-black hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Create Another Form
        </button>
      </div>
    </div>
  );
};

export default function FormSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormSuccessContent />
    </Suspense>
  );
}
