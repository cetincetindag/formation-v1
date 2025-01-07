"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card } from "~/components/ui/card";
import { Loader2 } from "lucide-react"; // Add this import for loading spinner

interface FormResponse {
  id: string;
  data: {
    name?: string;
    email?: string;
    company?: string;
  };
  createdAt: string;
  respondentName: string;
  respondentEmail: string;
  respondentCompany: string;
  submittedAt: string;
}

interface ResponseData {
  responses: FormResponse[];
  currentPage: number;
  totalPages: number;
  totalResponses: number;
}

type ExportFormat = "csv" | "xml";

export default function DashboardPage({
  params,
}: {
  params: { formUrl: string };
}) {
  const router = useRouter();
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [authToken, setAuthToken] = useState(() =>
    localStorage.getItem("formAuthToken"),
  );

  useEffect(() => {
    if (!authToken) {
      router.push(`/manage/dashboard/${params.formUrl}`);
      return;
    }
    fetchResponses();
  }, [page, authToken, params.formUrl, router]);

  const fetchResponses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/forms?form_id=${params.formUrl}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      if (response.status === 403) {
        localStorage.removeItem("formAuthToken");
        router.push(`/manage/dashboard/${params.formUrl}`);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setResponses(
          data.responses.map((response: any) => ({
            id: response.id,
            data: response.data,
            createdAt: response.createdAt,
            respondentName: response.data.name || "N/A",
            respondentEmail: response.data.email || "N/A",
            respondentCompany: response.data.company || "N/A",
            submittedAt: response.createdAt,
          })),
        );
        setTotalPages(data.totalPages);
        setTotalResponses(data.totalResponses);
      } else {
        setError("Failed to fetch responses");
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
      setError("An error occurred while fetching responses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forms/${params.formUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ format: exportFormat }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `form-responses.${exportFormat}`;
        a.click();
        window.URL.revokeObjectURL(url);
        setShowExportDialog(false);
      } else {
        setError("Export failed");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setError("Failed to export data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${params.formUrl}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Form Responses</h1>
          <div className="space-x-4">
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isLoading}>
                  Export Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-black">
                    Export Form Responses
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Select
                    value={exportFormat}
                    onValueChange={(value: ExportFormat) =>
                      setExportFormat(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        className="text-black"
                        placeholder="Select format"
                      />
                    </SelectTrigger>
                    <SelectContent className="text-black">
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleExport} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    "Download"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
            <Button onClick={handleEdit} disabled={isLoading}>
              Edit Form
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-500">
            {error}
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </TableCell>
              </TableRow>
            ) : responses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No responses found
                </TableCell>
              </TableRow>
            ) : (
              responses.map((response) => (
                <TableRow key={response.id}>
                  <TableCell>{response.respondentName}</TableCell>
                  <TableCell>{response.respondentEmail}</TableCell>
                  <TableCell>{response.respondentCompany}</TableCell>
                  <TableCell>
                    {new Date(response.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/view/${response.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Total Responses: {totalResponses}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <span className="mx-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
