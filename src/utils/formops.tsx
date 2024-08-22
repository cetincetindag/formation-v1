import { FormComponent, FormComponentType, FormStructure } from "~/types/formtypes";

export const FormCmpBuilder = (form_cmp: FormComponent) => {
  switch (form_cmp.type) {
    case FormComponentType.ShortText:
      return <input type="text" placeholder={form_cmp.title} />;
    case FormComponentType.LongText:
      return <textarea placeholder={form_cmp.title} />;
    case FormComponentType.ComboBox:
      return (
        <select>
          {form_cmp.options?.map((option, index) => (
            <option key={index}>{option}</option>
          ))}
        </select>
      );
    case FormComponentType.MultiSelect:
      return (
        <select multiple>
          {form_cmp.options?.map((option, index) => (
            <option key={index}>{option}</option>
          ))}
        </select>
      );
    case FormComponentType.MultiChoice:
      return (
        <div>
          {form_cmp.options?.map((option, index) => (
            <div key={index}>
              <input type="checkbox" />
              <label>{option}</label>
            </div>
          ))}
        </div>
      );
    case FormComponentType.RadioGroup:
      return (
        <div>
          {form_cmp.options?.map((option, index) => (
            <div key={index}>
              <input type="radio" name={form_cmp.title} />
              <label>{option}</label>
            </div>
          ))}
        </div>
      );
    case FormComponentType.Slider:
      return <input type="range" />;
    default:
      return null;
  }
};

export const FormBuilder = (form: FormStructure) => {
  return (
    <div>
      {form.form_content.map((cmp: FormComponent) => (
        <div key={cmp.index}>
          <h3>{cmp.title}</h3>
          {cmp.description && <p>{cmp.description}</p>}
          {FormCmpBuilder(cmp)}
        </div>
      ))}
    </div>
  );
};



