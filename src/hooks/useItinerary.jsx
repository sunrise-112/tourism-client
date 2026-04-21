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

  // ✅ Fix: calls onUpdate inside setItinerary so it always gets fresh state
  const updateFieldAndNotify = (index, field, onUpdate) => (e) => {
    const value =
      field === "image" ? e.target.files?.[0] || null : e.target.value;
    setItinerary((prev) => {
      const updated = prev.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      );
      onUpdate(updated.map((day, i) => ({ day: i + 1, ...day })));
      return updated;
    });
  };

  const getItinerary = () =>
    itinerary.map((day, index) => {
      const entry = { day: index + 1 };

      Object.entries(day).forEach(([key, value]) => {
        if (value instanceof File) {
          entry[key] = value;
        } else if (value !== null && value !== undefined && value !== "") {
          entry[key] = value;
        }
      });

      return entry;
    });

  return {
    itinerary,
    addDay,
    removeDay,
    updateField,
    updateFieldAndNotify,
    getItinerary,
  };
};

export default useItinerary;
