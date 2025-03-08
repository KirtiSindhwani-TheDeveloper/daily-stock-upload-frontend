import { TestBed } from '@angular/core/testing';

import { StockUploadBySpmService } from './stock-upload-by-spm.service';

describe('StockUploadBySpmService', () => {
  let service: StockUploadBySpmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockUploadBySpmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
