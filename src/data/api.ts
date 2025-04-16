import { BASE_URL } from '../constants/config';

export const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  ALL_STORIES: `${BASE_URL}/stories`,
};

export async function getRegistered({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}

export async function getLogin({ email, password }: { email: string; password: string }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}
