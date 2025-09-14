"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  FormStructure,
  FormComponent,
  FormComponentType,
  ContactCollectionSettings,
  CustomField,
} from "~/types/formtypes";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
  Trash2,
  Settings,
  Plus,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Check,
  CircleDot,
  Sliders,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Separator } from "~/components/ui/separator";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { toast } from "sonner";
import FormAuth from "../[formUrl]/auth";

const defaultFormComponent: FormComponent = {
  index: 0,
  title: "",
  description: "",
  type: FormComponentType.ShortText,
  options: [],
  required: false,
};

const typesWithOptions = [
  FormComponentType.ComboBox,
  FormComponentType.MultiSelect,
  FormComponentType.MultiChoice,
  FormComponentType.RadioGroup,
];

interface FormResponse {
  id: string;
  data: {
    [key: string]: any;
  };
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
  customData?: Record<string, any>;
  createdAt: string;
  submittedAt: string;
}

interface FormSettings {
  collectName: boolean;
  collectEmail: boolean;
  collectCompany: boolean;
  customFields: Array<{
    name: string;
    label: string;
    required: boolean;
  }>;
}
interface ResponseData {
  responses: FormResponse[];
  currentPage: number;
  totalPages: number;
  totalResponses: number;
  formSettings?: FormSettings;
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
  const [formSettings, setFormSettings] = useState<FormSettings | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Form editing state
  const [editFormStructure, setEditFormStructure] = useState<FormStructure | null>(null);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [focusTarget, setFocusTarget] = useState<{
    componentIndex: number;
    optionIndex: number;
  } | null>(null);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without triggering a reload
    if (value === "edit") {
      window.history.replaceState({}, '', `/manage/edit/${formUrl}`);
    } else {
      window.history.replaceState({}, '', `/manage/${formUrl}`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("formAuthToken");
    setAuthToken(token);
  }, []);

  useEffect(() => {
    // Check if we're coming from edit URL or have edit tab parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.pathname.includes('/edit/') || urlParams.get('tab') === 'edit') {
      setActiveTab("edit");
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      fetchResponses();
      fetchFormInfo();
      if (activeTab === "edit") {
        // Clear any cached form structure and fetch fresh data
        setEditFormStructure(null);
        fetchFormForEditing();
      }
    }
  }, [page, authToken, formUrl, activeTab]);

  useEffect(() => {
    if (searchTerm && authToken) {
      searchResponses();
    } else if (authToken) {
      fetchResponses();
    }
  }, [searchTerm]);
  
  const fetchFormForEditing = async () => {
    setIsFormLoading(true);
    try {
      const response = await fetch(`/api/forms/${formUrl}/info`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEditFormStructure({
          title: data.title || "",
          description: data.description || "",
          link: data.link || "",
          link_description: data.link_description || "",
          form_content: data.form_content || [{ ...defaultFormComponent }],
          contactCollection: data.contactCollection || {
            collectName: true,
            collectEmail: true,
            collectCompany: false,
            customFields: [],
          },
        });
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch form for editing:", response.status, errorText);
        toast.error("Failed to load form for editing");
      }
    } catch (error) {
      console.error("Error fetching form for editing:", error);
      toast.error("Failed to load form for editing");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleComponentChange = (
    index: number,
    field: keyof FormComponent,
    value: any,
  ) => {
    if (!editFormStructure) return;
    setEditFormStructure((prev) => ({
      ...prev!,
      form_content: prev!.form_content.map((component, i) =>
        i === index ? { ...component, [field]: value } : component,
      ),
    }));
  };

  const addFormComponent = () => {
    if (!editFormStructure) return;
    setEditFormStructure((prev) => ({
      ...prev!,
      form_content: [
        ...prev!.form_content,
        { ...defaultFormComponent, index: prev!.form_content.length },
      ],
    }));
  };

  const deleteFormComponent = (index: number) => {
    if (!editFormStructure) return;
    setEditFormStructure((prev) => ({
      ...prev!,
      form_content: prev!.form_content.filter((_, i) => i !== index),
    }));
  };

  const addOption = (index: number) => {
    if (!editFormStructure) return;
    setEditFormStructure((prev) => ({
      ...prev!,
      form_content: prev!.form_content.map((component, i) =>
        i === index
          ? { ...component, options: [...(component.options || []), ""] }
          : component,
      ),
    }));
  };

  const handleOptionChange = (
    componentIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    if (!editFormStructure) return;
    setEditFormStructure((prev) => ({
      ...prev!,
      form_content: prev!.form_content.map((component, i) =>
        i === componentIndex
          ? {
              ...component,
              options:
                component.options?.map((option, j) =>
                  j === optionIndex ? value : option,
                ) || [],
            }
          : component,
      ),
    }));
  };

  const deleteOption = (componentIndex: number, optionIndex: number) => {
    if (!editFormStructure) return;
    setEditFormStructure((prev) => ({
      ...prev!,
      form_content: prev!.form_content.map((component, i) =>
        i === componentIndex
          ? {
              ...component,
              options:
                component.options?.filter((_, j) => j !== optionIndex) || [],
            }
          : component,
      ),
    }));
  };

  const updateContactCollection = (field: keyof ContactCollectionSettings, value: any) => {
    if (!editFormStructure) return;
    setEditFormStructure((prev) => ({
      ...prev!,
      contactCollection: {
        ...prev!.contactCollection!,
        [field]: value,
      },
    }));
  };

  const addCustomField = () => {
    if (!editFormStructure) return;
    const newField: CustomField = {
      name: `custom_field_${editFormStructure.contactCollection!.customFields.length + 1}`,
      label: "",
      required: false,
    };
    updateContactCollection("customFields", [
      ...editFormStructure.contactCollection!.customFields,
      newField,
    ]);
  };

  const updateCustomField = (index: number, field: keyof CustomField, value: any) => {
    if (!editFormStructure) return;
    const updatedFields = editFormStructure.contactCollection!.customFields.map((customField, i) =>
      i === index ? { ...customField, [field]: value } : customField
    );
    updateContactCollection("customFields", updatedFields);
  };

  const deleteCustomField = (index: number) => {
    if (!editFormStructure) return;
    const updatedFields = editFormStructure.contactCollection!.customFields.filter((_, i) => i !== index);
    updateContactCollection("customFields", updatedFields);
  };

  const handleSaveForm = async () => {
    if (!editFormStructure || !authToken) return;
    
    setIsFormLoading(true);
    try {
      const response = await fetch(`/api/forms/${formUrl}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          data: editFormStructure,
        }),
      });

      if (response.ok) {
        toast.success("Form saved successfully!");
        // Refresh form info to reflect changes
        await fetchFormInfo();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save form");
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    } finally {
      setIsFormLoading(false);
    }
  };
  
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
              contactName: response.contactName,
              contactEmail: response.contactEmail,
              contactCompany: response.contactCompany,
              customData: response.customData || {},
              createdAt: response.createdAt,
              submittedAt: response.createdAt,
            })),
          );
          setTotalPages(data.totalPages || 1);
          setTotalResponses(data.totalResponses || 0);
          
          // Update form settings if available
          if (data.formSettings) {
            setFormSettings(data.formSettings);
          }
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
            contactName: response.contactName,
            contactEmail: response.contactEmail,
            contactCompany: response.contactCompany,
            customData: response.customData || {},
            createdAt: response.createdAt,
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

  const handleDeleteClick = (responseId: string) => {
    setResponseToDelete(responseId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!responseToDelete) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/responses/${responseToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        toast.success("Response deleted successfully");
        setShowDeleteDialog(false);
        setResponseToDelete(null);
        await fetchResponses();
      } else {
        toast.error("Failed to delete response");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete response");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authToken) {
    return <FormAuth formUrl={formUrl} />;
  }
  return (
    <>
    <div className="container mx-auto max-w-7xl px-4 py-8">
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
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Form
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-4">
              <div className="flex flex-wrap gap-2 mb-4">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/view/${formUrl}`)}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Preview</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex items-center gap-1"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
            
            <Separator />
            
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
          <div className="rounded-md border overflow-x-auto">
            <Table className="w-full min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left text-slate-900 min-w-[80px]">
                    Actions
                  </TableHead>
                  {formSettings?.collectName && (
                    <TableHead className="text-slate-900 min-w-[120px]">Name</TableHead>
                  )}
                  {formSettings?.collectEmail && (
                    <TableHead className="text-slate-900 min-w-[200px]">Email</TableHead>
                  )}
                  {formSettings?.collectCompany && (
                    <TableHead className="text-slate-900 min-w-[150px]">Company</TableHead>
                  )}
                  {formSettings?.customFields?.map((field) => (
                    <TableHead key={field.name} className="text-slate-900 min-w-[140px]">
                      {field.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-slate-900 min-w-[100px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        1 + // Actions column
                        (formSettings?.collectName ? 1 : 0) +
                        (formSettings?.collectEmail ? 1 : 0) +
                        (formSettings?.collectCompany ? 1 : 0) +
                        (formSettings?.customFields?.length || 0) +
                        1 // Date column
                      }
                      className="h-24 text-center text-slate-900"
                    >
                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : responses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        1 + // Actions column
                        (formSettings?.collectName ? 1 : 0) +
                        (formSettings?.collectEmail ? 1 : 0) +
                        (formSettings?.collectCompany ? 1 : 0) +
                        (formSettings?.customFields?.length || 0) +
                        1 // Date column
                      }
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
                      <TableCell className="text-left px-3 py-4">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/response/${response.id}`)}
                            className="flex items-center gap-1 text-black justify-start"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(response.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                      {formSettings?.collectName && (
                        <TableCell className="text-slate-900 px-3 py-4">
                          <div className="font-medium">{response.contactName || "N/A"}</div>
                        </TableCell>
                      )}
                      {formSettings?.collectEmail && (
                        <TableCell className="text-slate-900 px-3 py-4">
                          <div className="break-all">{response.contactEmail || "N/A"}</div>
                        </TableCell>
                      )}
                      {formSettings?.collectCompany && (
                        <TableCell className="text-slate-900 px-3 py-4">
                          <div className="truncate" title={response.contactCompany || "N/A"}>
                            {response.contactCompany || "N/A"}
                          </div>
                        </TableCell>
                      )}
                      {formSettings?.customFields?.map((field) => (
                        <TableCell key={field.name} className="text-slate-900 px-3 py-4">
                          <div className="truncate" title={response.customData?.[field.name] || "N/A"}>
                            {response.customData?.[field.name] || "N/A"}
                          </div>
                        </TableCell>
                      ))}
                      <TableCell className="text-slate-900 px-3 py-4">
                        <div className="whitespace-nowrap">
                          {new Date(response.submittedAt).toLocaleDateString()}
                        </div>
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
            </TabsContent>
              
              <TabsContent value="edit" className="mt-4">
                {isFormLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading form for editing...</span>
                  </div>
                ) : editFormStructure ? (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
                    {/* Form Settings Panel */}
                    <Card className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Form Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <div>
                          <Label htmlFor="form-title">Form Title</Label>
                          <Input
                            id="form-title"
                            value={editFormStructure.title}
                            onChange={(e) =>
                              setEditFormStructure((prev) => ({
                                ...prev!,
                                title: e.target.value,
                              }))
                            }
                            placeholder="Enter form title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="form-description">Form Description</Label>
                          <Textarea
                            id="form-description"
                            value={editFormStructure.description ?? ""}
                            onChange={(e) =>
                              setEditFormStructure((prev) => ({
                                ...prev!,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Enter form description"
                          />
                        </div>
                        <Separator className="my-2" />
                        <div>
                          <Label htmlFor="form-link">Related Link (optional)</Label>
                          <Input
                            id="form-link"
                            type="url"
                            value={editFormStructure.link?.toString() ?? ""}
                            onChange={(e) =>
                              setEditFormStructure((prev) => ({
                                ...prev!,
                                link: e.target.value,
                              }))
                            }
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="link-description">Link Description (optional)</Label>
                          <Input
                            id="link-description"
                            value={editFormStructure.link_description?.toString() ?? ""}
                            onChange={(e) =>
                              setEditFormStructure((prev) => ({
                                ...prev!,
                                link_description: e.target.value,
                              }))
                            }
                            placeholder="Enter link description"
                          />
                        </div>
                        <div className="pt-4">
                          <Button className="w-full" onClick={handleSaveForm} disabled={isFormLoading}>
                            {isFormLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Form Questions Panel */}
                    <Card className="flex flex-col">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Form Questions</CardTitle>
                        <Button
                          type="button"
                          onClick={addFormComponent}
                          size="sm"
                          className="ml-auto"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                      </CardHeader>
                      <CardContent className="flex-grow space-y-4">
                        <ScrollArea className="h-[calc(100vh-250px)] rounded-md border p-4">
                          {editFormStructure.form_content.map((component, index) => (
                            <Card key={index} className="mb-4">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                      if (index > 0) {
                                        setEditFormStructure((prev) => {
                                          const newContent = [...prev!.form_content];
                                          const temp = newContent[index]!;
                                          newContent[index] = newContent[index - 1]!;
                                          newContent[index - 1] = temp;
                                          return { ...prev!, form_content: newContent };
                                        });
                                      }
                                    }}
                                    disabled={index === 0}
                                  >
                                    <ArrowUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => {
                                      if (index < editFormStructure.form_content.length - 1) {
                                        setEditFormStructure((prev) => {
                                          const newContent = [...prev!.form_content];
                                          const temp = newContent[index]!;
                                          newContent[index] = newContent[index + 1]!;
                                          newContent[index + 1] = temp;
                                          return { ...prev!, form_content: newContent };
                                        });
                                      }
                                    }}
                                    disabled={index === editFormStructure.form_content.length - 1}
                                  >
                                    <ArrowDown className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteFormComponent(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                <Input
                                  value={component.title}
                                  onChange={(e) =>
                                    handleComponentChange(index, "title", e.target.value)
                                  }
                                  placeholder="Question Title"
                                  required
                                />
                                <Textarea
                                  value={component.description ?? ""}
                                  onChange={(e) =>
                                    handleComponentChange(index, "description", e.target.value)
                                  }
                                  placeholder="Question Description"
                                />
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`required-${index}`}
                                    checked={component.required ?? false}
                                    onCheckedChange={(checked) =>
                                      handleComponentChange(index, "required", checked)
                                    }
                                  />
                                  <Label htmlFor={`required-${index}`}>Required field</Label>
                                </div>
                                <div className="my-2">
                                  <Select
                                    value={component.type}
                                    onValueChange={(value) =>
                                      handleComponentChange(index, "type", value as FormComponentType)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select question type">
                                        <div className="flex items-center gap-2">
                                          {component.type === FormComponentType.ShortText && (
                                            <Type className="h-4 w-4" />
                                          )}
                                          {component.type === FormComponentType.LongText && (
                                            <AlignLeft className="h-4 w-4" />
                                          )}
                                          {component.type === FormComponentType.ComboBox && (
                                            <List className="h-4 w-4" />
                                          )}
                                          {component.type === FormComponentType.MultiSelect && (
                                            <CheckSquare className="h-4 w-4" />
                                          )}
                                          {component.type === FormComponentType.MultiChoice && (
                                            <Check className="h-4 w-4" />
                                          )}
                                          {component.type === FormComponentType.RadioGroup && (
                                            <CircleDot className="h-4 w-4" />
                                          )}
                                          {component.type === FormComponentType.Slider && (
                                            <Sliders className="h-4 w-4" />
                                          )}
                                          {component.type}
                                        </div>
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.values(FormComponentType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                          <div className="flex items-center gap-2">
                                            {type === FormComponentType.ShortText && (
                                              <Type className="h-4 w-4" />
                                            )}
                                            {type === FormComponentType.LongText && (
                                              <AlignLeft className="h-4 w-4" />
                                            )}
                                            {type === FormComponentType.ComboBox && (
                                              <List className="h-4 w-4" />
                                            )}
                                            {type === FormComponentType.MultiSelect && (
                                              <CheckSquare className="h-4 w-4" />
                                            )}
                                            {type === FormComponentType.MultiChoice && (
                                              <Check className="h-4 w-4" />
                                            )}
                                            {type === FormComponentType.RadioGroup && (
                                              <CircleDot className="h-4 w-4" />
                                            )}
                                            {type === FormComponentType.Slider && (
                                              <Sliders className="h-4 w-4" />
                                            )}
                                            {type}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="min-h-[60px]">
                                  {typesWithOptions.includes(component.type) && (
                                    <div className="space-y-2">
                                      {component.options?.map((option, optionIndex) => (
                                        <div
                                          key={optionIndex}
                                          className="flex items-center gap-2"
                                        >
                                          <Input
                                            value={option}
                                            onChange={(e) =>
                                              handleOptionChange(index, optionIndex, e.target.value)
                                            }
                                            placeholder={`Option ${optionIndex + 1}`}
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteOption(index, optionIndex)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <Button
                                        type="button"
                                        onClick={() => addOption(index)}
                                        variant="outline"
                                        size="sm"
                                      >
                                        <Plus className="mr-2 h-4 w-4" /> Add Option
                                      </Button>
                                    </div>
                                  )}
                                  {component.type === FormComponentType.Slider && (
                                    <div className="space-y-4 pt-2">
                                      <div className="grid grid-cols-3 gap-4">
                                        <div>
                                          <Label htmlFor={`slider-min-${index}`}>Min Value</Label>
                                          <Input
                                            id={`slider-min-${index}`}
                                            type="number"
                                            value={component.min ?? 0}
                                            onChange={(e) => {
                                              const parsedValue = parseInt(e.target.value);
                                              handleComponentChange(
                                                index,
                                                "min",
                                                isNaN(parsedValue) ? 0 : parsedValue,
                                              );
                                            }}
                                            placeholder="Min"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`slider-max-${index}`}>Max Value</Label>
                                          <Input
                                            id={`slider-max-${index}`}
                                            type="number"
                                            value={component.max ?? 100}
                                            onChange={(e) => {
                                              const parsedValue = parseInt(e.target.value);
                                              handleComponentChange(
                                                index,
                                                "max",
                                                isNaN(parsedValue) ? 100 : parsedValue,
                                              );
                                            }}
                                            placeholder="Max"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor={`slider-default-${index}`}>Default</Label>
                                          <Input
                                            id={`slider-default-${index}`}
                                            type="number"
                                            value={
                                              component.default ??
                                              ((component.min ?? 0) + (component.max ?? 100)) / 2
                                            }
                                            onChange={(e) => {
                                              const parsedValue = parseInt(e.target.value);
                                              const fallbackDefault =
                                                ((component.min ?? 0) + (component.max ?? 100)) / 2;
                                              handleComponentChange(
                                                index,
                                                "default",
                                                isNaN(parsedValue) ? fallbackDefault : parsedValue,
                                              );
                                            }}
                                            placeholder="Default"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Contact Collection Panel */}
                    <Card className="flex flex-col">
                      <CardHeader>
                        <CardTitle>Contact Collection</CardTitle>
                        <CardDescription>
                          Collect contact information from form respondents
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="collect-name"
                              checked={editFormStructure.contactCollection?.collectName}
                              onCheckedChange={(checked) => 
                                updateContactCollection("collectName", checked)
                              }
                            />
                            <Label htmlFor="collect-name">Collect Name</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="collect-email"
                              checked={editFormStructure.contactCollection?.collectEmail}
                              onCheckedChange={(checked) => 
                                updateContactCollection("collectEmail", checked)
                              }
                            />
                            <Label htmlFor="collect-email">Collect Email</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="collect-company"
                              checked={editFormStructure.contactCollection?.collectCompany}
                              onCheckedChange={(checked) => 
                                updateContactCollection("collectCompany", checked)
                              }
                            />
                            <Label htmlFor="collect-company">Collect Company</Label>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Custom Fields</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addCustomField}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Field
                            </Button>
                          </div>
                          
                          {editFormStructure.contactCollection?.customFields.map((field, index) => (
                            <Card key={index} className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Input
                                    placeholder="Field Label"
                                    value={field.label}
                                    onChange={(e) => updateCustomField(index, "label", e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteCustomField(index)}
                                    className="ml-2"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`custom-required-${index}`}
                                    checked={field.required}
                                    onCheckedChange={(checked) => 
                                      updateCustomField(index, "required", checked)
                                    }
                                  />
                                  <Label htmlFor={`custom-required-${index}`} className="text-sm">
                                    Required
                                  </Label>
                                </div>
                              </div>
                            </Card>
                          ))}
                          
                          {editFormStructure.contactCollection?.customFields.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No custom fields added yet
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Failed to load form for editing.</p>
                    <Button 
                      variant="outline" 
                      onClick={fetchFormForEditing}
                      className="mt-2"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Response</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this response? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
