import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const getRefreshedToken = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) return refreshPromise;
  
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await axios.post(`${BASE_URL}/account/auth/refresh`, {}, { withCredentials: true });
      const { access_token } = res.data;
      useAuthStore.getState().setAccessToken(access_token);
      return access_token;
    } catch (error) {
      console.warn("Refresh failed: Logging out.");
      
      // Zustand 상태 초기화
      useAuthStore.getState().logout();

      if (typeof window !== 'undefined') {
        // [중요] 이미 로그인 페이지가 아닐 때만 이동
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
};

api.interceptors.request.use(async (config) => {
  let token = useAuthStore.getState().accessToken;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp - (Date.now() / 1000) < 60) {
        const newToken = await getRefreshedToken();
        if (newToken) token = newToken;
      }
    } catch (e) {}
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/account/auth/refresh')) return Promise.reject(err);
      originalRequest._retry = true;
      const newToken = await getRefreshedToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(err);
  }
);

export default api;