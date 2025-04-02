"use client";
import React, { useEffect, useState, use } from "react";
import { FormStructure, FormComponentType } from "~/types/formtypes";
import { FormRenderer } from "~/utils/formrenderer";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
function isValidFormStructure(data: unknown): data is FormStructure {
  if (typeof data !== "object" || data === null) return false;
  const d = data as any;
  return (
    typeof d.title === "string" &&
    (d.description === null || typeof d.description === "string") &&
    Array.isArray(d.form_content) &&
    d.form_content.every(
      (component: any) =>
        typeof component === "object" &&
        component !== null &&
        typeof component.title === "string" &&
        Object.values(FormComponentType).includes(component.type),
    )
  );
}
interface PageProps {
  params: Promise<{ form_id: string }>;
}
const FormDisplay = ({
  formData,
  formId,
}: {
  formData: FormStructure;
  formId: string;
}) => {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("Submitting...");
    const formElement = e.target as HTMLFormElement;
    const formDataInstance = new FormData(formElement);
    const responseData: { [key: string]: string | string[] } = {};
    console.log("Form Data\n", formDataInstance);
    console.log("Response Data\n", responseData);
    formDataInstance.forEach((value, key) => {
      if (responseData[key]) {
        if (Array.isArray(responseData[key])) {
          (responseData[key] as string[]).push(value.toString());
        } else {
          responseData[key] = [responseData[key] as string, value.toString()];
        }
      } else {
        responseData[key] = value.toString();
      }
    });
    try {
      const response = await fetch("/api/response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          data: responseData,
        }),
      });
      if (response.ok) {
        setSubmitStatus("Response submitted successfully!");
        formElement.reset();
      } else {
        const errorData = await response.json();
        setSubmitStatus(
          `Error: ${errorData.message || "Failed to submit response"}`,
        );
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("Error: Failed to submit response");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <FormRenderer formData={formData} />
      <div className="flex flex-col items-center space-y-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full max-w-md"
        >
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
        {submitStatus && (
          <Alert
            variant={submitStatus.includes("Error") ? "destructive" : "default"}
            className="w-full"
          >
            <AlertDescription>{submitStatus}</AlertDescription>
          </Alert>
        )}
      </div>
    </form>
  );
};
const Page = ({ params: paramsPromise }: PageProps) => {
  const params = use(paramsPromise);
  const [formData, setFormData] = useState<FormStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const formId = params.form_id;
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/forms?form_id=${formId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }
        const formDataFromApi = await response.json();
        if (!isValidFormStructure(formDataFromApi)) {
          console.error("Invalid form structure received:", formDataFromApi);
          throw new Error("Invalid form data structure received from API");
        }
        setFormData(formDataFromApi);
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred",
        );
        setFormData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFormData();
  }, [formId]);
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {loading && <div>Loading form...</div>}
      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>{`Error loading form: ${error}`}</AlertDescription>
        </Alert>
      )}
      {!loading && !error && formData && (
        <FormDisplay formData={formData} formId={formId} />
      )}
      {!loading && !error && !formData && (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>
            Form not found or invalid data structure.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
export default Page;
