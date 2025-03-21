import { TestBed } from '@angular/core/testing';

import { StockUploadByUserService } from './stock-upload-by-user.service';

describe('StockUploadByUserService', () => {
  let service: StockUploadByUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockUploadByUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
