import { toast } from "react-toastify";
import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/booking";

// ─── Shared (Admin + Customer) ───────────────────────────────────────────────

const getById = async (id) => {
  const response = await http.get(`${apiEndPoint}/shared/${id}`);
  return response.data.data;
};

const create = async (data) => {
  const response = await http.post(`${apiEndPoint}/public`, data);
  return response.data.data;
};

const update = async (id, tourId, data) => {
  const response = await http.put(
    `${apiEndPoint}/shared/${id}?tourId=${tourId}`,
    data
  );
  if (response) toast.success("Booking updated successfully!");
  return response.data.data;
};

// ─── Customer ────────────────────────────────────────────────────────────────

const getMyBookings = async () => {
  const response = await http.get(`${apiEndPoint}/customer/my`);
  return response.data.data;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

const getAll = async ({
  status,
  user_id,
  sq,
  tour_id,
  limit = 10,
  skip = 0,
  sortBy,
  order,
  startDate,
  endDate,
} = {}) => {
  const query = new URLSearchParams({
    ...(status && { status }),
    ...(user_id && { user_id }),
    ...(sq && { sq }),
    ...(tour_id && { tour_id }),
    ...(limit && { limit }),
    ...(skip && { skip }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
  }).toString();

  const response = await http.get(`${apiEndPoint}/admin?${query}`);
  return response?.data;
};

const updateStatus = async (id, status) => {
  const response = await http.patch(`${apiEndPoint}/admin/${id}/status`, {
    status,
  });
  if (response) toast.success("Booking status updated successfully!");
  return response.data.data;
};

const deleteOne = async (id) => {
  await http.delete(`${apiEndPoint}/admin/${id}`);
};

const deleteMany = async (ids) => {
  await http.delete(`${apiEndPoint}/admin/many?ids=${ids.join(",")}`);
  toast.success("Bookings deleted successfully!");
};

export default {
  getById,
  create,
  update,
  getMyBookings,
  getAll,
  updateStatus,
  deleteOne,
  deleteMany,
};
