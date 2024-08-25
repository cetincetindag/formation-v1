"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function FormSuccessPage() {
  const [formLink, setFormLink] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const formId = searchParams.get('id');
    if (formId) {
      setFormLink(`${window.location.origin}/view/${formId}`);
    } else {
      router.push('/');
    }
  }, [router, searchParams]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formLink);
      setCopyMessage('Link copied to clipboard');
      setTimeout(() => setCopyMessage(''), 3000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-2/3 min-h-screen bg-black">
      <div className="bg-black p-8 rounded-lg shadow-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Form Created Successfully</h1>
        <p className="text-center mb-4">Please copy this link to share your form:</p>
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={formLink}
            readOnly
            className="text-black flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={copyToClipboard}
            className="bg-blue-500 txt-black px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Copy
          </button>
        </div>
        {copyMessage && (
          <p className="text-green-600 text-center">{copyMessage}</p>
        )}
        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full bg-gray-500 text-black px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Create Another Form
        </button>
      </div>
    </div>
  );
}
