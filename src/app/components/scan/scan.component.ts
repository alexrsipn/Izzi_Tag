import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Store } from 'src/app/plugin.store';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scan.component.html'
})
export class ScanComponent {
  @Output() scanSuccess = new EventEmitter<string>();
  @Input() disabled = false;

  constructor(private readonly store: Store) {}

  toggleScanner() {
    if (this.disabled) return;
    // Disparamos el scanner nativo de la App de OFS
    this.store.triggerNativeScan();
  }
}
