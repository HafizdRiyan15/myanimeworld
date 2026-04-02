// Simple auth helpers using localStorage
export const saveToken = (token) => localStorage.setItem('maw_token', token);
export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('maw_token') : null);
export const removeToken = () => localStorage.removeItem('maw_token');
export const saveUser = (user) => localStorage.setItem('maw_user', JSON.stringify(user));
export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('maw_user')); } catch { return null; }
};
export const clearAuth = () => { removeToken(); localStorage.removeItem('maw_user'); };
