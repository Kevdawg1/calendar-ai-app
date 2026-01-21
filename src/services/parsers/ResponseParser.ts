import { IResponseParser } from '../interfaces/IResponseParser';

/**
 * Response parser implementation
 * Follows Single Responsibility Principle - only handles response parsing
 */
export class ResponseParser implements IResponseParser {
  parse<T = any>(response: string): T {
    try {
      return JSON.parse(response) as T;
    } catch (error) {
      console.error('Error parsing response:', error);
      throw new Error('Failed to parse response as JSON');
    }
  }

  extractArray<T = any>(response: any, key?: string): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    if (typeof response === 'object' && response !== null) {
      if (key && response[key] && Array.isArray(response[key])) {
        return response[key] as T[];
      }

      // Try common keys
      const commonKeys = ['tasks', 'data', 'items', 'results', 'components', 'subtasks', 'dependencies', 'conflicts'];
      for (const commonKey of commonKeys) {
        if (response[commonKey] && Array.isArray(response[commonKey])) {
          return response[commonKey] as T[];
        }
      }

      // Try to find any array property
      const arrayProps = Object.values(response).filter((val) => Array.isArray(val));
      if (arrayProps.length > 0) {
        return arrayProps[0] as T[];
      }
    }

    throw new Error(`No array found in response${key ? ` with key "${key}"` : ''}`);
  }

  validateTaskArray(tasks: any[], context: string): any[] {
    if (!tasks || !Array.isArray(tasks)) {
      throw new Error(`Invalid ${context} format: expected array`);
    }
    return tasks;
  }
}

