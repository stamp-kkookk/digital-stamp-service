import apiClient from '../../../lib/api/axios';
import type { TerminalLoginRequest, TerminalLoginResponse } from '../types';

export const terminalLogin = async (credentials: TerminalLoginRequest): Promise<TerminalLoginResponse> => {
  const response = await apiClient.post('/v1/auth/login', credentials);
  return response.data;
};
