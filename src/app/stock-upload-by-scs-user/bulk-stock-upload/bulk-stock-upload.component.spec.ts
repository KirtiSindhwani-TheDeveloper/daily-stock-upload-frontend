import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkStockUploadComponent } from './bulk-stock-upload.component';

describe('BulkStockUploadComponent', () => {
  let component: BulkStockUploadComponent;
  let fixture: ComponentFixture<BulkStockUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkStockUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkStockUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
