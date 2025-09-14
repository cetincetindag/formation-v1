"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Calendar, User, Mail, Building } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

interface ResponseData {
  id: string;
  data: Record<string, any>;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
  customData?: Record<string, any>;
  createdAt: string;
  formId: string;
  form?: {
    data: {
      title: string;
      description?: string;
    };
    collectName: boolean;
    collectEmail: boolean;
    collectCompany: boolean;
    customFields: Array<{
      name: string;
      label: string;
      required: boolean;
    }>;
  };
}

type ResponsePageParams = { responseId: string };

export default function ResponseDetailPage({
  params,
}: {
  params: Promise<ResponsePageParams>;
}) {
  const router = useRouter();
  const responseId = React.use(params).responseId;
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("formAuthToken");
    setAuthToken(token);
  }, []);

  useEffect(() => {
    if (authToken && responseId) {
      fetchResponse();
    }
  }, [authToken, responseId]);

  const fetchResponse = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/responses/${responseId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.status === 403) {
        localStorage.removeItem("formAuthToken");
        router.push('/');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setResponse(data);
      } else {
        setError("Failed to fetch response details");
      }
    } catch (error) {
      console.error("Error fetching response:", error);
      setError("An error occurred while fetching response details");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (response?.formId) {
      router.push(`/manage/${response.formId}`);
    } else {
      router.back();
    }
  };

  if (!authToken) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Authentication required. Please go back to the form management page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-2">Loading response details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !response) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error || "Response not found"}</p>
              <Button onClick={goBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Button onClick={goBack} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Form Management
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">Response Details</CardTitle>
              <CardDescription className="mt-1">
                {response.form?.data.title || "Form Response"}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(response.createdAt).toLocaleDateString()}
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Contact Information */}
          {(response.contactName || response.contactEmail || response.contactCompany) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {response.contactName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{response.contactName}</p>
                    </div>
                  </div>
                )}
                {response.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{response.contactEmail}</p>
                    </div>
                  </div>
                )}
                {response.contactCompany && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{response.contactCompany}</p>
                    </div>
                  </div>
                )}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          {/* Custom Fields */}
          {response.customData && Object.keys(response.customData).length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(response.customData).map(([key, value]) => {
                  const fieldConfig = response.form?.customFields.find(f => f.name === key);
                  const label = fieldConfig?.label || key;
                  
                  return (
                    <div key={key} className="border rounded-lg p-3">
                      <p className="text-sm text-muted-foreground font-medium">{label}</p>
                      <p className="mt-1">{value || "No data"}</p>
                    </div>
                  );
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          )}

          {/* Form Data */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Form Responses</h3>
            <div className="space-y-4">
              {Object.entries(response.data).map(([key, value]) => (
                <div key={key} className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground font-medium mb-2">{key}</p>
                  <div className="text-sm">
                    {Array.isArray(value) ? (
                      <div className="flex flex-wrap gap-1">
                        {value.map((item, index) => (
                          <Badge key={index} variant="outline">
                            {String(item)}
                          </Badge>
                        ))}
                      </div>
                    ) : typeof value === 'object' && value !== null ? (
                      <pre className="whitespace-pre-wrap font-mono text-xs bg-muted p-2 rounded">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <p className="whitespace-pre-wrap">{String(value)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}