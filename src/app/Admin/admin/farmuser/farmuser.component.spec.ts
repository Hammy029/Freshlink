import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmuserComponent } from './farmuser.component';

describe('FarmuserComponent', () => {
  let component: FarmuserComponent;
  let fixture: ComponentFixture<FarmuserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmuserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmuserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
