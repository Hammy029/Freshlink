import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsercategoryComponent } from './usercategory.component';

describe('UsercategoryComponent', () => {
  let component: UsercategoryComponent;
  let fixture: ComponentFixture<UsercategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsercategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsercategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
