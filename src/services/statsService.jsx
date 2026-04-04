import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/stats";

const buildQuery = ({
  startDate,
  endDate,
  compareStartDate,
  compareEndDate,
} = {}) =>
  new URLSearchParams({
    ...(startDate && { startDate }),
    ...(endDate && { endDate }),
    ...(compareStartDate && { compareStartDate }),
    ...(compareEndDate && { compareEndDate }),
  }).toString();

// ─── Admin ────────────────────────────────────────────────────────────────────
const getAdminStats = async (params = {}) => {
  const resposne = await http.get(`${apiEndPoint}/admin?${buildQuery(params)}`);
  return resposne.data;
};

// ─── Customer ─────────────────────────────────────────────────────────────────
const getCustomerStats = (params = {}) =>
  http
    .get(`${apiEndPoint}/customer/me?${buildQuery(params)}`)
    .then((res) => res.data.data);

export default {
  getAdminStats,
  getCustomerStats,
};
