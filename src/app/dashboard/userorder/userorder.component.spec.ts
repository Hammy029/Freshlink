import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserorderComponent } from './userorder.component';

describe('UserorderComponent', () => {
  let component: UserorderComponent;
  let fixture: ComponentFixture<UserorderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserorderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
