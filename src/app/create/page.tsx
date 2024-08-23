"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormStructure, FormComponent, FormComponentType, FormStyle } from '~/types/formtypes';

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

const typesWithOptions = [FormComponentType.ComboBox, FormComponentType.MultiSelect, FormComponentType.MultiChoice, FormComponentType.RadioGroup];

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
  const [message, setMessage] = useState('');

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

  const addOption = (index: number) => {
    setFormStructure(prev => ({
      ...prev,
      form_content: prev.form_content.map((component, i) =>
        i === index
          ? { ...component, options: [...(component.options || []), ''] }
          : component
      ),
    }));
  };

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
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const formData = {
        data: {
          title: formStructure.title,
          description: formStructure.description,
          link: formStructure.link,
          link_description: formStructure.link_description,
          form_content: formStructure.form_content.map(component => ({
            ...component,
            type: component.type as string,
          })),
          style: formStructure.style,
        },
        password: password
      };;

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(JSON.stringify(formData))
        localStorage.removeItem('formInProgress');
        setMessage(result.message);
        setTimeout(() => router.push('/testpage'), 2000);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error creating form:', error);
      setMessage('Error creating form. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-black">
      {message && <div className={`p-2 ${message.includes('Error') ? 'bg-red-100' : 'bg-green-100'}`}>{message}</div>}
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
        placeholder="Related Link (optional)"
        className="w-full p-2 border rounded"
      />
      <input
        type="text"
        name="link_description"
        value={formStructure.link_description?.toString() || ''}
        onChange={handleInputChange}
        placeholder="Link Description (optional)"
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
          {typesWithOptions.includes(component.type) && (
            <div>
              {component.options?.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="w-full p-2 border rounded mt-2"
                />
              ))}
              <button
                type="button"
                onClick={() => addOption(index)}
                className="mt-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Option
              </button>
            </div>
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
