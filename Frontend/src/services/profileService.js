import api from "./api";

// Fetch user profile
export const getUserProfile = async () => {
    const response = await api.get("/auth/profil");
    return response.data;
};
