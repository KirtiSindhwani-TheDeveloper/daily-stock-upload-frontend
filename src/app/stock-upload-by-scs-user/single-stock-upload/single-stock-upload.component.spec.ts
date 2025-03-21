import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleStockUploadComponent } from './single-stock-upload.component';

describe('SingleStockUploadComponent', () => {
  let component: SingleStockUploadComponent;
  let fixture: ComponentFixture<SingleStockUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleStockUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleStockUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
