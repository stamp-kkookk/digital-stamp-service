import axios from 'axios'

/**
 * Axios instance for API calls
 *
 * Base URL points to the backend API.
 * JWT token will be added via interceptor when auth is implemented.
 */

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
})

// Request interceptor (for adding auth token later)
axiosInstance.interceptors.request.use(
    (config) => {
        // TODO: Add JWT token from auth context/store
        // const token = getAuthToken()
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`
        // }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor (for error handling)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // TODO: Handle 401/403 errors, redirect to login
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
    }
)

export default axiosInstance
