export default (data) => {
  let image_url;

  if (data && data instanceof File) {
    image_url = URL.createObjectURL(data);
  } else if (data) {
    image_url = import.meta.env.VITE_BACKEND_URL + data;
  }

  return image_url;
};
