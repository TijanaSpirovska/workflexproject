import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  standalone: false,
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  @Input() items: { label: string; active: boolean }[] = [];
  @Output() navigate = new EventEmitter<number>();

  onNavigate(index: number): void {
    this.navigate.emit(index);
  }
}
