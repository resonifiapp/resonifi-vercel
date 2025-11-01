// Retry utility for network requests
export async function retryAsync(fn, options = {}) {
  const {
    retries = 3,
    delay = 1000,
    backoff = true,
    onRetry = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if it's the last attempt
      if (attempt === retries) break;

      // Check if it's a network error worth retrying
      const isNetworkError = 
        error.message?.includes('Network Error') ||
        error.message?.includes('Failed to fetch') ||
        error.code === 'ERR_NETWORK' ||
        error.name === 'NetworkError';

      if (!isNetworkError) {
        // If it's not a network error, don't retry
        throw error;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, retries, error);
      }

      // Wait before retrying (with exponential backoff if enabled)
      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

// Check if device is online
export function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

// Wait for device to come back online
export function waitForOnline(timeout = 30000) {
  return new Promise((resolve, reject) => {
    if (navigator.onLine) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      window.removeEventListener('online', handleOnline);
      reject(new Error('Timeout waiting for connection'));
    }, timeout);

    const handleOnline = () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      resolve();
    };

    window.addEventListener('online', handleOnline);
  });
}