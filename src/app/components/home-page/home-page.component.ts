import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: false,
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  constructor(@Inject(DOCUMENT) private document: Document,private router: Router, ) {}
  ngOnInit(): void {
    this.document.body.style.overflowY = 'hidden';
  }

  openPage(){
    this.router.navigate(['workation-list']); 
  }
}
