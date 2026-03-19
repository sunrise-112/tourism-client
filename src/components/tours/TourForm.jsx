import { useEffect, useState } from "react";
import Joi from "joi-browser";

// Hooks
import useForm from "../../hooks/useForm";

// Services
import tourService from "../../services/tourService";

// Commons
import ToggleSwitcher from "../../common/ToggleSwitcher";

// Utils
import {
  renderButton,
  renderInput,
  renderMultiSelect,
  renderDraggableImages,
  renderTextarea,
  renderCheckBox,
  renderSelect,
  renderImageUpload,
} from "../../utils/formRenders";

const TourForm = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const CATEGORIES = [
    { id: 1, name: "Adventure" },
    { id: 2, name: "Cultural" },
    { id: 3, name: "Coastal" },
    { id: 4, ame: "Historical" },
  ];

  const schema = {
    title: Joi.string().max(200).required().label("Title"),
    description: Joi.string().optional().label("Description"),
    destination: Joi.string().max(150).optional().label("Destination"),
    cover_image: Joi.optional(),
    gallery: Joi.optional(),
    price: Joi.number().precision(2).positive().optional().label("Price"),
    duration_days: Joi.number()
      .integer()
      .positive()
      .optional()
      .label("Duration Days"),
    max_group_size: Joi.number()
      .integer()
      .positive()
      .optional()
      .label("Max Group Size"),
    is_featured: Joi.boolean().default(false).label("Is Featured"),
    is_hot_deal: Joi.boolean().default(false).label("Is Hot Deal"),
    category: Joi.string().max(80).optional().label("Category"),
  };

  const doSubmit = async () => {
    try {
      if (isSubmitting) return;
      const createData = getFormData();
      await tourService.create(createData);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const { data, errors, handleChange, handleSubmit, validate, getFormData } =
    useForm(formData, schema, doSubmit);

  console.log("Validate: ", validate());

  return (
    <form onSubmit={handleSubmit}>
      {renderInput("Title", "title", data, errors, handleChange, "text", true)}
      {renderTextarea("Description", "description", data, errors, handleChange)}
      {renderInput(
        "Destination",
        "destination",
        data,
        errors,
        handleChange,
        "text",
        true
      )}
      {renderInput(
        "Price",
        "price",
        data,
        errors,
        handleChange,
        "number",
        true
      )}
      {renderInput(
        "Duration days",
        "duration_days",
        data,
        errors,
        handleChange,
        "number",
        true
      )}
      {renderInput(
        "Max group size",
        "max_group_size",
        data,
        errors,
        handleChange,
        "number",
        true
      )}
      {ToggleSwitcher({
        label: "Featured",
        name: "is_featured",
        data,
        errors,
        onChange: (e) => handleChange(e),
      })}
      {ToggleSwitcher({
        label: "Hot Deal",
        name: "is_hot_deal",
        data,
        errors,
        onChange: (e) => handleChange(e),
      })}
      {renderSelect(
        "Category",
        "category",
        data,
        errors,
        handleChange,
        CATEGORIES,
        "name",
        "name"
      )}
      {renderImageUpload(
        "Cover Image",
        "cover_image",
        data,
        errors,
        handleChange,
        true,
        "select tour thumbnail"
      )}
      {renderDraggableImages(
        "Gallery",
        "gallery",
        data,
        errors,
        handleChange,
        true,
        20,
        "Upload gallery images, Max: 20 items"
      )}
      {renderButton("Create", "submit", validate())}
    </form>
  );
};

export default TourForm;
