"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FormStructure,
  FormComponent,
  FormComponentType,
  FormStyle,
  defaultFormStyle,
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "~/components/ui/use-toast";

const defaultFormComponent: FormComponent = {
  index: 0,
  title: "",
  description: null,
  type: FormComponentType.ShortText,
  options: [],
};

const typesWithOptions = [
  FormComponentType.ComboBox,
  FormComponentType.MultiSelect,
  FormComponentType.MultiChoice,
  FormComponentType.RadioGroup,
];

const styleSchema = z.object({
  theme: z.string(),
  h_font: z.string().min(1, "Header font is required"),
  h_txtcolor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color code"),
  h_cardcolor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color code"),
  q_font: z.string().min(1, "Question font is required"),
  q_txtcolor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color code"),
  q_cardcolor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color code"),
});

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  link: z.string().url("Invalid URL").nullable(),
  link_description: z.string().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  style: styleSchema,
});

export default function EditFormPage({
  params,
}: {
  params: { formUrl: string };
}) {
  const router = useRouter();
  const [formStructure, setFormStructure] = useState<FormStructure>({
    title: "",
    description: null,
    link: null,
    link_description: null,
    form_content: [{ ...defaultFormComponent }],
    style: defaultFormStyle as FormStyle,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: null,
      link: null,
      link_description: null,
      password: "",
      style: defaultFormStyle as FormStyle,
    },
  });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await fetch(`/api/forms/${params.formUrl}`);
        if (response.ok) {
          const data = await response.json();
          setFormStructure(data);
          form.reset({
            title: data.title,
            description: data.description,
            link: data.link,
            link_description: data.link_description,
            style: data.style as FormStyle,
            password: "",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to load form",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        toast({
          title: "Error",
          description: "Failed to load form",
          variant: "destructive",
        });
      }
    };

    fetchForm();
  }, [params.formUrl]);

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
  };

  const deleteFormComponent = (index: number) => {
    setFormStructure((prev) => ({
      ...prev,
      form_content: prev.form_content.filter((_, i) => i !== index),
    }));
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = {
        data: {
          ...formStructure,
          title: values.title,
          description: values.description,
          link: values.link,
          link_description: values.link_description,
          style: values.style as FormStyle,
          form_content: formStructure.form_content.map((component) => ({
            ...component,
            type: component.type,
          })),
        },
        password: values.password,
      };

      const response = await fetch(`/api/forms/${params.formUrl}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/edit-success");
        toast({
          title: "Success",
          description: "Form updated successfully!",
        });
      } else {
        throw new Error(result.message || "Error updating form");
      }
    } catch (error) {
      console.error("Error updating form:", error);
      toast({
        title: "Error",
        description: "Error updating form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-2/3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Form</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="content">
                <TabsList>
                  <TabsTrigger value="content">Form Content</TabsTrigger>
                  <TabsTrigger value="style">Style Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="content" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
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
                    render={({ field }) => (
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
                  <div className="w-82 h-1 bg-black"></div>
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
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
                    render={({ field }) => (
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
                  <Separator className="my-4" />
                  <ScrollArea className="h-[500px] rounded-md border p-4">
                    {formStructure.form_content.map((component, index) => (
                      <Card key={index} className="mb-4">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Question {index + 1}
                          </CardTitle>
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
                            value={component.description || ""}
                            onChange={(e) =>
                              handleComponentChange(
                                index,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Question Description"
                          />
                          <Select
                            value={component.type}
                            onValueChange={(value) =>
                              handleComponentChange(
                                index,
                                "type",
                                value as FormComponentType,
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(FormComponentType).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {typesWithOptions.includes(component.type) && (
                            <div className="space-y-2">
                              {component.options?.map((option, optionIndex) => (
                                <Input
                                  key={optionIndex}
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      index,
                                      optionIndex,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
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
                        </CardContent>
                      </Card>
                    ))}
                  </ScrollArea>
                  <Button
                    type="button"
                    onClick={addFormComponent}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                  </Button>
                </TabsContent>
                <TabsContent value="style" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="style.theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
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
                      Enter the form password to save changes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </Form>
    </div>
  );
}
