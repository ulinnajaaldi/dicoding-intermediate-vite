import { BASE_URL } from '../constants/config';

const ENDPOINTS = {
  ENDPOINT: `${BASE_URL}/your/endpoint/here`,
};

export async function getData() {
  const fetchResponse = await fetch(ENDPOINTS.ENDPOINT);
  return await fetchResponse.json();
}
