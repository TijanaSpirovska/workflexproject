import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityPopupComponent } from './activity-popup.component';

describe('ActivityPopupComponent', () => {
  let component: ActivityPopupComponent;
  let fixture: ComponentFixture<ActivityPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityPopupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
