import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivityDto } from '../../../models/activity.model';

@Component({
  selector: 'app-activity-card',
  standalone: false,
  templateUrl: './activity-card.component.html',
  styleUrls: ['./activity-card.component.scss'],
})
export class ActivityCardComponent {
  @Input() activity!: ActivityDto;
  @Output() edit = new EventEmitter<ActivityDto>();
  @Output() delete = new EventEmitter<ActivityDto>();
  @Output() focusOnMap = new EventEmitter<ActivityDto>();

  constructor() {}

  onEdit(): void {
    this.edit.emit(this.activity);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.activity);
  }

  onFocusMap(event: Event): void {
    event.stopPropagation();
    this.focusOnMap.emit(this.activity);
  }

  // Helper methods
  getMonth(dateString: string): string {
    return new Date(dateString)
      .toLocaleString('default', { month: 'short' })
      .toUpperCase();
  }

  getDay(dateString: string): string {
    return new Date(dateString).getDate().toString().padStart(2, '0');
  }
}
