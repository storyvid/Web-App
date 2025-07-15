// Custom Redux hooks for easier usage throughout the app
import { useSelector, useDispatch } from 'react-redux';

// Auth hooks
export const useAuth = () => {
  const auth = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  return {
    ...auth,
    dispatch
  };
};

// Projects hooks
export const useProjects = () => {
  const projects = useSelector(state => state.projects);
  const dispatch = useDispatch();
  
  return {
    ...projects,
    dispatch
  };
};

// Dashboard hooks
export const useDashboard = () => {
  const dashboard = useSelector(state => state.dashboard);
  const dispatch = useDispatch();
  
  return {
    ...dashboard,
    dispatch
  };
};

// UI hooks
export const useUI = () => {
  const ui = useSelector(state => state.ui);
  const dispatch = useDispatch();
  
  return {
    ...ui,
    dispatch
  };
};

// General Redux hook
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;