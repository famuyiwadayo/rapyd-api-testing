import axios, { AxiosRequestConfig } from "axios";

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const errorData = {
      ...error?.response?.data,
    };
    return Promise.reject(errorData);
  }
);

const makeRequest = <D, R>(config: AxiosRequestConfig<D>) => {
  return axios.request<R>({ ...config });
};

export default makeRequest;
