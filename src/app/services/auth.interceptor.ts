import { Injectable } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      req = cloned.clone();
      console.log('req:',req);
      console.log('cloned:',cloned);
      // return next(cloned);
    }
  }
  return next(req);
};