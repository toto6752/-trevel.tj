const API_BASE_URL = '/api';

export const api = {
  // Auth
  async login(credentials: any) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Properties
  async getProperties(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.city) params.append('city', filters.city);
    if (filters.type) params.append('type', filters.type);
    
    const res = await fetch(`${API_BASE_URL}/properties?${params.toString()}`);
    return res.json();
  },

  async getProperty(id: number) {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`);
    return res.json();
  },

  // Reviews
  async getReviews(propertyId: number) {
    const res = await fetch(`${API_BASE_URL}/reviews/${propertyId}`);
    return res.json();
  },

  async postReview(data: any, token: string) {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Chat
  async getMessages(recipientId: number) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/chat/${recipientId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async sendMessage(data: any) {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
