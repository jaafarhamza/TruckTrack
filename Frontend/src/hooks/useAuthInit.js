import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, setLoading, logout } from "../store/slices/authSlice";
import { validateToken } from "../services/authService";
import storage from "../utils/storage";

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken();
      const user = storage.getUser();

      if (!token || !user) {
        dispatch(setLoading(false));
        return;
      }

      // Restore credentials from storage
      dispatch(
        setCredentials({
          token,
          user,
        })
      );

      dispatch(setLoading(true)); 

      try {
        // Validate token in background
        const response = await validateToken();

        if (response.success) {
          // Update with fresh user data from server
          dispatch(
            setCredentials({
              token,
              user: response.data.user,
            })
          );
        } else {
          storage.clear();
          dispatch(logout());
        }
      } catch {
        // Token expired or invalid
        storage.clear();
        dispatch(logout());
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [dispatch]);
};

export default useAuthInit;
