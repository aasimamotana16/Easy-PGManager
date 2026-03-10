import axios from "axios";
import { API_BASE } from "../../config/apiBaseUrl";

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/signup", data);
