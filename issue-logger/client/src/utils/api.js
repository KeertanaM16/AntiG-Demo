// API utility for authentication and issue management
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Token management
export const tokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// API request wrapper with automatic token refresh
const apiRequest = async (url, options = {}) => {
  const accessToken = tokenManager.getAccessToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  });

  // If token expired, try to refresh
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with new token
      headers['Authorization'] = `Bearer ${tokenManager.getAccessToken()}`;
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      // Refresh failed, logout
      tokenManager.clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
};

// Authentication API
export const authAPI = {
  register: async (email, password, fullName) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
      credentials: 'include',
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await response.json();
    
    if (response.ok) {
      tokenManager.setTokens(data.accessToken, data.refreshToken);
      tokenManager.setUser(data.user);
    }
    
    return data;
  },

  logout: async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      tokenManager.clearTokens();
    }
  },

  getProfile: async () => {
    const response = await apiRequest('/api/auth/profile');
    return response.json();
  },
};

// Refresh access token
const refreshAccessToken = async () => {
  try {
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      tokenManager.setTokens(data.accessToken, tokenManager.getRefreshToken());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Issues API
export const issuesAPI = {
  getAll: async () => {
    const response = await apiRequest('/api/issues');
    return response.json();
  },

  create: async (issueText) => {
    try {
      const response = await apiRequest('/api/issues', {
        method: 'POST',
        body: JSON.stringify({ issue_text: issueText }),
      });
      
      // Check if response is successful
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to create issue. Server returned ${response.status}`
        );
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating issue:', error);
      return { 
        error: error.message || 'Failed to create issue. Please try again.'
      };
    }
  },

  update: async (id, issueText) => {
    const response = await apiRequest(`/api/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ issue_text: issueText }),
    });
    return response.json();
  },

  delete: async (id) => {
    const response = await apiRequest(`/api/issues/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!tokenManager.getAccessToken();
};

// Check if user is admin
export const isAdmin = () => {
  const user = tokenManager.getUser();
  return user?.role === 'admin';
};
