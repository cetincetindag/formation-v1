import sampleFormData from "~/tests/testformdata";
import { FormRenderer } from "~/utils/formrenderer";


const Page = async () => {
  return (
    <div>
      <FormRenderer formData={sampleFormData} />
    </div>
  )
};


export default Page;
