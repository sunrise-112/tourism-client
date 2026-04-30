import { toast } from "react-toastify";
import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/inclusions";

const getAll = async ({
  is_active,
  search,
  limit = 100,
  skip = 0,
  sortBy,
  order,
} = {}) => {
  const query = new URLSearchParams({
    ...(is_active !== undefined && { is_active }),
    ...(search && { search }),
    ...(limit && { limit }),
    ...(skip && { skip }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
  }).toString();

  const response = await http.get(`${apiEndPoint}/public?${query}`);
  return response.data;
};

const getById = async (id) => {
  const response = await http.get(`${apiEndPoint}/admin/${id}`);
  return response.data.data;
};

const create = async (data) => {
  const response = await http.post(apiEndPoint + "/admin", data);
  if (response) toast.success("Inclusion created successfully!");
  return response.data.data;
};

const update = async (id, data) => {
  const response = await http.patch(`${apiEndPoint}/admin/${id}`, data);
  if (response) toast.success("Inclusion updated successfully!");
  return response.data.data;
};

const deleteOne = async (id) => {
  await http.delete(`${apiEndPoint}/admin/${id}`);
  toast.success("Inclusion deleted successfully!");
};

const deleteMany = async (ids) => {
  await http.delete(`${apiEndPoint}/admin/many?ids=${ids.join(",")}`);
  toast.success("Inclusions deleted successfully!");
};

export default { getAll, getById, create, update, deleteOne, deleteMany };
