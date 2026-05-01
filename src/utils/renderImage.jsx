export default (data) => {
  if (!data) return undefined;

  // Blob preview (before upload)
  if (data instanceof File) return URL.createObjectURL(data);

  // Cloudinary URL (already absolute)
  if (data.startsWith("http")) return data;

  // Fallback for any old local paths still in DB
  return import.meta.env.VITE_BACKEND_URL + data;
};
