import { toast } from "react-toastify";
import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/exclusions/admin";

const getAll = async ({
  is_active,
  search,
  limit = 10,
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

  const response = await http.get(`${apiEndPoint}?${query}`);
  return response.data;
};

const getById = async (id) => {
  const response = await http.get(`${apiEndPoint}/${id}`);
  return response.data.data;
};

const create = async (data) => {
  const response = await http.post(apiEndPoint, data);
  if (response) toast.success("Exclusion created successfully!");
  return response.data.data;
};

const update = async (id, data) => {
  const response = await http.patch(`${apiEndPoint}/${id}`, data);
  if (response) toast.success("Exclusion updated successfully!");
  return response.data.data;
};

const deleteOne = async (id) => {
  await http.delete(`${apiEndPoint}/${id}`);
  toast.success("Exclusion deleted successfully!");
};

const deleteMany = async (ids) => {
  await http.delete(`${apiEndPoint}/many?ids=${ids.join(",")}`);
  toast.success("Exclusions deleted successfully!");
};

export default { getAll, getById, create, update, deleteOne, deleteMany };
