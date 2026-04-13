import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from 'src/app/plugin.store';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { ScanComponent } from "../scan/scan.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tag-layout',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, ScanComponent, MatExpansionModule, MatButtonModule],
  templateUrl: './tag-layout.component.html'
})
export class TagLayoutComponent {
  protected vm$ = this.store.vm$;

  constructor(protected readonly store: Store) {}

  handleSearch(tag: string) {
    this.store.searchByTag(tag);
  }

  resetSearch() {
    this.store.clearSearch();
  }

  assign(activityId: number) {
    this.store.selfAssign(activityId);
  }

  loadMore(group: string) {
    this.store.showMoreItems(group);
  }

  objectKeys(obj: any) { return Object.keys(obj); }
}
