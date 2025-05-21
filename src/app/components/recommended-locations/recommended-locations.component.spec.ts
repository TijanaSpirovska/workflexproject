import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedLocationsComponent } from './recommended-locations.component';

describe('RecommendedLocationsComponent', () => {
  let component: RecommendedLocationsComponent;
  let fixture: ComponentFixture<RecommendedLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecommendedLocationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecommendedLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
