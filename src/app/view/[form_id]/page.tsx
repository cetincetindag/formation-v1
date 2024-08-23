import { FormStructure, FormComponentType } from "~/types/formtypes";
import { FormRenderer } from "~/utils/formrenderer";
import { db } from "~/server/db";

function isValidFormStructure(data: unknown): data is FormStructure {
  if (typeof data !== 'object' || data === null) return false;

  const d = data as any;

  return (
    typeof d.title === 'string' &&
    (d.description === null || typeof d.description === 'string') &&
    Array.isArray(d.form_content) &&
    d.form_content.every((component: any) =>
      typeof component === 'object' &&
      typeof component.title === 'string' &&
      Object.values(FormComponentType).includes(component.type)
    ) &&
    typeof d.style === 'object' &&
    typeof d.style.theme === 'string' &&
    typeof d.style.h_font === 'string' &&
    typeof d.style.h_txtcolor === 'string' &&
    typeof d.style.h_cardcolor === 'string' &&
    typeof d.style.q_font === 'string' &&
    typeof d.style.q_txtcolor === 'string' &&
    typeof d.style.q_cardcolor === 'string'
  );
}

interface PageProps {
  params: { form_id: string }
}

const Page = async ({ params }: PageProps) => {
  const formId = params.form_id;

  if (typeof formId !== 'string') {
    return <div>Invalid form ID</div>;
  }

  const formRecord = await db.form.findUnique({
    where: {
      id: formId
    },
    select: {
      data: true
    }
  });

  if (!formRecord) {
    return <div>Form not found</div>;
  }

  if (!isValidFormStructure(formRecord.data)) {
    return <div>Invalid form data structure</div>;
  }

  const formData: FormStructure = formRecord.data;

  return (
    <div>
      <FormRenderer formData={formData} />
    </div>
  );
};

export default Page;
