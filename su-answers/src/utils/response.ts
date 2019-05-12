/**
 * Util functions for sending responses
 */
export function sendSuccess(message?: string, data?: any, key?: string): any {
    return {
        status: 'OK',
        message,
        [key ? key : 'data']: data
    }
  }
  
  export function sendError(message?: string, data?: any) {
    return {
        status: 'error',
        error: message,
        data
    }
  }
  