"use client";

import React, { useEffect, useState } from "react";
import { FormStructure, FormComponentType } from "~/types/formtypes";
import { FormRenderer } from "~/utils/formrenderer";

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
        typeof component.title === "string" &&
        Object.values(FormComponentType).includes(component.type)
    ) &&
    typeof d.style === "object" &&
    typeof d.style.theme === "string" &&
    typeof d.style.h_font === "string" &&
    typeof d.style.h_txtcolor === "string" &&
    typeof d.style.h_cardcolor === "string" &&
    typeof d.style.q_font === "string" &&
    typeof d.style.q_txtcolor === "string" &&
    typeof d.style.q_cardcolor === "string"
  );
}

interface PageProps {
  params: { form_id: string };
}

const FormPage = ({ formData, formId }: { formData: FormStructure; formId: string }) => {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("Submitting...");

    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    const responseData: { [key: string]: string | string[] } = {};

    console.log("Form Data\n", formData)
    console.log("Response Data\n", responseData)

    formData.forEach((value, key) => {
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
        setSubmitStatus(`Error: ${errorData.message || "Failed to submit response"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("Error: Failed to submit response");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormRenderer formData={formData} />
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Submit Response
      </button>
      {submitStatus && (
        <p className={`mt-2 ${submitStatus.includes("Error") ? "text-red-500" : "text-green-500"}`}>
          {submitStatus}
        </p>
      )}
    </form>
  );
};

const Page = ({ params }: PageProps) => {
  const [formData, setFormData] = useState<FormStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const formId = params.form_id;

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await fetch(`/api/forms?form_id=${formId}`);
        const data = await response.json();

        if (!isValidFormStructure(data.data)) {
          throw new Error("Invalid form data structure");
        }

        setFormData(data.data);
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!formData) {
    return <div>Form not found or invalid data</div>;
  }

  return <FormPage formData={formData} formId={formId} />;
};

export default Page;

