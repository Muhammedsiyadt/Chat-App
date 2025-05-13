import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "/" : "https://13.238.120.32:5001/api",
  withCredentials: true,
});
