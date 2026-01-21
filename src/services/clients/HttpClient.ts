import axios, { AxiosError } from 'axios';
import { IHttpClient, HttpRequestConfig, HttpResponse } from '../interfaces/IHttpClient';

/**
 * Axios-based HTTP client implementation
 * Follows Single Responsibility Principle - only handles HTTP requests
 */
export class HttpClient implements IHttpClient {
  async post<T = any>(
    url: string,
    data: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>> {
    try {
      const response = await axios.post<T>(url, data, {
        headers: config?.headers,
        timeout: config?.timeout,
      });

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(
          `HTTP Error: ${axiosError.response?.status} - ${axiosError.message}`
        );
      }
      throw error;
    }
  }
}

