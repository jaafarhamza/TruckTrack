import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, setLoading } from "../store/slices/authSlice";
import storage from "../utils/storage";

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = () => {
      dispatch(setLoading(true));

      try {
        const token = storage.getToken();
        const user = storage.getUser();

        // If both token and user exist, restore auth state
        if (token && user) {
          dispatch(setCredentials({ token, user }));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear data
        storage.clear();
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);
};

export default useAuthInit;
