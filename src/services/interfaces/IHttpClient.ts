/**
 * Interface for HTTP client implementations
 * Follows Dependency Inversion Principle
 */
export interface IHttpClient {
  post<T = any>(
    url: string,
    data: any,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<T>>;
}

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

