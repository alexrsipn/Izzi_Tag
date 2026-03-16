import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerService } from '../../services/spinner.service';

@Component({
    selector: 'app-spinner',
    imports: [CommonModule, MatProgressSpinnerModule],
    template: `
    <div class="loader" *ngIf="loading$ | async">
      <mat-spinner></mat-spinner>
    </div>
  `,
    styles: [
        `
      .loader {
        position: fixed;
        width: 100%;
        left: 0;
        top: 0;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0.7);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `,
    ]
})
export class SpinnerComponent {
  loading$ = this.loading.isLoading();

  constructor(public loading: SpinnerService) {}
}
