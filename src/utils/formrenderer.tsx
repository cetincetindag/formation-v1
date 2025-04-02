import React from "react";
import { FormStructure, FormComponent } from "~/types/formtypes";
import { FormCmpBuilder } from "./formops";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
export const FormRenderer: React.FC<{ formData: FormStructure }> = ({
  formData,
}) => {
  const { title, description, link, link_description, form_content } = formData;
  const renderLinkDescription = () => {
    if (typeof link_description === "string") {
      return link_description;
    } else if (link_description instanceof URL) {
      return link_description.toString();
    } else {
      return "Learn More";
    }
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {description && (
          <CardDescription className="pt-2 text-base">
            {description}
          </CardDescription>
        )}
        {link && (
          <a
            href={link.toString()}
            target="_blank"
            rel="noopener noreferrer"
            className="pt-3 text-sm text-blue-600 hover:underline"
          >
            {renderLinkDescription()}
          </a>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {form_content.map((component: FormComponent) => (
            <div
              key={component.index}
              className="space-y-3 rounded-md border p-5"
            >
              <Label
                htmlFor={`form-component-${component.index}`}
                className="text-base font-semibold"
              >
                {component.title}
              </Label>
              {component.description && (
                <p className="text-muted-foreground pb-2 text-sm">
                  {component.description}
                </p>
              )}
              <div className="pt-2">{FormCmpBuilder(component)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
