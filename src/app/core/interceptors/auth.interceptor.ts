import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip auth for login and signup endpoints
  if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/signup')) {
    return next(req);
  }

  // Get token from localStorage
  const token = localStorage.getItem('accessToken');

  // If token exists, clone request and add Authorization header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  // No token, proceed with original request
  return next(req);
};
