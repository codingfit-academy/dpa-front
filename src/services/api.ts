export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  getUser: async (id: number): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },
  createUser: async (name: string, email: string): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },
};
