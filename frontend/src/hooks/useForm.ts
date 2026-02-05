// useForm.ts

import { useState, ChangeEvent, FormEvent } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

interface FieldValidation {
  [key: string]: ValidationRules;
}

interface FormErrors {
  [key: string]: string;
}

export function useForm<T extends { [key: string]: any }>(
  initialValues: T,
  validationRules?: FieldValidation,
  onSubmit?: (values: T) => void
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: any): string => {
    if (!validationRules || !validationRules[name]) return '';

    const rules = validationRules[name];

    if (rules.required && !value) {
      return 'This field is required';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength}`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength}`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rules.custom && !rules.custom(value)) {
      return 'Invalid value';
    }

    return '';
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });

    if (validationRules) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!validationRules) return true;

    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validateForm()) {
      try {
        onSubmit && await onSubmit(values);
        setErrors({});
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues
  };
}