import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockUploadMappingComponent } from './stock-upload-mapping.component';

describe('StockUploadMappingComponent', () => {
  let component: StockUploadMappingComponent;
  let fixture: ComponentFixture<StockUploadMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockUploadMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockUploadMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
