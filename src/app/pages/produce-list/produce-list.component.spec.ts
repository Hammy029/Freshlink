import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProduceListComponent } from './produce-list.component';

describe('ProduceListComponent', () => {
  let component: ProduceListComponent;
  let fixture: ComponentFixture<ProduceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProduceListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProduceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
