import { TestBed } from '@angular/core/testing';

import { GlobalBlockUiService } from './global-block-ui.service';

describe('GlobalBlockUiService', () => {
  let service: GlobalBlockUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalBlockUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
