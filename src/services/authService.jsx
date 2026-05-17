import { toast } from "react-toastify";
import http from "./httpService";

const apiEndPoint = import.meta.env.VITE_API_URL + "/auth";

const tokenKey = "token";

const register = async (data) => {
  const response = await http.post(`${apiEndPoint}/register`, data);
  if (response)
    toast.success("Registered successfully! Please verify your email.");
  return response.data.data;
};

const login = async (data) => {
  const response = await http.post(`${apiEndPoint}/login`, data);

  localStorage.setItem(tokenKey, response.headers["x-auth-token"]);
  return response;
};

const logout = async () => {
  localStorage.removeItem(tokenKey);
  await http.post(`${apiEndPoint}/logout`);
};

const verifyEmail = async (token) => {
  const response = await http.get(`${apiEndPoint}/verify-email/${token}`);
  return response.data;
};

const forgotPassword = async (data) => {
  const response = await http.post(`${apiEndPoint}/forgot-password`, data);
  if (response) toast.success("Reset link sent if email exists!");
  return response.data;
};

const resetPassword = async (token, data) => {
  const response = await http.post(
    `${apiEndPoint}/reset-password/${token}`,
    data
  );
  if (response)
    toast.success("Password reset successfully! You can now login.");
  return response.data;
};

export default {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
