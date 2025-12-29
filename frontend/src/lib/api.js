import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const cookieUtils = {
  getCookie(name) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },
  getJSONCookie(name) {
    const value = this.getCookie(name);
    if (!value) return null;
    try { return JSON.parse(decodeURIComponent(value)); } 
    catch (e) { return null; }
  },
  getUserInfo() {
    return this.getJSONCookie('user_info');
  },
};

export const authAPI = {
  loginWithGoogle() {
    window.location.href = `${API_URL}/auth/google`;
  },
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return { authenticated: false, user: null };
    }
  },
};

export const forumAPI = {
  async getCategories() {
    const response = await api.get('/api/categories');
    return response.data;
  },
  async getPosts(category = 'all', page = 1) {
    const response = await api.get('/api/forum/posts', { params: { category, page } });
    return response.data;
  },
};

export const progressAPI = {
  async getProgress() {
    const response = await api.get('/api/progress');
    return response.data;
  },
  async updateProgress(courseId, completed) {
    const response = await api.post('/api/progress', { courseId, completed });
    return response.data;
  },
};

export default api;
