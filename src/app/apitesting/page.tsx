"use client";

import { useState } from "react";

const Page = () => {
  const [formId, setFormId] = useState("");
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  const fetchForm = async () => {
    if (!formId) {
      setError("Please enter a Form ID.");
      return;
    }

    setError("");

    try {
      const res = await fetch(`/api/forms?form_id=${formId}`);

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || "Failed to fetch form");
        return;
      }

      const data = await res.json();
      setFormData(data);
    } catch (err) {
      setError("An error occurred while fetching the form.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Test Form Fetch</h1>
      <input
        type="text"
        placeholder="Enter Form ID"
        value={formId}
        onChange={(e) => setFormId(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button onClick={fetchForm} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Fetch Form
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {formData && (
        <pre className="bg-gray-100 p-4 mt-4 rounded text-sm">
          {JSON.stringify(formData, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default Page;

