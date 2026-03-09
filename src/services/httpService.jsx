import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_DELIVERY_API,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_DELIVERY_API,
  withCredentials: true,
});

const setJwt = (jwt) => {
  if (jwt) {
    api.defaults.headers.common["x-auth-token"] = jwt;
    localStorage.setItem("token", jwt);
  } else {
    delete api.defaults.headers.common["x-auth-token"];
    localStorage.removeItem("token");
  }
};

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Refreshes when status is 401 unauthorized
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["x-auth-token"] = token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      const refreshPromise = refreshApi.post("/auth/refresh-token");

      try {
        const response = await refreshPromise;

        const newToken = response.data.accessToken;
        if (!newToken) throw new Error("No token received");

        setJwt(newToken);
        processQueue(null, newToken);

        originalRequest.headers["x-auth-token"] = newToken;
        return api(originalRequest);
      } catch (refreshError) {
        await axios.post(
          `${import.meta.env.VITE_BACK_END_URL}/api/auth/logout`,
          {},
          {
            withCredentials: true,
          }
        );

        window.location.href = "/login";
        localStorage.removeItem("token");

        processQueue(refreshError, null);
        setJwt(null);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.headers["x-auth-token"]) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch,
  setJwt,
};
