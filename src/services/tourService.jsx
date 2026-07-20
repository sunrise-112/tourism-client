import { toast } from "react-toastify";
import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/tour";

// ─── Shared (Admin + Customer) ───────────────────────────────────────────────

const getAll = async ({
  type,
  searchQuery,
  category,
  is_featured,
  is_hot_deal,
  limit = 10,
  page = 1,
  sortBy,
  order,
  startDate,
  endDate,
} = {}) => {
  const query = new URLSearchParams({
    ...(type && { type }),
    ...(searchQuery && { searchQuery }),
    ...(category && { category }),
    ...(is_featured !== undefined && { is_featured }),
    ...(is_hot_deal !== undefined && { is_hot_deal }),
    ...(limit && { limit }),
    ...(page && { page }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }).toString();

  const response = await http.get(`${apiEndPoint}/shared?${query}`);
  return response.data;
};

const getById = async (id) => {
  const response = await http.get(`${apiEndPoint}/shared/${id}`);
  return response.data.data;
};

const searchByTitle = async (q) => {
  const response = await http.get(`${apiEndPoint}/shared/search?q=${q}`);
  return response.data.data;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

const create = (formData) => {
  const response = await http.post(`${apiEndPoint}/admin`, formData);
  console.log("Response: ", response)
  return response?.data?.data;
};

const update = async (id, data) => {
  const response = await http.put(`${apiEndPoint}/admin/${id}`, data);
  return response?.data?.data;
};

const deleteOne = async (id) => {
  await http.delete(`${apiEndPoint}/admin/${id}`);
};

const deleteMany = async (ids) => {
  await http.delete(`${apiEndPoint}/admin/many?ids=${ids.join(",")}`);
  toast.success("Tours deleted successfully!");
};

export default {
  getAll,
  getById,
  searchByTitle,
  create,
  update,
  deleteOne,
  deleteMany,
};
