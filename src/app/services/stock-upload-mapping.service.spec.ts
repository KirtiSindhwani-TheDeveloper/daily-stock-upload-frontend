import { TestBed } from '@angular/core/testing';

import { StockUploadMappingService } from './stock-upload-mapping.service';

describe('StockUploadMappingService', () => {
  let service: StockUploadMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockUploadMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
