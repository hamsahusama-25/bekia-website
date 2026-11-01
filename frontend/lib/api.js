// Small fetch wrapper for the Loop Eco API. All endpoints answer with
// { success, requestId, data } or { success: false, error: { code, message, details } }.

const TOKEN_KEY = 'loopeco.session';

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
  } catch {
    /* storage can be blocked; the user just has to sign in again */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = 'GET', json, form, blob } = {}) {
  const headers = {};
  const session = getSession();
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  let body;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form; // the browser sets the multipart boundary itself
  }

  let res;
  try {
    res = await fetch(`/api${path}`, { method, headers, body });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'تعذر الاتصال بالخادم');
  }

  if (blob && res.ok) return res.blob();

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.success) {
    const err = payload?.error || {};
    if (res.status === 401 && err.code !== 'INVALID_CREDENTIALS') {
      clearSession();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    throw new ApiError(res.status, err.code || 'ERROR', err.message || 'حدث خطأ غير متوقع', err.details);
  }
  return payload.data;
}

export const api = {
  get: (path) => request(path),
  post: (path, json) => request(path, { method: 'POST', json }),
  put: (path, json) => request(path, { method: 'PUT', json }),
  patch: (path, json) => request(path, { method: 'PATCH', json }),
  postForm: (path, form) => request(path, { method: 'POST', form }),
  getBlob: (path) => request(path, { blob: true }),
};

// User-facing Arabic messages for the error codes the UI can meet.
const MESSAGES = {
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  DUPLICATE: 'البريد الإلكتروني أو رقم الهاتف مسجل من قبل',
  INVALID_PACKAGE: 'الباقة المختارة غير متاحة',
  VALIDATION_ERROR: 'راجع البيانات المدخلة',
  COLLECTOR_NOT_APPROVED: 'حسابك في انتظار موافقة الإدارة',
  DOCUMENTS_INCOMPLETE: 'مستندات المندوب غير مكتملة',
  INVALID_QR_HANDSHAKE: 'كود QR لا يطابق هذه الشحنة',
  MISSING_SCALE_PHOTO: 'صورة الميزان مطلوبة',
  INVALID_IMAGE: 'الملف ليس صورة صالحة (JPG أو PNG أو WebP)',
  FILE_TOO_LARGE: 'حجم الصورة أكبر من 5 ميجابايت',
  GPS_VERIFICATION_FAILED: 'موقعك بعيد عن الشركة، لا يمكن تسجيل عدم الاستجابة',
  PICKUP_NOT_SCHEDULED: 'تم التعامل مع هذه الشحنة من قبل',
  PICKUP_NOT_PENDING: 'هذه الشحنة ليست في انتظار الاعتماد',
  TOO_MANY_REQUESTS: 'محاولات كثيرة، حاول لاحقًا',
  NETWORK_ERROR: 'تعذر الاتصال بالخادم',
};

export function errorMessage(err) {
  if (err instanceof ApiError) return MESSAGES[err.code] || err.message;
  return 'حدث خطأ غير متوقع';
}
