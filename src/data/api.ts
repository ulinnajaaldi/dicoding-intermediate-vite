import { BASE_URL } from '../constants/config';
import { IAddNewStory } from '../types/api';
import { getAccessToken } from '../utils/auth';

export const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  ALL_STORIES: `${BASE_URL}/stories`,
  ADD_NEW_STORY: `${BASE_URL}/stories`,
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

export async function getAllStories() {
  const accessToken = getAccessToken();

  const response = await fetch(`${ENDPOINTS.ALL_STORIES}?size=${12}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}

export async function getDetailStory(id: string) {
  const accessToken = getAccessToken();

  const response = await fetch(`${ENDPOINTS.ALL_STORIES}/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}

export async function mutateNewStory({ description, photo, lat, lon }: IAddNewStory) {
  const accessToken = getAccessToken();

  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  formData.append('lat', lat.toString());
  formData.append('lon', lon.toString());

  const response = await fetch(`${ENDPOINTS.ADD_NEW_STORY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const results = await response.json();

  return {
    ...results,
    ok: response.ok,
  };
}
