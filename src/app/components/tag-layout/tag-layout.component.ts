import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from 'src/app/plugin.store';
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { ScanComponent } from "../scan/scan.component";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { DialogService } from '../../services/dialog.service';
import { ActivitySearchItem } from '../../types/ofs-rest-api';

@Component({
  selector: 'app-tag-layout',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, ScanComponent, MatExpansionModule, MatButtonModule],
  templateUrl: './tag-layout.component.html'
})
export class TagLayoutComponent {
  protected vm$ = this.store.vm$;

  constructor(
    protected readonly store: Store,
    private readonly dialogService: DialogService
  ) {}

  handleSearch(tag: string) {
    this.store.searchByTag(tag);
  }

  resetSearch() {
    this.store.clearSearch();
  }

  assign(activity: ActivitySearchItem) {
    this.dialogService.confirmAssign(activity.apptNumber!).subscribe(result => {
      if (result) {
        this.store.selfAssign(activity.activityId);
      }
    });
  }

  loadMore(group: string) {
    this.store.showMoreItems(group);
  }

  objectKeys(obj: any) { return Object.keys(obj); }
}
