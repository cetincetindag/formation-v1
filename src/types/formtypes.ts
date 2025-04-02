export enum FormComponentType {
  ShortText = "Short Text",
  LongText = "Long Text",
  ComboBox = "Combo Box",
  MultiSelect = "Multi Select",
  MultiChoice = "Multi Choice",
  RadioGroup = "Radio Group",
  Slider = "Slider",
}
export type queryParams = {
  formId: string;
  password: string;
};
export type FormComponent = {
  index: number;
  title: string;
  description: string | null;
  type: FormComponentType;
  options?: string[];
  min?: number; 
  max?: number; 
  default?: number; 
};
export type FormStructure = {
  title: string;
  description: string | null;
  link?: string | URL | null;
  link_description?: string | null | URL;
  form_content: FormComponent[];
};
