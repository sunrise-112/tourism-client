import { toast } from "react-toastify";
import http from "./httpService";

const BASE = import.meta.env.VITE_API_URL + "/notifications";
const ADMIN = `${BASE}/admin`;
const SHARED = `${BASE}/shared`;

const getAll = async ({
  is_read,
  type,
  limit = 20,
  skip = 0,
  sortBy,
  order,
  user_id,
} = {}) => {
  const query = new URLSearchParams({
    ...(is_read !== undefined && { is_read }),
    ...(type && { type }),
    ...(limit && { limit }),
    ...(skip && { skip }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
    ...(user_id && { user_id }),
  }).toString();
  const response = await http.get(`${SHARED}?${query}`);
  return response?.data;
};

const getById = async (id) => {
  const response = await http.get(`${SHARED}/${id}`);
  return response.data.data;
};

const create = async (data) => {
  const response = await http.post(ADMIN + "/new", data);
  if (response) toast.success("Notification sent successfully!");
  return response.data.data;
};

const announce = async (data) => {
  const response = await http.post(ADMIN + "/announce", data);
  if (response) toast.success("Announcement sent successfully!");
  return response.data.data;
};

const update = async (id, data) => {
  const response = await http.put(`${ADMIN}/${id}`, data);
  if (response) toast.success("Notification updated successfully!");
  return response.data.data;
};

const markRead = async (id) => {
  const response = await http.put(`${SHARED}/${id}/read`);
  return response.data.data;
};

const markAllRead = async () => {
  await http.put(`${SHARED}/read-all`);
};

const deleteOne = async (id) => {
  await http.delete(`${SHARED}/${id}`);
};

const deleteMany = async (ids) => {
  await http.delete(`${ADMIN}/bulk?ids=${ids.join(",")}`);
  toast.success("Notifications deleted successfully!");
};

export default {
  getAll,
  getById,
  create,
  announce,
  update,
  markRead,
  markAllRead,
  deleteOne,
  deleteMany,
};
