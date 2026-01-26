import axios, { AxiosError } from 'axios'

export interface ApiErrorResponse {
    code?: string
    message: string
    timestamp?: string
}

export class ApiError extends Error {
    public status?: number
    public code?: string
    public timestamp?: string

    constructor(message: string, status?: number, code?: string, timestamp?: string) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.code = code
        this.timestamp = timestamp
    }
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // TODO: Add authentication token when auth is implemented
        // const token = localStorage.getItem('authToken')
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`
        // }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response
    },
    (error: AxiosError<ApiErrorResponse>) => {
        // Network error (no response)
        if (!error.response) {
            return Promise.reject(
                new ApiError(
                    '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.',
                    undefined,
                    'NETWORK_ERROR'
                )
            )
        }

        const status = error.response.status
        const data = error.response.data

        // Create detailed error message
        let message = data?.message || '알 수 없는 오류가 발생했습니다.'

        // Common status code messages
        if (status === 401) {
            message = '인증이 필요합니다. 다시 로그인해주세요.'
        } else if (status === 403) {
            message = '접근 권한이 없습니다.'
        } else if (status === 404) {
            message = '요청한 리소스를 찾을 수 없습니다.'
        } else if (status === 409) {
            // Keep backend message for conflict errors (e.g., "이미 활성화된 스탬프 카드가 존재합니다")
            message = data?.message || '요청을 처리할 수 없습니다.'
        } else if (status >= 500) {
            message = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        }

        return Promise.reject(new ApiError(message, status, data?.code, data?.timestamp))
    }
)

export default apiClient
