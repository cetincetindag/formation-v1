"use client";
import React, { useEffect, useState, use } from "react";
import { FormStructure, FormComponentType, ContactCollectionSettings, CustomField } from "~/types/formtypes";
import { FormRenderer } from "~/utils/formrenderer";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
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
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    company: "",
    customData: {} as Record<string, string>,
  });
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formElement = e.target as HTMLFormElement;
    const formDataInstance = new FormData(formElement);
    
    // Check if contact collection is required
    const contactCollection = formData.contactCollection;
    const needsContactInfo = contactCollection && (
      contactCollection.collectName || 
      contactCollection.collectEmail || 
      contactCollection.collectCompany ||
      contactCollection.customFields.length > 0
    );
    
    if (needsContactInfo) {
      // Show contact modal first
      setPendingFormData(formDataInstance);
      setShowContactModal(true);
      return;
    }
    
    // No contact info needed, submit directly
    await submitForm(formDataInstance, null);
  };
  
  const submitForm = async (formDataInstance: FormData, contactInfo: any = null) => {
    setIsSubmitting(true);
    setSubmitStatus("Submitting...");
    
    const responseData: { [key: string]: string | string[] } = {};
    
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
          contactData: contactInfo,
        }),
      });
      
      if (response.ok) {
        setSubmitStatus("Response submitted successfully!");
        const formElement = document.querySelector('form') as HTMLFormElement;
        if (formElement) formElement.reset();
        setContactData({
          name: "",
          email: "",
          company: "",
          customData: {},
        });
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
      setShowContactModal(false);
      setPendingFormData(null);
    }
  };
  
  const handleContactSubmit = async () => {
    if (!pendingFormData) return;
    
    const contactCollection = formData.contactCollection;
    
    // Validate required fields
    if (contactCollection?.collectName && !contactData.name.trim()) {
      setSubmitStatus("Name is required");
      return;
    }
    
    if (contactCollection?.collectEmail && !contactData.email.trim()) {
      setSubmitStatus("Email is required");
      return;
    }
    
    // Validate custom required fields
    for (const field of contactCollection?.customFields || []) {
      if (field.required && !contactData.customData[field.name]?.trim()) {
        setSubmitStatus(`${field.label} is required`);
        return;
      }
    }
    
    const contactInfo = {
      name: contactCollection?.collectName ? contactData.name : null,
      email: contactCollection?.collectEmail ? contactData.email : null,
      company: contactCollection?.collectCompany ? contactData.company : null,
      customData: contactData.customData,
    };
    
    await submitForm(pendingFormData, contactInfo);
  };
  
  const updateCustomFieldData = (fieldName: string, value: string) => {
    setContactData(prev => ({
      ...prev,
      customData: {
        ...prev.customData,
        [fieldName]: value,
      },
    }));
  };
  
  return (
    <>
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contact Information</DialogTitle>
            <DialogDescription>
              Please provide your contact information before submitting the form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {formData.contactCollection?.collectName && (
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  type="text"
                  value={contactData.name}
                  onChange={(e) => setContactData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}
            
            {formData.contactCollection?.collectEmail && (
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}
            
            {formData.contactCollection?.collectCompany && (
              <div className="space-y-2">
                <Label htmlFor="contact-company">Company</Label>
                <Input
                  id="contact-company"
                  type="text"
                  value={contactData.company}
                  onChange={(e) => setContactData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Enter your company"
                />
              </div>
            )}
            
            {formData.contactCollection?.customFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={`custom-${field.name}`}>
                  {field.label} {field.required && '*'}
                </Label>
                <Input
                  id={`custom-${field.name}`}
                  type="text"
                  value={contactData.customData[field.name] || ''}
                  onChange={(e) => updateCustomFieldData(field.name, e.target.value)}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required={field.required}
                />
              </div>
            ))}
          </div>
          
          {submitStatus && submitStatus.includes("required") && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{submitStatus}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowContactModal(false);
                setPendingFormData(null);
                setSubmitStatus(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleContactSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-6">
      <FormRenderer formData={formData} />
      <motion.div 
        className="flex flex-col items-center space-y-4 pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full max-w-md shadow-md"
        >
          {isSubmitting ? "Submitting..." : "Submit Response"}
        </Button>
        {submitStatus && (
          <Alert
            variant={submitStatus.includes("Error") ? "destructive" : "default"}
            className="w-full max-w-md shadow-md"
          >
            {!submitStatus.includes("Error") && (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{submitStatus}</AlertDescription>
          </Alert>
        )}
      </motion.div>
    </form>
    </>
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
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const headerVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="from-background to-secondary flex min-h-screen flex-col bg-gradient-to-b">
      <motion.header
        className="container mx-auto px-4 py-6"
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <h1 className="text-primary cursor-effect font-serif text-3xl font-extralight">
              formation
            </h1>
          </Link>
        </div>
      </motion.header>

      <main className="container mx-auto flex flex-grow flex-col items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading && (
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center py-12"
            >
              <div className="text-muted-foreground text-lg">Loading form...</div>
            </motion.div>
          )}
          
          {error && (
            <motion.div variants={itemVariants}>
              <Alert variant="destructive" className="shadow-md">
                <AlertDescription>{`Error loading form: ${error}`}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          
          {!loading && !error && formData && (
            <motion.div variants={itemVariants}>
              <FormDisplay formData={formData} formId={formId} />
            </motion.div>
          )}
          
          {!loading && !error && !formData && (
            <motion.div variants={itemVariants}>
              <Alert variant="destructive" className="shadow-md">
                <AlertDescription>
                  Form not found or invalid data structure.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </motion.div>
      </main>

      <footer className="bg-muted py-8">
        <div className="text-muted-foreground container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} Formation. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .cursor-effect::after {
          content: "|";
          display: inline-block;
          margin-left: 1px;
          font-weight: 400;
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
};
export default Page;
