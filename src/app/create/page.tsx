"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormStructure, FormComponent, FormComponentType, FormStyle } from '~/types/formtypes'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react'
import { toast } from "~/components/ui/use-toast"

const defaultFormStyle: FormStyle = {
  theme: 'light',
  h_font: 'Arial',
  h_txtcolor: '#000000',
  h_cardcolor: '#ffffff',
  q_font: 'Arial',
  q_txtcolor: '#000000',
  q_cardcolor: '#f0f0f0',
}

const defaultFormComponent: FormComponent = {
  index: 0,
  title: '',
  description: null,
  type: FormComponentType.ShortText,
  options: [],
}

const typesWithOptions = [FormComponentType.ComboBox, FormComponentType.MultiSelect, FormComponentType.MultiChoice, FormComponentType.RadioGroup]

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  link: z.string().url().nullable(),
  link_description: z.string().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function CreateFormPage() {
  const router = useRouter()
  const [formStructure, setFormStructure] = useState<FormStructure>({
    title: '',
    description: null,
    link: null,
    link_description: null,
    form_content: [{ ...defaultFormComponent }],
    style: defaultFormStyle,
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      link: '',
      link_description: '',
      password: '',
    },
  })

  useEffect(() => {
    const savedForm = localStorage.getItem('formInProgress')
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm)
      setFormStructure(parsedForm)
      form.reset({
        title: parsedForm.title,
        description: parsedForm.description,
        link: parsedForm.link,
        link_description: parsedForm.link_description,
      })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('formInProgress', JSON.stringify(formStructure))
  }, [formStructure])

  const handleComponentChange = (index: number, field: keyof FormComponent, value: any) => {
    setFormStructure(prev => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
        i === index ? { ...component, [field]: value } : component
      ),
    }))
  }

  const addFormComponent = () => {
    setFormStructure(prev => ({
      ...prev,
      form_content: [...prev.form_content, { ...defaultFormComponent, index: prev.form_content.length }],
    }))
  }

  const deleteFormComponent = (index: number) => {
    setFormStructure(prev => ({
      ...prev,
      form_content: prev.form_content.filter((_, i) => i !== index),
    }))
  }

  const addOption = (index: number) => {
    setFormStructure(prev => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
        i === index
          ? { ...component, options: [...(component.options || []), ''] }
          : component
      ),
    }))
  }

  const handleOptionChange = (componentIndex: number, optionIndex: number, value: string) => {
    setFormStructure(prev => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
        i === componentIndex
          ? {
            ...component,
            options: component.options?.map((option, j) =>
              j === optionIndex ? value : option
            ) || [],
          }
          : component
      ),
    }))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = {
        data: {
          ...formStructure,
          title: values.title,
          description: values.description,
          link: values.link,
          link_description: values.link_description,
          form_content: formStructure.form_content.map(component => ({
            ...component,
            type: component.type as string,
          })),
        },
        password: values.password
      }

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        console.log(result)
        const { id } = result
        if (id) {
          router.push(`/form-success?id=${id}`)
          toast({
            title: "Success",
            description: "Form created successfully!",
          })
        } else {
          throw new Error('Form ID not returned from server')
        }
      } else {
        throw new Error(result.message || 'Error creating form')
      }
    } catch (error) {
      console.error('Error creating form:', error)
      toast({
        title: "Error",
        description: "Error creating form. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-2/3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Form</CardTitle>
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
                          <Textarea placeholder="Enter form description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="bg-black w-82 h-1"></div>
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Related Link (optional)</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://example.com" {...field} />
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
                          <Input placeholder="Enter link description" {...field} />
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
                            onChange={(e: any) => handleComponentChange(index, 'title', e.target.value)}
                            placeholder="Question Title"
                            required
                          />
                          <Textarea
                            value={component.description || ''}
                            onChange={(e: any) => handleComponentChange(index, 'description', e.target.value)}
                            placeholder="Question Description"
                          />
                          <Select
                            value={component.type}
                            onValueChange={(value: any) => handleComponentChange(index, 'type', value as FormComponentType)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(FormComponentType).map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {typesWithOptions.includes(component.type) && (
                            <div className="space-y-2">
                              {component.options?.map((option, optionIndex) => (
                                <Input
                                  key={optionIndex}
                                  value={option}
                                  onChange={(e: any) => handleOptionChange(index, optionIndex, e.target.value)}
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
                  <Button type="button" onClick={addFormComponent} className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                  </Button>
                </TabsContent>
                <TabsContent value="style" className="space-y-4">
                  {/* Add style customization fields here */}
                  <FormField
                    control={form.control}
                    name="style.theme"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  {/* Add more style fields here */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Form Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter form password" {...field} />
                    </FormControl>
                    <FormDescription>
                      This password will be required to edit the form later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Button type="submit" className="w-full">Create Form</Button>
        </form>
      </Form>
    </div>
  )
}
