// Those are the types of data that the API will expect on a call
// TODO: add types  

export enum FormComponentType {
  ShortText = 'shorttext',
  LongText = 'longtext',
  ComboBox = 'combobox',
  MultiSelect = 'multiselect',
  MultiChoice = 'multichoice',
  RadioGroup = 'radiogroup',
  Slider = 'slider'
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

export interface FormStructure {
  title: string;
  description: string | null;
  link?: string | URL | null;
  link_description?: string | null | URL;
  form_content: FormComponent[];
  style: FormStyle;
}



