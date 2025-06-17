import { TestBed } from '@angular/core/testing';

import { FarmuserService } from './farmuser.service';

describe('FarmuserService', () => {
  let service: FarmuserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmuserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
