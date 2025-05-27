import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';

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
  @Input() isLoggedIn: boolean = false;
  isNewTripActive: boolean = false;

  constructor(private router: Router, private eRef: ElementRef) {}

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined') {
      this.isLoggedIn = localStorage.getItem('authToken') != null;
    }
  }
  menuItems = [
    { icon: 'your_trips', label: 'My trips', route: 'my-trips', active: false },
    {
      icon: 'location_city',
      label: 'Accommodation',
      route: 'accommodation',
      active: false,
    },
    // {
    //   icon: 'map',
    //   label: 'Destinations',
    //   route: 'destinations',
    //   active: false,
    // },
    {
      icon: 'local_see',
      label: 'Activity',
      route: 'activities',
      active: false,
    },
  ];

  navigate(selectedItem: any) {
    this.menuItems.forEach((item) => {
      item.active = item === selectedItem;
    });
    selectedItem.active = true;
    this.router.navigate([selectedItem.route]);
  }

  createNewTrip() {
    this.isNewTripActive = true;
    this.router.navigate(['new-trip']);
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
