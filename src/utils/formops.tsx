import {
  FormComponent,
  FormComponentType,
  FormStructure,
} from "~/types/formtypes";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { cn } from "~/lib/utils";
import { useState } from "react";
export const FormCmpBuilder = (form_cmp: FormComponent) => {
  const id = `form-component-${form_cmp.index}`;
  switch (form_cmp.type) {
    case FormComponentType.ShortText:
      return (
        <Input
          id={id}
          name={form_cmp.title}
          type="text"
          placeholder={form_cmp.title}
          className="w-full px-3 py-2"
          required={form_cmp.required}
        />
      );
    case FormComponentType.LongText:
      return (
        <Textarea
          id={id}
          name={form_cmp.title}
          placeholder={form_cmp.title}
          className="min-h-[100px] w-full px-3 py-2"
          required={form_cmp.required}
        />
      );
    case FormComponentType.ComboBox:
      return (
        <Select name={form_cmp.title} required={form_cmp.required}>
          <SelectTrigger className="w-full text-black">
            <SelectValue placeholder={form_cmp.title} />
          </SelectTrigger>
          <SelectContent>
            {form_cmp.options?.map((option, index) => (
              <SelectItem key={index} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case FormComponentType.MultiSelect:
      return (
        <div className="space-y-2">
          {form_cmp.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`${id}-option-${index}`}
                name={form_cmp.title}
                value={option}
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                required={form_cmp.required && index === 0}
              />
              <Label
                htmlFor={`${id}-option-${index}`}
                className="text-sm font-normal"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      );
    case FormComponentType.MultiChoice:
      return (
        <div className="space-y-2">
          {form_cmp.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="checkbox"
                id={`${id}-option-${index}`}
                name={form_cmp.title}
                value={option}
                className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                required={form_cmp.required && index === 0}
              />
              <Label
                htmlFor={`${id}-option-${index}`}
                className="text-sm font-normal"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      );
    case FormComponentType.RadioGroup:
      return (
        <div className="space-y-2">
          {form_cmp.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`${id}-option-${index}`}
                name={form_cmp.title}
                value={option}
                className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                required={form_cmp.required}
              />
              <Label
                htmlFor={`${id}-option-${index}`}
                className="text-sm font-normal"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
      );
    case FormComponentType.Slider:
      const SliderWithValue = () => {
        const min = form_cmp.min ?? 0;
        const max = form_cmp.max ?? 100;
        const defaultValue = form_cmp.default ?? Math.floor((min + max) / 2);
        const [value, setValue] = useState(defaultValue);
        return (
          <div className="space-y-4 px-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{min}</span>
              <span className="rounded-md bg-gray-100 px-2 py-1 text-center text-sm font-medium">
                Current: {value}
              </span>
              <span className="text-sm font-medium">{max}</span>
            </div>
            <Slider
              id={id}
              name={form_cmp.title}
              min={min}
              max={max}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValue(parseInt(e.target.value))
              }
              value={value}
              className="w-full"
            />
            <input
              type="hidden"
              name={form_cmp.title}
              value={value}
              required={form_cmp.required}
            />
          </div>
        );
      };
      return <SliderWithValue />;
    default:
      return null;
  }
};
export const FormBuilder = (form: FormStructure) => {
  return (
    <div className="w-full space-y-6">
      {form.form_content.map((cmp: FormComponent) => (
        <div key={cmp.index} className="space-y-3 rounded-md border p-4">
          <h3 className="text-lg font-semibold">{cmp.title}</h3>
          {cmp.description && (
            <p className="text-muted-foreground text-sm">{cmp.description}</p>
          )}
          <div className="pt-2">{FormCmpBuilder(cmp)}</div>
        </div>
      ))}
    </div>
  );
};
