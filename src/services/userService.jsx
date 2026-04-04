import { toast } from "react-toastify";
import http from "./httpService";
import { jwtDecode } from "jwt-decode";

const apiEndPoint = import.meta.env.VITE_API_URL + "/user";

const tokenKey = "token";

const getAll = async ({
  role,
  page = 1,
  limit = 10,
  sortBy,
  order,
  startDate,
  endDate,
} = {}) => {
  const query = new URLSearchParams({
    ...(role && { role }),
    ...(page && { page }),
    ...(limit && { limit }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }).toString();

  const response = await http.get(`${apiEndPoint}/admin/all?${query}`);
  return response.data.data;
};

const getById = async (id) => {
  const response = await http.get(`${apiEndPoint}/admin/${id}`);
  return response.data.data;
};

const getByName = async (searchQuery) => {
  const response = await http.get(
    `${apiEndPoint}/admin/name?searchQuery=${searchQuery}`
  );
  return response.data.data;
};

const create = async (data) => {
  const response = await http.post(`${apiEndPoint}/admin/new`, data);
  if (response) toast.success("User created successfully!");
  return response.data.data;
};

const update = async (id, data) => {
  const response = await http.put(`${apiEndPoint}/shared/${id}`, data);
  return response.data.data;
};

const getMe = async () => {
  const response = await http.get(`${apiEndPoint}/shared/me`);
  return response.data.data;
};

const deleteOne = async (id) => {
  await http.delete(`${apiEndPoint}/admin/${id}`);
  toast.success("User deleted successfully!");
};

const deleteMany = async (ids) => {
  await http.delete(`${apiEndPoint}/admin/many?ids=${ids.join(",")}`);
  toast.success("Users deleted successfully!");
};

const getCurrentUser = () => {
  try {
    const token = localStorage.getItem(tokenKey);
    if (!token) return null;

    const decoded = jwtDecode(token);
    return decoded;
  } catch (ex) {
    return null;
  }
};

export default {
  getAll,
  getById,
  getByName,
  create,
  update,
  getMe,
  deleteOne,
  deleteMany,
  getCurrentUser,
};
