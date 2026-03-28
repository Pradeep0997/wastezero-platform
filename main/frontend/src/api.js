// import axios from "axios";

// // 1. Create Axios Instance
// // Check if your backend is running on port 4000 or 5000. 
// // Your error log said 4000, so we use that here.
// const API = axios.create({
//   baseURL: "http://localhost:4000/api",
//   withCredentials: true,
// });
import axios from "axios";

// 1. Create Axios Instance
// In production, this will use the VITE_API_URL set in Vercel.
// In development, it will default to your localhost.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
});

// 2. Request Interceptor (Adds Token)
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor (Handles 401 Logout)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- API DEFINITIONS ---

export const adminAPI = {
  getAnalytics: async () => {
    const response = await API.get("/admin/analytics");
    return { success: true, data: response.data };
  },
  getAllUsers: async (params) => {
    const response = await API.get("/admin/users", { params });
    return { success: true, data: response.data };
  },
  toggleUserBlock: async (userId, reason) => {
    const response = await API.patch(`/admin/users/${userId}/block`, { reason });
    return { success: true, data: response.data, message: "User status updated" };
  },
};

export const legacyAdminAPI = {
  getWasteCollectionReport: async (period) => {
    try {
      const response = await API.get(`/admin/reports/waste?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, data: [] };
    }
  },
};

// --- THIS WAS MISSING ---
export const pickupAPI = {
  getMyPickups: async () => {
    try {
      // Adjust endpoint based on your backend routes (e.g., /pickups or /pickups/my)
      const response = await API.get("/pickups");
      return { success: true, data: response.data };
    } catch (error) {
      throw error;
    }
  },
  createPickup: async (pickupData) => {
    try {
      const response = await API.post("/pickups", pickupData);
      return { success: true, data: response.data };
    } catch (error) {
      throw error;
    }
  },
  getPickupStats: async () => {
    try {
      const response = await API.get("/pickups/stats");
      return { success: true, data: response.data };
    } catch (error) {
      // Return default stats on error to prevent UI crash
      return { 
        success: false, 
        data: { total: 0, pending: 0, inProgress: 0, completed: 0 } 
      };
    }
  },
  cancelPickup: async (id, reason) => {
    const response = await API.patch(`/pickups/${id}/cancel`, { reason });
    return { success: true, data: response.data };
  },
  // NGO Specific Actions
  acceptPickup: async (id) => {
    const response = await API.patch(`/pickups/${id}/accept`);
    return { success: true, data: response.data };
  },
  getAvailableAgents: async () => {
    // Assuming you have an endpoint to get agents
    const response = await API.get("/users?role=agent&status=active"); 
    return { success: true, data: response.data.users || response.data };
  },
  assignAgent: async (pickupId, agentId) => {
    const response = await API.patch(`/pickups/${pickupId}/assign`, { agentId });
    return { success: true, data: response.data };
  }
};

export default API;
