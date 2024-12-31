import React from 'react';

interface LabelProps {
  htmlFor?: string;
  text: string;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ htmlFor, text, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-2.5 block font-medium text-black dark:text-white ${className}`}
    >
      {text}
    </label>
  );
};

export default Label;
