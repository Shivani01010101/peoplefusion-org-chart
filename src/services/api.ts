import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// Base URL for the API
const BASE_URL = "https://worksync.global/api";

// Non-expiring authentication token for development
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjo2LCJ1c2VybmFtZSI6ImRhbmllbCIsImNvbXBhbnlfaWQiOjEsImVtcGxveWVlX2lkIjo1LCJ1c2VyX2ZpcnN0bmFtZSI6IkRhbmllbCIsInVzZXJfbGFzdG5hbWUiOiJZZWJvYWgiLCJ1c2VyX2VtYWlsIjoiIiwidXNlcl9waG9uZSI6bnVsbCwidXNlcl9zdGF0dXMiOiJBQ1RJVkUiLCJ1c2VyX3BpYyI6bnVsbCwidXNlcl90aHVtYiI6bnVsbCwicGFzc3dvcmRfcmVzZXQiOm51bGwsInJvbGVfdmlldyI6ZmFsc2UsInJvbGVfZWRpdCI6ZmFsc2UsImdyb3VwX3ZpZXciOmZhbHNlLCJncm91cF9lZGl0IjpmYWxzZSwiY291bnRyeSI6bnVsbCwidGltZXpvbmUiOm51bGwsInByZWZlcnJlZF9sYW5ndWFnZSI6bnVsbCwiaXNfbWFzdGVyIjpmYWxzZSwibG9ja2VkIjpmYWxzZSwidXBkYXRlZF9ieSI6bnVsbCwidXBkYXRlZF9hdCI6bnVsbCwic2Vzc2lvbl9pZCI6MzAwNiwiZ3JvdXBzIjpbMiw3LDMxLDQ4LDU1XSwicm9sZXMiOlszLDIwLDgsOSwxOSwxMCwxLDE4LDZdLCJwcm9maWxlX3BpYyI6ImVtcGxveWVlcy8xL2QyNzQzZjUyLTk2NjQtNDQ1YS05NDk5LTFkNjk4MWMxYzBjOC5wbmcifQ.SKa1Q0ObZMQI9jIp0qvJG2goPLkTL6xs2RFc5K_6b5U";

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach Authorization Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach the Bearer token to all requests
    if (AUTH_TOKEN && config.headers) {
      config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Global error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          console.error(
            "Unauthorized: Authentication token may be invalid or expired"
          );
          // You could redirect to login here if needed
          break;
        case 403:
          console.error(
            "Forbidden: You do not have permission to access this resource"
          );
          break;
        case 404:
          console.error("Not Found: The requested resource was not found");
          break;
        case 500:
          console.error("Internal Server Error: Please try again later");
          break;
        default:
          console.error(
            `API Error (${status}):`,
            data?.message || error.message
          );
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error(
        "Network Error: No response received from server. Please check your connection."
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request Error:", error.message);
    }

    // Return a rejected promise so the calling code can handle it
    return Promise.reject(error);
  }
);

export default apiClient;
