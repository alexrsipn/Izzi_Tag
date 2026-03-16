import { finalize } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SpinnerService } from '../services/spinner.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(SpinnerService);

  loading.show();

  return next(req).pipe(finalize(() => loading.hide()));
};
