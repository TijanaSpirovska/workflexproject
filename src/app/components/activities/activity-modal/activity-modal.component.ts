import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivityDto } from '../../../models/activity.model';

@Component({
  selector: 'app-activity-modal',
  standalone: false,
  templateUrl: './activity-modal.component.html',
  styleUrls: ['./activity-modal.component.scss'],
})
export class ActivityModalComponent implements OnInit, OnChanges {
  @Input() formGroup!: FormGroup;
  @Input() isOpen: boolean = false;
  @Input() isEdit: boolean = false;
  @Input() activity: ActivityDto | null = null;
  @Input() isFormValid: boolean = false;
  @Input() imagePreviewUrl: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() fileChange = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    // React to input changes if needed
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }
  onFileSelected(event: any): void {
    this.fileChange.emit(event);
  }

  removeImage(): void {
    // Create a custom event that signals image removal
    const removeEvent = { type: 'remove' };
    this.fileChange.emit(removeEvent);
  }
}
