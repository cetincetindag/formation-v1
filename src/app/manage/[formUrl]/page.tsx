"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  LayoutDashboard,
  Loader2,
  Download,
  Edit,
  Eye,
  Search,
  RefreshCw,
  Link as LinkIcon,
  Copy,
  BarChart3,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { toast } from "sonner";
import FormAuth from "../[formUrl]/auth";
interface FormResponse {
  id: string;
  data: {
    name?: string;
    email?: string;
    company?: string;
    [key: string]: any;
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
type ExportFormat = "csv" | "xml" | "json";
type FormUrlParams = { formUrl: string };
export default function ManageFormPage({
  params,
}: {
  params: Promise<FormUrlParams>;
}) {
  const router = useRouter();
  const formUrl = React.use(params).formUrl;
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResponses, setTotalResponses] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formInfo, setFormInfo] = useState({
    title: "",
    description: "",
    createdAt: "",
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("formAuthToken");
    setAuthToken(token);
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchResponses();
      fetchFormInfo();
    }
  }, [page, authToken, formUrl]);

  useEffect(() => {
    if (searchTerm && authToken) {
      searchResponses();
    } else if (authToken) {
      fetchResponses();
    }
  }, [searchTerm]);
  const fetchFormInfo = async () => {
    try {
      const response = await fetch(`/api/forms/${formUrl}/info`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFormInfo({
          title: data.title || "Untitled Form",
          description: data.description || "",
          createdAt: data.createdAt || "",
        });
      }
    } catch (error) {
      console.error("Error fetching form info:", error);
    }
  };
  const fetchResponses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/forms?form_id=${formUrl}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
      if (response.status === 403) {
        localStorage.removeItem("formAuthToken");
        router.push(`/manage/${formUrl}`);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        if (data?.responses) {
          setResponses(
            data.responses.map((response: any) => ({
              id: response.id,
              data: response.data || {},
              createdAt: response.createdAt,
              respondentName: response.data?.name || "N/A",
              respondentEmail: response.data?.email || "N/A",
              respondentCompany: response.data?.company || "N/A",
              submittedAt: response.createdAt,
            })),
          );
          setTotalPages(data.totalPages || 1);
          setTotalResponses(data.totalResponses || 0);
        } else {
          setResponses([]);
          setTotalPages(1);
          setTotalResponses(0);
          console.warn("No responses data found in API response");
        }
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
  const searchResponses = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/forms?form_id=${formUrl}&search=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
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
        setError("Failed to search responses");
      }
    } catch (error) {
      console.error("Error searching responses:", error);
      setError("An error occurred while searching responses");
    } finally {
      setIsLoading(false);
    }
  };
  const handleExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/forms/${formUrl}/export`, {
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
        toast.success("Export completed successfully");
      } else {
        setError("Export failed");
        toast.error("Failed to export data");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setError("Failed to export data");
      toast.error("Failed to export data");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = () => {
    if (formUrl !== "edit") {
      window.location.href = `/manage/edit/${formUrl}`;
    }
  };
  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchResponses();
    setIsRefreshing(false);
    toast.success("Data refreshed");
  };
  const copyFormLink = () => {
    const formLink = `${window.location.origin}/view/${formUrl}`;
    navigator.clipboard
      .writeText(formLink)
      .then(() => {
        toast.success("Form link copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy form link:", err);
        toast.error("Failed to copy form link");
      });
  };

  if (!authToken) {
    return <FormAuth formUrl={formUrl} />;
  }
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">
                {formInfo.title}
              </CardTitle>
              {formInfo.description && (
                <CardDescription className="mt-1">
                  {formInfo.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyFormLink}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy Link</span>
              </Button>
              <Dialog
                open={showExportDialog}
                onOpenChange={setShowExportDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Form Responses</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Select
                      value={exportFormat}
                      onValueChange={(value: ExportFormat) =>
                        setExportFormat(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
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
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-muted-foreground h-5 w-5" />
              <span className="text-muted-foreground text-sm">
                Total Responses: <strong>{totalResponses}</strong>
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
              <Input
                placeholder="Search responses..."
                className="pl-8 text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-500">
              {error}
            </div>
          )}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-900">Name</TableHead>
                  <TableHead className="text-slate-900">Email</TableHead>
                  <TableHead className="text-slate-900">Company</TableHead>
                  <TableHead className="text-slate-900">Date</TableHead>
                  <TableHead className="text-right text-slate-900">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-slate-900"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : responses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-slate-500"
                    >
                      {searchTerm ? (
                        <div className="flex flex-col items-center">
                          <p>No matching responses found</p>
                          <Button
                            variant="link"
                            onClick={() => setSearchTerm("")}
                            className="mt-1"
                          >
                            Clear search
                          </Button>
                        </div>
                      ) : (
                        <p>No responses found</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="text-slate-900">
                        {response.respondentName}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {response.respondentEmail}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {response.respondentCompany}
                      </TableCell>
                      <TableCell className="text-slate-900">
                        {new Date(response.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/view/${response.id}`)}
                          className="flex items-center gap-1 text-black"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              {totalResponses > 0 && (
                <span>
                  Showing {(page - 1) * 10 + 1}-
                  {Math.min(page * 10, totalResponses)} of {totalResponses}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-black"
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber =
                    page > 3 && totalPages > 5
                      ? page -
                        3 +
                        i +
                        (totalPages - page < 2 ? totalPages - page - 2 : 0)
                      : i + 1;
                  if (pageNumber <= totalPages) {
                    return (
                      <Button
                        key={i}
                        variant={pageNumber === page ? "default" : "outline"}
                        size="icon"
                        className={`h-8 w-8 ${pageNumber !== page ? "text-black" : ""}`}
                        onClick={() => setPage(pageNumber)}
                        disabled={isLoading}
                      >
                        {pageNumber}
                      </Button>
                    );
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="text-black"
                disabled={page === totalPages || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
