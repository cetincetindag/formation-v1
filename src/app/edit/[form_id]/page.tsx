"use client"
import { useParams } from "next/navigation";

const Page = () => {
  const params = useParams()
  return (
    <div>
      This is the EDITING page for form ID {params.form_id}
    </div>
  )
}

export default Page;

