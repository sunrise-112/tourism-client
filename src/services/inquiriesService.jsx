import { toast } from "react-toastify";
import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/inquiries";

// ─── Public ──────────────────────────────────────────────────────────────────

const create = async (data) => {
  const response = await http.post(`${apiEndPoint}/public/new`, data);
  if (response) toast.success("Inquiry submitted successfully!");
  return response.data.data;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

const getAll = async ({ limit = 10, skip = 0, search, sortBy, order } = {}) => {
  const query = new URLSearchParams({
    ...(limit && { limit }),
    ...(skip && { skip }),
    ...(search && { search }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
  }).toString();

  const response = await http.get(`${apiEndPoint}/admin/all?${query}`);
  return response?.data;
};

const getById = async (id) => {
  const response = await http.get(`${apiEndPoint}/admin/${id}`);
  return response.data.data;
};

const update = async (id, data) => {
  const response = await http.put(`${apiEndPoint}/admin/${id}`, data);
  return response.data.data;
};

const deleteOne = async (id) => {
  await http.delete(`${apiEndPoint}/admin/${id}`);
};

const deleteMany = async (ids) => {
  await http.delete(`${apiEndPoint}/admin/many?ids=${ids.join(",")}`);
  toast.success("Inquiries deleted successfully!");
};

export default {
  create,
  getAll,
  getById,
  update,
  deleteOne,
  deleteMany,
};
