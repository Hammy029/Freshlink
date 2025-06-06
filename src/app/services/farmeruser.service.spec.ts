import { TestBed } from '@angular/core/testing';

import { FarmeruserService } from './farmeruser.service';

describe('FarmeruserService', () => {
  let service: FarmeruserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmeruserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
