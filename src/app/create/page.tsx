"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FormStructure,
  FormComponent,
  FormComponentType,
  ContactCollectionSettings,
  CustomField,
} from "~/types/formtypes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import {
  Plus,
  Trash2,
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
import { toast } from "~/components/ui/use-toast";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
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
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  link: z.string().url("Invalid URL").nullish().or(z.literal("")),
  link_description: z.string().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export default function CreateFormPage() {
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [formStructure, setFormStructure] = useState<FormStructure>({
    title: "",
    description: "",
    link: "",
    link_description: "",
    form_content: [{ ...defaultFormComponent }],
    contactCollection: {
      collectName: true,
      collectEmail: true,
      collectCompany: false,
      customFields: [],
    },
  });
  const [focusTarget, setFocusTarget] = useState<{
    componentIndex: number;
    optionIndex: number;
  } | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      link_description: "",
      password: "",
    },
  });
  useEffect(() => {
    const savedForm = localStorage.getItem("formInProgress");
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm);
      setFormStructure(parsedForm);
      form.reset({
        title: parsedForm.title,
        description: parsedForm.description,
        link: parsedForm.link,
        link_description: parsedForm.link_description,
      });
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("formInProgress", JSON.stringify(formStructure));
  }, [formStructure]);
  useEffect(() => {
    if (focusTarget) {
      const targetId = `option-input-${focusTarget.componentIndex}-${focusTarget.optionIndex}`;
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.focus();
      }
      setFocusTarget(null);
    }
  }, [focusTarget, formStructure.form_content]);
  const handleComponentChange = (
    index: number,
    field: keyof FormComponent,
    value: any,
  ) => {
    setFormStructure((prev) => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
        i === index ? { ...component, [field]: value } : component,
      ),
    }));
  };
  const addFormComponent = () => {
    setFormStructure((prev) => ({
      ...prev,
      form_content: [
        ...prev.form_content,
        { ...defaultFormComponent, index: prev.form_content.length },
      ],
    }));
    setTimeout(() => {
      const viewport = scrollAreaRef.current?.querySelector<HTMLDivElement>(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      } else if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }, 0);
  };
  const deleteFormComponent = (index: number) => {
    setFormStructure((prev) => ({
      ...prev,
      form_content: prev.form_content.filter((_, i) => i !== index),
    }));
  };
  const addOptionAfter = (componentIndex: number, optionIndex: number) => {
    setFormStructure((prev) => {
      const newFormContent = prev.form_content.map((component, i) => {
        if (i === componentIndex) {
          const currentOptions = component.options || [];
          const newOptions = [
            ...currentOptions.slice(0, optionIndex + 1),
            "",
            ...currentOptions.slice(optionIndex + 1),
          ];
          return { ...component, options: newOptions };
        }
        return component;
      });
      return { ...prev, form_content: newFormContent };
    });
  };
  const addOption = (index: number) => {
    setFormStructure((prev) => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
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
    setFormStructure((prev) => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
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
    setFormStructure((prev) => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
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
    setFormStructure((prev) => ({
      ...prev,
      contactCollection: {
        ...prev.contactCollection!,
        [field]: value,
      },
    }));
  };

  const addCustomField = () => {
    const newField: CustomField = {
      name: `custom_field_${formStructure.contactCollection!.customFields.length + 1}`,
      label: "",
      required: false,
    };
    updateContactCollection("customFields", [
      ...formStructure.contactCollection!.customFields,
      newField,
    ]);
  };

  const updateCustomField = (index: number, field: keyof CustomField, value: any) => {
    const updatedFields = formStructure.contactCollection!.customFields.map((customField, i) =>
      i === index ? { ...customField, [field]: value } : customField
    );
    updateContactCollection("customFields", updatedFields);
  };

  const deleteCustomField = (index: number) => {
    const updatedFields = formStructure.contactCollection!.customFields.filter((_, i) => i !== index);
    updateContactCollection("customFields", updatedFields);
  };
  const handleFormKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (
      event.key === "Enter" &&
      (event.target as HTMLElement).tagName !== "TEXTAREA"
    ) {
      event.preventDefault();
    }
  };
  const handleOptionInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    componentIndex: number,
    optionIndex: number,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addOptionAfter(componentIndex, optionIndex);
      setFocusTarget({ componentIndex, optionIndex: optionIndex + 1 });
    }
  };
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = {
        data: {
          ...formStructure,
          title: values.title,
          description: values.description,
          link: values.link,
          link_description: values.link_description,
          form_content: formStructure.form_content.map((component) => ({
            ...component,
            type: component.type as string,
          })),
        },
        password: values.password,
      };
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        const { id, title, createdAt } = result;
        if (id) {
          const recentForm = { id, title, createdAt };
          const recentForms = JSON.parse(
            localStorage.getItem("recentForms") || "[]",
          );

          const filteredForms = recentForms.filter(
            (form: any) => form.id !== id && form.title !== title,
          );

          const updatedForms = [recentForm, ...filteredForms].slice(0, 5);
          localStorage.setItem("recentForms", JSON.stringify(updatedForms));
          router.push(`/form-success?id=${id}`);
          toast({
            title: "Success",
            description: "Form created successfully!",
          });
        } else {
          throw new Error("Form ID not returned from server");
        }
      } else {
        throw new Error(result.message || "Error creating form");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast({
        title: "Error",
        description: "Error creating form. Please try again.",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="mx-auto w-full max-w-7xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={handleFormKeyDown}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 md:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Form Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter form title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Form Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter form description"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator className="my-2" />
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Related Link (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="link_description"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Link Description (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter link description"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator className="my-2" />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Form Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter form password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This password will be required to edit the form later.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <Button type="submit" className="w-full">
                    Create Form
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                <ScrollArea
                  ref={scrollAreaRef}
                  className="h-[calc(100vh-250px)] rounded-md border p-4"
                >
                  {formStructure.form_content.map((component, index) => (
                    <Card key={index} className="mb-4">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => {
                              if (index > 0) {
                                setFormStructure((prev) => {
                                  const newContent = [...prev.form_content];
                                  const temp = newContent[index]!;
                                  newContent[index] = newContent[index - 1]!;
                                  newContent[index - 1] = temp;
                                  return { ...prev, form_content: newContent };
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
                              if (
                                index <
                                formStructure.form_content.length - 1
                              ) {
                                setFormStructure((prev) => {
                                  const newContent = [...prev.form_content];
                                  const temp = newContent[index]!;
                                  newContent[index] = newContent[index + 1]!;
                                  newContent[index + 1] = temp;
                                  return { ...prev, form_content: newContent };
                                });
                              }
                            }}
                            disabled={
                              index === formStructure.form_content.length - 1
                            }
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
                          onChange={(e: any) =>
                            handleComponentChange(
                              index,
                              "title",
                              e.target.value,
                            )
                          }
                          placeholder="Question Title"
                          required
                        />
                        <Textarea
                          value={component.description ?? ""}
                          onChange={(e: any) =>
                            handleComponentChange(
                              index,
                              "description",
                              e.target.value,
                            )
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
                                    id={`option-input-${index}-${optionIndex}`}
                                    value={option}
                                    onChange={(e: any) =>
                                      handleOptionChange(
                                        index,
                                        optionIndex,
                                        e.target.value,
                                      )
                                    }
                                    onKeyDown={(e) =>
                                      handleOptionInputKeyDown(
                                        e,
                                        index,
                                        optionIndex,
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      deleteOption(index, optionIndex)
                                    }
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
                                  <Label htmlFor={`slider-min-${index}`}>
                                    Min Value
                                  </Label>
                                  <Input
                                    id={`slider-min-${index}`}
                                    type="number"
                                    value={component.min ?? 0}
                                    onChange={(e: any) => {
                                      const parsedValue = parseInt(
                                        e.target.value,
                                      );
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
                                  <Label htmlFor={`slider-max-${index}`}>
                                    Max Value
                                  </Label>
                                  <Input
                                    id={`slider-max-${index}`}
                                    type="number"
                                    value={component.max ?? 100}
                                    onChange={(e: any) => {
                                      const parsedValue = parseInt(
                                        e.target.value,
                                      );
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
                                  <Label htmlFor={`slider-default-${index}`}>
                                    Default
                                  </Label>
                                  <Input
                                    id={`slider-default-${index}`}
                                    type="number"
                                    value={
                                      component.default ??
                                      ((component.min ?? 0) +
                                        (component.max ?? 100)) /
                                        2
                                    }
                                    onChange={(e: any) => {
                                      const parsedValue = parseInt(
                                        e.target.value,
                                      );
                                      const fallbackDefault =
                                        ((component.min ?? 0) +
                                          (component.max ?? 100)) /
                                        2;
                                      handleComponentChange(
                                        index,
                                        "default",
                                        isNaN(parsedValue)
                                          ? fallbackDefault
                                          : parsedValue,
                                      );
                                    }}
                                    placeholder="Default"
                                  />
                                </div>
                              </div>
                              <div className="pt-2">
                                <Label>Preview</Label>
                                <div className="flex items-center justify-between pb-1 pt-2">
                                  <span className="text-sm">
                                    {component.min ?? 0}
                                  </span>
                                  <span className="text-sm">
                                    {component.default ??
                                      ((component.min ?? 0) +
                                        (component.max ?? 100)) /
                                        2}
                                  </span>
                                  <span className="text-sm">
                                    {component.max ?? 100}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={component.min ?? 0}
                                  max={component.max ?? 100}
                                  value={
                                    component.default ??
                                    ((component.min ?? 0) +
                                      (component.max ?? 100)) /
                                      2
                                  }
                                  disabled
                                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                                />
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
                      checked={formStructure.contactCollection?.collectName}
                      onCheckedChange={(checked) => 
                        updateContactCollection("collectName", checked)
                      }
                    />
                    <Label htmlFor="collect-name">Collect Name</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="collect-email"
                      checked={formStructure.contactCollection?.collectEmail}
                      onCheckedChange={(checked) => 
                        updateContactCollection("collectEmail", checked)
                      }
                    />
                    <Label htmlFor="collect-email">Collect Email</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="collect-company"
                      checked={formStructure.contactCollection?.collectCompany}
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
                  
                  {formStructure.contactCollection?.customFields.map((field, index) => (
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
                  
                  {formStructure.contactCollection?.customFields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No custom fields added yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
