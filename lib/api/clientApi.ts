import { api } from './api';
import { User } from '@/types/user';

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateUserDto {
  username?: string;
  avatar?: string;
}

export const register = async (dto: RegisterDto): Promise<User> => {
  const { data } = await api.post<User>('/auth/register', dto);
  return data;
};

export const login = async (dto: LoginDto): Promise<User> => {
  const { data } = await api.post<User>('/auth/login', dto);
  return data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const checkSession = async (): Promise<User | null> => {
  const { data } = await api.get<User | null>('/auth/session');
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await api.get<User>('/users/me');
  return data;
};

export const updateMe = async (dto: UpdateUserDto): Promise<User> => {
  const { data } = await api.patch<User>('/users/me', dto);
  return data;
};

export const fetchNotes = async (params?: Record<string, unknown>) => {
  const { data } = await api.get('/notes', { params });
  return data;
};

export const fetchNoteById = async (id: string) => {
  const { data } = await api.get(`/notes/${id}`);
  return data;
};

export const createNote = async (dto: { title: string; content: string; tag: string }) => {
  const { data } = await api.post('/notes', dto);
  return data;
};

export const deleteNote = async (id: string) => {
  const { data } = await api.delete(`/notes/${id}`);
  return data;
};
