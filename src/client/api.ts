/// <reference types="vite/client" />
// Ensure API_BASE_URL is a clean string without trailing slash
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // Log for debugging
  console.log('VITE_API_URL env:', envUrl);

  // Robust check: if it's empty, 'undefined', a simple slash, includes localhost,
  // or is surprisingly short/numeric-looking (like "2"), default to relative /api
  if (!envUrl || 
      envUrl === 'undefined' || 
      envUrl === '/' || 
      envUrl.includes('localhost') ||
      (envUrl.length < 3 && !envUrl.startsWith('/'))
  ) {
    return '/api';
  }
  
  // Remove trailing slash
  let cleanUrl = envUrl.replace(/\/$/, '');
  
  // If it doesn't start with / or http, it's likely a misconfiguration
  if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
    console.warn('API URL misconfigured, falling back to /api. Value was:', cleanUrl);
    return '/api';
  }

  // Ensure absolute URLs end with /api if they don't already
  if (cleanUrl.startsWith('http') && !cleanUrl.endsWith('/api') && !cleanUrl.includes('/api/')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  
  return cleanUrl;
};

const API_BASE_URL = getApiBase();

async function handleResponse(res: Response, url: string) {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  
  if (!isJson) {
    const text = await res.text();
    console.error(`Non-JSON response received from ${url}:`, text);
    return { error: `Server error (${res.status}): Expected JSON but received ${contentType || 'no content'}. Path: ${url}` };
  }

  try {
    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || data.message || `Error ${res.status}` };
    }
    return data;
  } catch (err) {
    console.error(`JSON parse error from ${url}:`, err);
    return { error: 'Failed to parse server response as JSON' };
  }
}

export const api = {
  // Auth
  async login(credentials: any) {
    const url = `${API_BASE_URL}/auth/login`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res, url);
  },

  async register(data: any) {
    const url = `${API_BASE_URL}/auth/register`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res, url);
  },

  // Properties
  async getProperties(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.type) params.append('type', filters.type);
    
    const url = `${API_BASE_URL}/properties?${params.toString()}`;
    const res = await fetch(url);
    return handleResponse(res, url);
  },

  async getProperty(id: number) {
    const url = `${API_BASE_URL}/properties/${id}`;
    const res = await fetch(url);
    return handleResponse(res, url);
  },

  // Reviews
  async getReviews(propertyId: number) {
    const url = `${API_BASE_URL}/reviews/${propertyId}`;
    const res = await fetch(url);
    return handleResponse(res, url);
  },

  async getTourReviews(tourId: number) {
    const url = `${API_BASE_URL}/reviews/tour/${tourId}`;
    const res = await fetch(url);
    return handleResponse(res, url);
  },

  async postReview(data: any, token: string) {
    const url = `${API_BASE_URL}/reviews`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res, url);
  },

  // Chat
  async getMessages(recipientId: number) {
    const url = `${API_BASE_URL}/chat/${recipientId}`;
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res, url);
  },

  async sendMessage(data: any) {
    const url = `${API_BASE_URL}/chat`;
    const token = localStorage.getItem('token');
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res, url);
  },

  // Tours
  async getTours(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.city && filters.city !== 'Все') params.append('city', filters.city);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.q) params.append('q', filters.q);
    
    const url = `${API_BASE_URL}/tours?${params.toString()}`;
    const res = await fetch(url);
    return handleResponse(res, url);
  },

  async getTour(id: number) {
    const url = `${API_BASE_URL}/tours/${id}`;
    const res = await fetch(url);
    return handleResponse(res, url);
  },

  async createTour(data: any, token: string) {
    const url = `${API_BASE_URL}/tours`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res, url);
  },

  async updateTour(id: number, data: any, token: string) {
    const url = `${API_BASE_URL}/tours/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return handleResponse(res, url);
  },

  async deleteTour(id: number, token: string) {
    const url = `${API_BASE_URL}/tours/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res, url);
  },

  async getMyTours(token: string) {
    const url = `${API_BASE_URL}/tours/me/created`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res, url);
  },

  async getFavorites(token: string) {
    const url = `${API_BASE_URL}/tours/me/favorites`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res, url);
  },

  async toggleFavorite(tourId: number, isFavorite: boolean, token: string) {
    const method = isFavorite ? 'DELETE' : 'POST';
    const url = isFavorite 
      ? `${API_BASE_URL}/tours/me/favorites/${tourId}` 
      : `${API_BASE_URL}/tours/me/favorites`;
    
    const options: any = {
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    };
    
    if (!isFavorite) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify({ tourId });
    }
    
    const res = await fetch(url, options);
    return handleResponse(res, url);
  },

  async getHistory(token: string) {
    const url = `${API_BASE_URL}/tours/me/history`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(res, url);
  },

  // AI Assistant Context
  async getAiContext() {
    const url = `${API_BASE_URL}/ai/context`;
    try {
      const res = await fetch(url);
      return handleResponse(res, url);
    } catch (err) {
      console.error(`Fetch error from ${url}:`, err);
      return { tours: [], properties: [] };
    }
  }
};
