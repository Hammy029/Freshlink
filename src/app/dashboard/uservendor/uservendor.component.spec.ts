import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UservendorComponent } from './uservendor.component';

describe('UservendorComponent', () => {
  let component: UservendorComponent;
  let fixture: ComponentFixture<UservendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UservendorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UservendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
