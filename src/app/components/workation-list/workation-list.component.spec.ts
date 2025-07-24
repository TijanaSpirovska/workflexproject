import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkationListComponent } from './workation-list.component';

describe('WorkationListComponent', () => {
  let component: WorkationListComponent;
  let fixture: ComponentFixture<WorkationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
