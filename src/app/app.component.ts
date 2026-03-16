import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OfsMessageService } from './services/ofs-message.service';
import { Store } from './plugin.store';
import { SpinnerComponent } from './shared/spinner/spinner.component';

@Component({
    selector: 'app-root',
    template: `
    <router-outlet></router-outlet>
    <app-spinner></app-spinner>
  `,
    imports: [RouterModule, SpinnerComponent]
})
export class AppComponent {
  constructor(
    private readonly ofs: OfsMessageService,
    private readonly store: Store
  ) {
    ofs.getMessage().subscribe(ofs.message);
  }
}
