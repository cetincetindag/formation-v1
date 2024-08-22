"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormStructure, FormComponent, FormComponentType, FormStyle } from '~/types/formtypes';
import { db } from '~/server/db';

const defaultFormStyle: FormStyle = {
  theme: 'light',
  h_font: 'Arial',
  h_txtcolor: '#000000',
  h_cardcolor: '#ffffff',
  q_font: 'Arial',
  q_txtcolor: '#000000',
  q_cardcolor: '#f0f0f0',
};

const defaultFormComponent: FormComponent = {
  index: 0,
  title: '',
  description: null,
  type: FormComponentType.ShortText,
  options: [],
};

export default function CreateFormPage() {
  const router = useRouter();
  const [formStructure, setFormStructure] = useState<FormStructure>({
    title: '',
    description: null,
    link: null,
    link_description: null,
    form_content: [{ ...defaultFormComponent }],
    style: defaultFormStyle,
  });
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedForm = localStorage.getItem('formInProgress');
    if (savedForm) {
      setFormStructure(JSON.parse(savedForm));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('formInProgress', JSON.stringify(formStructure));
  }, [formStructure]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormStructure(prev => ({ ...prev, [name]: value }));
  };

  const handleComponentChange = (index: number, field: keyof FormComponent, value: any) => {
    setFormStructure(prev => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
        i === index ? { ...component, [field]: value } : component
      ),
    }));
  };

  const addFormComponent = () => {
    setFormStructure(prev => ({
      ...prev,
      form_content: [...prev.form_content, { ...defaultFormComponent, index: prev.form_content.length }],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = {
        ...formStructure,
        form_content: formStructure.form_content.map(component => ({
          ...component,
          type: component.type as string,
        })),
      };

      await db.form.create({
        data: {
          password,
          data: formData as any,
        },
      });
      localStorage.removeItem('formInProgress');
      router.push('/forms');
    } catch (error) {
      console.error('Error creating form:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-1/2 space-y-4">
      <input
        type="text"
        name="title"
        value={formStructure.title}
        onChange={handleInputChange}
        placeholder="Form Title"
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        name="description"
        value={formStructure.description || ''}
        onChange={handleInputChange}
        placeholder="Form Description"
        className="w-full p-2 border rounded"
      />
      <input
        type="url"
        name="link"
        value={formStructure.link?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Related Link"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="link_description"
        value={formStructure.link_description?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Link Description"
        className="w-full p-2 border rounded"
      />
      {formStructure.form_content.map((component, index) => (
        <div key={index} className="space-y-2 border p-4 rounded">
          <input
            type="text"
            value={component.title}
            onChange={(e) => handleComponentChange(index, 'title', e.target.value)}
            placeholder="Question Title"
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            value={component.description || ''}
            onChange={(e) => handleComponentChange(index, 'description', e.target.value)}
            placeholder="Question Description"
            className="w-full p-2 border rounded"
          />
          <select
            value={component.type}
            onChange={(e) => handleComponentChange(index, 'type', e.target.value as FormComponentType)}
            className="w-full p-2 border rounded"
          >
            {Object.values(FormComponentType).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {['ComboBox', 'MultiSelect', 'MultiChoice', 'RadioGroup'].includes(component.type) && (
            <textarea
              value={component.options?.join('\n') || ''}
              onChange={(e) => handleComponentChange(index, 'options', e.target.value.split('\n'))}
              placeholder="Options (one per line)"
              className="w-full p-2 border rounded"
            />
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addFormComponent}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add Question
      </button>
      <label
        htmlFor='password'
      >
        Please type a password that will be used to view responses on the web client.
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Form Password"
        required
        className="w-full p-2 border rounded"
      />
      <button
        type="submit"
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Create Form
      </button>
    </form>
  );
}
