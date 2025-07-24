import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { WorkationService } from '../../services/workation.service';
import { ToastrService } from 'ngx-toastr';
import { isPlatformBrowser } from '@angular/common';
import { WorkationDto } from '../../models/workation.model';

@Component({
  selector: 'app-workation-list',
  standalone: false,
  templateUrl: './workation-list.component.html',
  styleUrls: ['./workation-list.component.scss'],
})
export class WorkationListComponent implements OnInit {
  workations: WorkationDto[] = [];
  sortDirection: boolean = true;

  constructor(
    private workationService: WorkationService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadWorkations();
    }
  }

  loadWorkations(): void {
    this.workationService.getAll().subscribe({
      next: (data) => {
        this.workations = data;
      },
      error: () => {
        this.toastr.error('Failed to load workation requests');
      },
    });
  }

  sortTable(column: keyof WorkationDto) {
    this.sortDirection = !this.sortDirection;
    this.workations.sort((a, b) => {
      if (a[column] < b[column]) return this.sortDirection ? -1 : 1;
      if (a[column] > b[column]) return this.sortDirection ? 1 : -1;
      return 0;
    });
  }

  getCountryCode(country: string): string {
    const map: { [key: string]: string } = {
      Germany: 'de',
      'United States': 'us',
      Ukraine: 'ua',
      Belgium: 'be',
      Spain: 'es',
      Greece: 'gr',
      India: 'in',
    };
    return map[country] || '';
  }
}
