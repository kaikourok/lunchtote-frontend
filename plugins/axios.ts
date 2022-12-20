import axiosBase from 'axios';

const apiPath = process.env.NEXT_PUBLIC_API_PATH!;
const serverBackendURL = process.env.BACKEND_URL;
const publicBackendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const axios = axiosBase.create({
  baseURL: (process.browser ? publicBackendURL : serverBackendURL) + apiPath,
  withCredentials: true,
});

export default axios;
