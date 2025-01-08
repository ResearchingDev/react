import React, { ChangeEvent } from 'react';

interface InputFieldProps {
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  name,
  className = 'w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary'
}) => {
  return (
    <div className="input-container">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        className={className}
      />
    </div>
  );
};

interface LabelProps {
  htmlFor?: string;
  text: string;
  className?: string;
  required?: boolean;
}

const Label: React.FC<LabelProps> = ({ htmlFor, text, className = '', required }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`mb-2.5 block font-medium text-black dark:text-white ${className}`}
    >
      {text}
      {required && <span className="text-red-500"> *</span>}
    </label>
  );
};

interface SelectFieldProps {
  options: { value: string; label: string }[];
  value: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
  placeholder: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ options, value, name, onChange, placeholder, className = '' }) => {
  return (
    <select
      value={value}
      name={name}
      onChange={onChange}
      className={`relative z-20 w-full rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export { InputField, Label, SelectField };