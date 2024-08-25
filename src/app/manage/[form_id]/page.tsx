"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Response {
  id: string;
  createdAt: string;
  data: {
    fullName?: string;
    email?: string;
    [key: string]: any;
  };
}

interface PageProps {
  params: { form_id: string };
}

const Page = ({ params }: PageProps) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [deleteStatus, setDeleteStatus] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchResponses = async (passwordAttempt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/response?form_id=${params.form_id}&password=${passwordAttempt}&page=${currentPage}`,
      );

      if (response.status === 404) {
        throw new Error(
          "API route not found. Please check your server configuration.",
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();

        if (response.ok) {
          setResponses(data.responses);
          setTotalPages(data.totalPages);
          setTotalResponses(data.totalResponses);
          setIsAuthenticated(true);
        } else {
          setError(data.error || "Failed to fetch responses");
          setIsAuthenticated(false);
        }
      } else {
        const text = await response.text();
        console.error("Received non-JSON response:", text);
        throw new Error("Received unexpected response from server");
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      setError(
        `Error fetching responses: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      void fetchResponses(password);
    }
  }, [isAuthenticated, currentPage]);

  const handleAuthentication = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchResponses(password);
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this form? This action cannot be undone.",
      )
    ) {
      setDeleteStatus("Deleting Form...");
      try {
        const response = await fetch(
          `/api/forms?form_id=${params.form_id}&password=${password}`,
          {
            method: "DELETE",
          },
        );
        if (response.ok) {
          setDeleteStatus("Form deleted successfully! Redirecting...");
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          const errorData = await response.json();
          setDeleteStatus(`Error: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error deleting form:", error);
        setDeleteStatus(
          `There was an error while deleting your form: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <form onSubmit={handleAuthentication} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter form password"
          className="w-full rounded border p-2"
          required
        />
        <button
          type="submit"
          className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        >
          Access Responses
        </button>
        {error && <p className="text-red-500">{error}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Responses for Form: {params.form_id}
        </h1>
        <button
          onClick={handleDelete}
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Delete Form
        </button>
      </div>
      {deleteStatus && (
        <p
          className={`mt-2 ${deleteStatus.includes("Error") ? "text-red-500" : "text-green-500"}`}
        >
          {deleteStatus}
        </p>
      )}
      {isLoading ? (
        <p>Loading responses...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : totalResponses === 0 ? (
        <p>No responses yet for this form.</p>
      ) : (
        <>
          <p>Total Responses: {totalResponses}</p>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Full Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((response) => (
                <tr key={response.id}>
                  <td className="border p-2">
                    {new Date(response.createdAt).toLocaleString()}
                  </td>
                  <td className="border p-2">
                    {response.data.fullName || "N/A"}
                  </td>
                  <td className="border p-2">{response.data.email || "N/A"}</td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        alert(JSON.stringify(response.data, null, 2))
                      }
                      className="rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-3 py-1 ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Page;
