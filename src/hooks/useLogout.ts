import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './index';
import { baseApi } from '../store/api/baseApi';
import { logout } from '../store/auth/authSlice';
import { useLogoutRequestMutation } from '../store/auth/authApi';

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutRequest, { isLoading }] = useLogoutRequestMutation();

  const handleLogout = async () => {
    try {
      await logoutRequest().unwrap();   // revokes the token on the server
    } catch {
      // Even if the request fails (offline, token already expired), still log out locally
    }
    dispatch(logout());
    dispatch(baseApi.util.resetApiState());
    navigate('/login', { replace: true });
  };

  return { logout: handleLogout, isLoading };
}