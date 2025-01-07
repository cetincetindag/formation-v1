// Those are the types of data that the API will expect on a call
// TODO: add types

export enum FormComponentType {
  ShortText = "Short Text",
  LongText = "Long Text",
  ComboBox = "Combo Box",
  MultiSelect = "Multi Select",
  MultiChoice = "Multi Choice",
  RadioGroup = "Radio Group",
  Slider = "Slider",
}

export interface FormStyle {
  theme: string;
  h_font: string;
  h_txtcolor: string;
  h_cardcolor: string;
  q_font: string;
  q_txtcolor: string;
  q_cardcolor: string;
}

export const defaultFormStyle: FormStyle = {
  theme: "light",
  h_font: "Arial",
  h_txtcolor: "#000000",
  h_cardcolor: "#ffffff",
  q_font: "Arial",
  q_txtcolor: "#000000",
  q_cardcolor: "#f0f0f0",
};

export interface FormComponent {
  index: number;
  title: string;
  description: string | null;
  type: FormComponentType;
  options?: string[];
}

export interface FormStructure {
  title: string;
  description: string | null;
  link?: string | URL | null;
  link_description?: string | null | URL;
  form_content: FormComponent[];
  style: FormStyle;
}
