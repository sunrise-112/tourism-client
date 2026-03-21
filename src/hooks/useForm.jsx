import _ from "lodash";
import { useEffect, useState } from "react";
import joi from "joi-browser";

const useForm = (formData = null, initialSchema = null, doSubmit) => {
  const [data, setData] = useState(formData);
  const [schema, setSchema] = useState(initialSchema);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setData(formData);
  }, [formData]);

  useEffect(() => {
    setSchema(initialSchema);
  }, [errors, formData]);

  const validate = () => {
    const options = { abortEarly: false };
    const { error } = joi.validate(data, schema, options);
    if (!error) return;

    let errs = {};
    for (let item of error.details) {
      // Handle nested array paths (e.g., "operating_areas.0" becomes "operating_areas")
      const fieldName = item.path[0];
      errs[fieldName] = item.message;
    }
    return errs;
  };

  const validateProperty = ({ name, value }) => {
    const obj = { [name]: value };
    const propertySchema = { [name]: schema[name] };
    const { error } = joi.validate(obj, propertySchema);
    if (!error) return;
    return error ? error.details[0].message : undefined;
  };

  const handleChange = ({ target: input }) => {
    let inputValue;

    if (input.type === "file") {
      if (input.multiple) {
        // DraggableImageInput — multiple files
        inputValue = input.files ? Array.from(input.files) : [];
      } else {
        // ImageUpload — single file
        inputValue = input.files?.[0] ?? null;
      }
    } else if (input.type === "number" || input.type === "range") {
      inputValue = input.value !== "" ? Number(input.value) : "";
    } else if (
      input.type === "checkbox" &&
      input.name in data &&
      Array.isArray(data[input.name])
    ) {
      const currentArray = data[input.name] || [];
      if (input.checked) {
        inputValue = [...currentArray, input.value];
      } else {
        inputValue = currentArray.filter((item) => item !== input.value);
      }
    } else if (input.type === "checkbox") {
      inputValue = input.checked;
    } else if (Array.isArray(input.value)) {
      // MultiSelect
      inputValue = input.value;
    } else {
      inputValue = input.value;
    }

    const inputData = { ...data, [input.name]: inputValue };
    setData(inputData);

    let errs = { ...errors };
    const errorMessage = validateProperty({
      name: input.name,
      value: inputValue,
    });
    if (errorMessage) {
      errs[input.name] = errorMessage;
    } else {
      delete errs[input.name];
    }
    setErrors(errs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs || {});
    if (errs) return;
    await doSubmit();
  };

  // Additional helper function for updating array fields directly
  const updateArrayField = (fieldName, newValue) => {
    const inputData = { ...data, [fieldName]: newValue };
    setData(inputData);

    // Validate the updated field
    let errs = { ...errors };
    const errorMessage = validateProperty({ name: fieldName, value: newValue });
    if (errorMessage) {
      errs[fieldName] = errorMessage;
    } else {
      delete errs[fieldName];
    }
    setErrors(errs);
  };

  const getFormData = () => {
    const newForm = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        newForm.append(key, value);
      } else if (key === "gallery") {
        // ✅ Handle mixed array: File (new) + string (existing)
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v instanceof File) {
              newForm.append("gallery", v);
            } else if (typeof v === "string") {
              newForm.append("gallery_existing", v);
            }
          });
        }
      } else if (
        Array.isArray(value) &&
        value.every((v) => v instanceof File)
      ) {
        value.forEach((file) => newForm.append(key, file));
      } else if (Array.isArray(value)) {
        // ✅ generic primitive arrays only — no Number() coercion
        value.forEach((item) => newForm.append(key, item));
      } else if (value !== null && value !== undefined) {
        newForm.append(key, String(value));
      }
    });

    return newForm;
  };

  return {
    data,
    setData,
    getFormData,
    errors,
    setErrors,
    validate,
    handleChange,
    handleSubmit,
    updateArrayField,
  };
};

export default useForm;
