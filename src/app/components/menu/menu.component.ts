import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '../../models/menu.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  @Input() isVisible: boolean = false;
  isExpanded: boolean = false;
  @Output() onExpanded: EventEmitter<boolean> = new EventEmitter<boolean>();
  isLoggedIn: boolean = false;
  isWorkationRequestActive: boolean = false;
  menuItems: MenuItem[] = [];

  constructor(private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.menuItems = [
      {
        icon: 'your_trips',
        label: 'Requests list',
        route: 'workation-list',
        active: false,
      },
      {
        icon: 'upload_file',
        label: 'Upload CSV',
        route: 'upload-csv',
        active: false,
      },
    ];
  }

  navigate(selectedItem: MenuItem): void {
    this.menuItems.forEach((item) => {
      item.active = item === selectedItem;
    });
    selectedItem.active = true;
    this.router.navigate([selectedItem.route]);
  }

  createWorkationRequest(): void {
    this.isWorkationRequestActive = true;
    this.router.navigate(['workation-request']);
  }

  logout(): void {
    this.router.navigate(['login']);
    if (this.isLoggedIn) {
      localStorage.clear();
      sessionStorage.clear();
      this.isLoggedIn = false;
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
    this.onExpanded.emit(this.isExpanded);
  }
}
