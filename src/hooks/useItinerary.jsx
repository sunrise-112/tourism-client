import { useEffect, useState } from "react";

const EMPTY_DAY = () => ({
  title: "",
  location: "",
  description: "",
  image: null,
});

const useItinerary = (initialData) => {
  const [itinerary, setItinerary] = useState(
    initialData?.map(({ day, ...rest }) => rest)
  );

  useEffect(() => {
    if (initialData.length > 0 && itinerary.length === 0) {
      setItinerary(initialData.map(({ day, ...rest }) => rest));
    }
  }, [initialData]);

  const addDay = () => {
    setItinerary((prev) => [...prev, EMPTY_DAY()]);
  };

  const removeDay = (index) => {
    setItinerary((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index, field) => (e) => {
    const value =
      field === "image" ? e.target.files?.[0] || null : e.target.value;
    setItinerary((prev) =>
      prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    );
  };

  const getItinerary = () =>
    itinerary.map((day, index) => {
      const entry = { day: index + 1 };

      Object.entries(day).forEach(([key, value]) => {
        if (value instanceof File) {
          entry[key] = value; // keep File as-is
        } else if (value !== null && value !== undefined && value !== "") {
          entry[key] = value; // keep non-empty strings
        }
      });

      return entry;
    });

  return { itinerary, addDay, removeDay, updateField, getItinerary };
};

export default useItinerary;
