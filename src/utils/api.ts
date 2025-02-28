import axiosInstance from "@/utils/axiosInstance";

interface VerifyEmailResponse {
  message: string;
}

interface LoginResponse {
  message: string;
}

interface Verify2FAResponse {
  message: string;
  accessToken: string;
}

export const forgotPassword = async (email: string) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL;
  const FORGOT_PASSWORD_URL = process.env.NEXT_PUBLIC_FORGOT_PASSWORD_URL;
  const url = `${BASE_URL}/${AUTH_URL}/${FORGOT_PASSWORD_URL}`;
  return axiosInstance.post(url, { email });
};

export const verifyEmail = async (token: string): Promise<VerifyEmailResponse> => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "auth";
  const VERIFY_EMAIL_URL = process.env.NEXT_PUBLIC_VERIFY_EMAIL_URL;
  const url = `${BASE_URL}/${AUTH_URL}/${VERIFY_EMAIL_URL}/${token}`;

  const response = await axiosInstance.get<VerifyEmailResponse>(url);
  return response.data;
};

export const login = async (credential: string, password: string): Promise<LoginResponse> => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "auth";
  const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL;
  const url = `${BASE_URL}/${AUTH_URL}/${LOGIN_URL}`;

  const response = await axiosInstance.post<LoginResponse>(url, { credential, password });
  return response.data;
};

export const verify2FA = async (hash: string): Promise<Verify2FAResponse> => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "auth";
  const VERIFY_2FA_URL = process.env.NEXT_PUBLIC_VERIFY_2FA_URL;
  const url = `${BASE_URL}/${AUTH_URL}/${VERIFY_2FA_URL}`;

  const response = await axiosInstance.post<Verify2FAResponse>(url, { hash });
  return response.data;
};

export const resetPassword = async (token: string, newPassword: string) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "auth";
  const RESET_PASSWORD_URL = process.env.NEXT_PUBLIC_RESET_PASSWORD_URL;
  const url = `${BASE_URL}/${AUTH_URL}/${RESET_PASSWORD_URL}/${token}`;

  return axiosInstance.post(url, { newPassword });
};
