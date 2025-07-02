import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MpesaStkPushComponent } from './mpesa-stk-push.component';

describe('MpesaStkPushComponent', () => {
  let component: MpesaStkPushComponent;
  let fixture: ComponentFixture<MpesaStkPushComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MpesaStkPushComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MpesaStkPushComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
