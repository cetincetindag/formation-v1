import { FormStructure, FormComponentType } from "~/types/formtypes";

const sampleFormData: FormStructure = {
  title: "Customer Feedback Survey",
  description: "We value your opinion. Please take a moment to fill out this survey.",
  link: "https://example.com/survey-privacy-policy",
  link_description: "Privacy Policy",
  form_content: [
    {
      index: 0,
      title: "Full Name",
      description: "Please enter your full name",
      type: FormComponentType.ShortText
    },
    {
      index: 1,
      title: "Email Address",
      description: "We'll use this to contact you if needed",
      type: FormComponentType.ShortText
    },
    {
      index: 2,
      title: "Age Group",
      description: "Select your age group",
      type: FormComponentType.ComboBox,
      options: ["Under 18", "18-24", "25-34", "35-44", "45-54", "55+"]
    },
    {
      index: 3,
      title: "Product Satisfaction",
      description: "How satisfied are you with our product?",
      type: FormComponentType.RadioGroup,
      options: ["Very Unsatisfied", "Unsatisfied", "Neutral", "Satisfied", "Very Satisfied"]
    },
    {
      index: 4,
      title: "Features Used",
      description: "Select all features you've used",
      type: FormComponentType.MultiSelect,
      options: ["Feature A", "Feature B", "Feature C", "Feature D", "Feature E"]
    },
    {
      index: 5,
      title: "Improvement Areas",
      description: "Which areas do you think we should improve?",
      type: FormComponentType.MultiChoice,
      options: ["User Interface", "Performance", "Documentation", "Customer Support", "Pricing"]
    },
    {
      index: 6,
      title: "Overall Experience",
      description: "Rate your overall experience",
      type: FormComponentType.Slider
    },
    {
      index: 7,
      title: "Additional Comments",
      description: "Please provide any additional feedback",
      type: FormComponentType.LongText
    }
  ],
  style: {
    theme: "light",
    h_font: "Arial",
    h_txtcolor: "#333333",
    h_cardcolor: "#f5f5f5",
    q_font: "Helvetica",
    q_txtcolor: "#555555",
    q_cardcolor: "#ffffff"
  }
};

export default sampleFormData;
