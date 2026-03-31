import React from "react";
import Input from "../common/Input";
import ColorInput from "../common/ColorInput";
import TextArea from "../common/TextArea";
import Button from "../common/Button";
import Select from "../common/Select";
import MultiSelect from "../common/MultiSelect";
import ToggleInput from "../common/toggleInput";
import ImageUpload from "../common/ImageUpload";
import DraggableImageInput from "../common/DraggableImageInput";
import TimeInput from "../common/TimeInput";
import DateInput from "../common/DateInput";

export const renderButton = (
  label,
  name,
  disabled,
  isSubmitting,
  icon,
  type
) => {
  return (
    <Button
      label={label}
      name={name}
      disabled={disabled}
      isSubmitting={isSubmitting}
      icon={icon}
      type={type}
    />
  );
};

export const renderInput = (
  label,
  name,
  data,
  errors,
  handleChange,
  type,
  selected,
  icon,
  required,
  max,
  placeholder
) => {
  return (
    <Input
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={handleChange}
      type={type}
      selected={selected}
      icon={icon}
      required={required}
      placeholder={placeholder}
      max={max}
    />
  );
};

export const renderColorInput = (
  label,
  name,
  data,
  errors,
  handleChange,
  type,
  selected,
  icon,
  required,
  placeholder
) => {
  return (
    <ColorInput
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={handleChange}
      type={type}
      selected={selected}
      icon={icon}
      required={required}
      placeholder={placeholder}
    />
  );
};

export const renderTextarea = (
  label,
  name,
  data,
  errors,
  handleChange,
  type,
  selected,
  placeholder, 
  icon,
  required
) => {
  return (
    <TextArea
      placeholder={placeholder}
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={handleChange}
      type={type}
      selected={selected}
      icon={icon}
      required={required}
    />
  );
};

export const renderSelect = (
  label,
  name,
  data,
  errors,
  handleChange,
  options,
  labelKey,
  valueKey,
  onSelect,
  onStatusChange,
  placeholder,
  searchable,
  disabled,
  allowClear
) => {
  return (
    <Select
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={handleChange}
      options={options}
      labelKey={labelKey}
      valueKey={valueKey}
      onSelect={onSelect}
      onStatusChange={onStatusChange}
      placeholder={placeholder}
      searchable={searchable}
      disabled={disabled}
      allowClear={allowClear}
    />
  );
};

export const renderMultiSelect = (
  label,
  name,
  data,
  errors,
  handleChange,
  options = [],
  labelKey,
  valueKey,
  icon,
  placeholder,
  searchable,
  disabled,
  maxSelected,
  autoSelectAll
) => {
  return (
    <MultiSelect
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={handleChange}
      options={options}
      labelKey={labelKey}
      valueKey={valueKey}
      autoSelectAll={autoSelectAll}
      maxSelected={maxSelected}
      placeholder={placeholder}
      searchable={searchable}
      disabled={disabled}
    />
  );
};

export const renderTimeInput = (
  label,
  name,
  data,
  errors,
  onChange,
  required
) =>
  React.createElement(TimeInput, {
    label,
    name,
    data,
    errors,
    onChange,
    required,
  });

export const renderDateInput = (
  label,
  name,
  data,
  errors,
  onChange,
  required
) =>
  React.createElement(DateInput, {
    label,
    name,
    data,
    errors,
    onChange,
    required,
  });

export const renderCheckBox = (
  label,
  name,
  data,
  errors,
  onChange,
  icon,
  selected,
  description
) => {
  return (
    <ToggleInput
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={onChange}
      selected={selected}
      icon={icon}
      description={description}
    />
  );
};

export const renderImageUpload = (
  label,
  name,
  data,
  errors,
  handleChange,
  required,
  placeholder
) => {
  return (
    <ImageUpload
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={handleChange}
      required={required}
      placeholder={placeholder}
    />
  );
};

export const renderDraggableImages = (
  label,
  name,
  data,
  errors,
  handleChange,
  required,
  maxFiles,
  placeholder
) => {
  return (
    <DraggableImageInput
      label={label}
      name={name}
      data={data}
      errors={errors}
      onChange={handleChange}
      required={required}
      maxFiles={maxFiles}
      placeholder={placeholder}
    />
  );
};
