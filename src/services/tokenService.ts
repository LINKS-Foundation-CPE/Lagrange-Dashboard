import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

const TOKEN_KEY = "backendToken";

export const tokenService = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  setIdentity: (identity: string) => {
    localStorage.setItem("identity", identity);
  },

  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getIdentity: (): string | null => {
    return localStorage.getItem("identity");
  },

  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  decodeToken: (): DecodedToken | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (e) {
      console.error("Invalid token", e);
      return null;
    }
  },
};
