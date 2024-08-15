// Those are the types of data that the API will expect on a call
// TODO: add types  

export enum FormComponentType {
  ShortText,
  LongText,
  ComboBox,
  MultiSelect,
  MultiChoice,
  RadioGroup,
  Slider
}


export interface FormStyle {
  theme: string,
  h_font: string,
  h_txtcolor: string,
  h_cardcolor: string,
  q_font: string,
  q_txtcolor: string,
  q_cardcolor: string,
}

export interface FormComponent {
  index: number;
  title: string;
  description: string | null;
  type: FormComponentType;
  options?: string[];
}

export interface FormContent {
  data: FormComponent[];
}

export interface FormStructure {
  title: string;
  description: string | null;
  link: string | null;
  link_description: URL | string | null;
  form_content: FormContent;
  style: FormStyle;
}



