import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityDto } from '../../../models/activity.model';

@Component({
  selector: 'app-activity-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-popup.component.html',
  styleUrl: './activity-popup.component.scss',
})
export class ActivityPopupComponent implements OnInit {
  @Input() activity!: ActivityDto;
  @Input() locationDisplay: string = '';
  @Input() multipleActivities: ActivityDto[] = [];
  @Input() isMultiActivity: boolean = false;

  constructor() {}

  ngOnInit(): void {}

  /**
   * Format date to a localized string
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  /**
   * Format date to a short date format
   */
  formatShortDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
}
