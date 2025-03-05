import { TestBed } from '@angular/core/testing';

import { DealerLocationMappingService } from './dealer-location-mapping.service';

describe('DealerLocationMappingService', () => {
  let service: DealerLocationMappingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DealerLocationMappingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
