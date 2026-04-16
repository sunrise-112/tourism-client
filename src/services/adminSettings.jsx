import http from "./httpService";

const ENDPOINT = import.meta.env.VITE_API_URL + "/settings";

/**
 * GET /api/settings/admin
 * @returns {Promise<{ id: number, smtp: boolean, sms: boolean }>}
 */
const get = async () => {
  const { data } = await http.get(`${ENDPOINT}/public`);
  return data.data;
};

/**
 * PATCH /api/settings/admin
 * @param {{ smtp?: boolean, sms?: boolean }} payload
 * @returns {Promise<{ id: number, smtp: boolean, sms: boolean }>}
 */
const update = async (payload) => {
  const { data } = await http.put(ENDPOINT + "/admin", payload);
  return data.data;
};

const settingsService = { get, update };

export default settingsService;
