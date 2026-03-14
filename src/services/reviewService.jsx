import { toast } from "react-toastify";
import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/api/review";

// ─── Public (No Auth) ────────────────────────────────────────────────────────

const getById = async (id) => {
  const response = await http.get(`${apiEndPoint}/public/${id}`);
  return response.data.data;
};

const getByTourId = async (tour_id) => {
  const response = await http.get(`${apiEndPoint}/public/tour/${tour_id}`);
  return response.data.data;
};

// ─── Shared (Authenticated) ──────────────────────────────────────────────────

const getMyReviews = async () => {
  const response = await http.get(`${apiEndPoint}/shared/my`);
  return response.data.data;
};

const create = async (data) => {
  const response = await http.post(`${apiEndPoint}/shared`, data);
  if (response) toast.success("Review submitted successfully!");
  return response.data.data;
};

const update = async (id, data) => {
  const response = await http.put(`${apiEndPoint}/shared/${id}`, data);
  if (response) toast.success("Review updated successfully!");
  return response.data.data;
};

const deleteOne = async (id) => {
  await http.delete(`${apiEndPoint}/shared/${id}`);
  toast.success("Review deleted successfully!");
};

// ─── Admin ───────────────────────────────────────────────────────────────────

const getAll = async ({
  tour_id,
  user_id,
  rating,
  limit = 10,
  skip = 0,
  sortBy,
  order,
  startDate,
  endDate,
} = {}) => {
  const query = new URLSearchParams({
    ...(tour_id && { tour_id }),
    ...(user_id && { user_id }),
    ...(rating && { rating }),
    ...(limit && { limit }),
    ...(skip && { skip }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }).toString();

  const response = await http.get(`${apiEndPoint}/admin?${query}`);
  return response.data;
};

const deleteMany = async (ids) => {
  await http.delete(`${apiEndPoint}/admin/many?ids=${ids.join(",")}`);
  toast.success("Reviews deleted successfully!");
};

export default {
  getById,
  getByTourId,
  getMyReviews,
  create,
  update,
  deleteOne,
  getAll,
  deleteMany,
};
