import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerLocationMappingComponent } from './dealer-location-mapping.component';

describe('DealerLocationMappingComponent', () => {
  let component: DealerLocationMappingComponent;
  let fixture: ComponentFixture<DealerLocationMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealerLocationMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealerLocationMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
