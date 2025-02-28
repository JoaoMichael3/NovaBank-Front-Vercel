import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://67.205.164.128";
const AUTH_URL = process.env.AUTH_URL
const FORGOT_PASSWORD_URL = `${AUTH_URL}/forgetThePassword`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
