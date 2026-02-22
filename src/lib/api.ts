import axios from 'axios';

// Base URL for Laravel API
// Assumes Laravel is running on port 8000
// Use environment variables or fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE_URL}/api`;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add interceptor for auth tokens
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If it doesn't already contain /storage/ and it's a relative path, assume it needs it
    const finalPath = cleanPath.startsWith('/storage/') ? cleanPath : `/storage${cleanPath}`;

    return `${API_BASE_URL}${finalPath}`;
};
