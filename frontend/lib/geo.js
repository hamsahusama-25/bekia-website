// Wraps navigator.geolocation in a promise that resolves to { lng, lat }.
export function getPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('المتصفح لا يدعم تحديد الموقع'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      () => reject(new Error('تعذر تحديد موقعك، فعّل صلاحية الموقع وحاول مرة أخرى')),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
