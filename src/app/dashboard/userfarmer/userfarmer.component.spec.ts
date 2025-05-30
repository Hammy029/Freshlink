import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserfarmerComponent } from './userfarmer.component';

describe('UserfarmerComponent', () => {
  let component: UserfarmerComponent;
  let fixture: ComponentFixture<UserfarmerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserfarmerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserfarmerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
