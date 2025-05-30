import { TestBed } from '@angular/core/testing';

import { UsercategoryService } from './usercategory.service';

describe('UsercategoryService', () => {
  let service: UsercategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsercategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
