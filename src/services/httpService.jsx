/* 
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
*/ /* 
import axios from "axios";

const api = axios.create({
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

// Set token on init if it exists
const token = localStorage.getItem("token");
if (token) setJwt(token);

export default {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch,
  setJwt,
};
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // required to send httpOnly refresh cookie
});

// --- Refresh token state ---
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// --- Helper to set / clear JWT in headers & localStorage ---
export const setJwt = (jwt) => {
  if (jwt) {
    api.defaults.headers.common["x-auth-token"] = jwt;
    localStorage.setItem("token", jwt);
  } else {
    delete api.defaults.headers.common["x-auth-token"];
    localStorage.removeItem("token");
  }
};

// Initial token load (if any)
const initialToken = localStorage.getItem("token");
if (initialToken) setJwt(initialToken);

// --- Refresh endpoint (adjust to your actual backend route) ---
const REFRESH_URL = "/auth/refresh-token"; // e.g., POST /api/auth/refresh

// --- Axios response interceptor for token refresh ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried -> reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If we are already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["x-auth-token"] = token;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint (cookie is sent automatically via withCredentials)
      const { data } = await api.post(REFRESH_URL);

      console.log("Data.accessToken: ", data.accessToken);
      const newAccessToken = data.accessToken;

      if (!newAccessToken)
        throw new Error("No access token in refresh response");

      // Update stored token and default header
      setJwt(newAccessToken);

      // Retry all queued requests with the new token
      processQueue(null, newAccessToken);

      // Retry the original request
      originalRequest.headers["x-auth-token"] = newAccessToken;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed → clear tokens and reject all queued requests
      processQueue(refreshError, null);
      setJwt(null); // clear token from storage & header
      // Optionally redirect to login page
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// --- Export the same convenient API object ---
export default {
  get: api.get,
  post: api.post,
  put: api.put,
  delete: api.delete,
  patch: api.patch,
  setJwt, // still exposed for manual token updates
};
