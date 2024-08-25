"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = () => {
  const [formId, setFormId] = useState('')
  const router = useRouter()

  const handleSubmit = () => {
    if (formId) {
      router.push(`/manage/${formId}`)
    }
  }

  return (
    <div className="flex flex-col gap-2 m-4 text-black">
      <input
        type="text"
        required
        value={formId}
        onChange={(e) => setFormId(e.target.value)}
        placeholder="Form ID or link"
        className="px-1 py-2 border rounded"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="px-4 py-2 text-white border rounded-lg bg-blue-500 hover:bg-blue-600"
      >
        Go to Form Management
      </button>
    </div>
  )
};

export default Page;
