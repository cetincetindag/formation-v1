import React from 'react';
import { FormStructure, FormComponent, FormStyle } from '~/types/formtypes';
import { FormCmpBuilder } from './formops';

const applyFormStyles = (style: FormStyle) => ({
  backgroundColor: style.h_cardcolor,
  color: style.h_txtcolor,
  fontFamily: style.h_font,
});

const applyQuestionStyles = (style: FormStyle) => ({
  backgroundColor: style.q_cardcolor,
  color: style.q_txtcolor,
  fontFamily: style.q_font,
});

export const FormRenderer: React.FC<{ formData: FormStructure }> = ({ formData }) => {
  const { title, description, link, link_description, form_content, style } = formData;

  const renderLinkDescription = () => {
    if (typeof link_description === 'string') {
      return link_description;
    } else if (link_description instanceof URL) {
      return link_description.toString();
    } else {
      return 'Learn More';
    }
  };

  return (
    <div style={applyFormStyles(style)} className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      {description && <p className="mb-6">{description}</p>}
      {link && (
        <a href={link.toString()} className="text-blue-600 hover:underline mb-6 block">
          {renderLinkDescription()}
        </a>
      )}
      <form>
        {form_content.map((component: FormComponent) => (
          <div key={component.index} className="mb-6" style={applyQuestionStyles(style)}>
            <h2 className="text-xl font-semibold mb-2">{component.title}</h2>
            {component.description && <p className="mb-2">{component.description}</p>}
            {FormCmpBuilder(component)}
          </div>
        ))}
      </form>
    </div>
  );
};
