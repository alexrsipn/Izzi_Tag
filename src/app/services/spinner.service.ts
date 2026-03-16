import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  loadingCount = new BehaviorSubject<number>(0);

  show() {
    this.loadingCount.next(this.loadingCount.value + 1);
  }

  hide() {
    this.loadingCount.next(this.loadingCount.value - 1);
  }

  isLoading(): Observable<boolean> {
    return this.getLoadingCount().pipe(
      map((count) => count > 0),
      distinctUntilChanged()
    );
  }

  getLoadingCount(): Observable<number> {
    return this.loadingCount.asObservable();
  }
}
