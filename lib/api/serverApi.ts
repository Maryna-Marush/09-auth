import { cookies } from 'next/headers';
import { api } from './api';
import { User } from '@/types/user';

const getAuthHeaders = async () => {
  const cookieStore = await cookies();

  return {
    headers: {
      Cookie: cookieStore.toString(),
    },
  };
};

export const checkSession = async () => {
  const config = await getAuthHeaders();

  return await api.get<User | null>('/auth/session', config);
};

export const getMe = async (): Promise<User> => {
  const config = await getAuthHeaders();
  const { data } = await api.get<User>('/users/me', config);

  return data;
};

export const fetchNotes = async (params?: Record<string, unknown>) => {
  const config = await getAuthHeaders();
  const { data } = await api.get('/notes', {
    ...config,
    params,
  });

  return data;
};

export const fetchNoteById = async (id: string) => {
  const config = await getAuthHeaders();
  const { data } = await api.get(`/notes/${id}`, config);

  return data;
};