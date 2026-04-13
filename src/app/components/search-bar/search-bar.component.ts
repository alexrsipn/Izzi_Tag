import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.component.html'
})
export class SearchBarComponent {
  @Output() search = new EventEmitter<string>();
  tagValue: string = '';

  onSearch() {
    if (this.tagValue.trim()) {
      this.search.emit(this.tagValue.trim());
    }
  }
}
