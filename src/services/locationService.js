export function getCurrentPosition(options = {}) {
    if (!('geolocation' in navigator)) {
      return Promise.reject(new Error('Geolocation is not supported in this browser.'));
    }
  
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60_000,
        ...options,
      });
    });
  }