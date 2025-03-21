import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiLocationComponent } from './multi-location.component';

describe('MultiLocationComponent', () => {
  let component: MultiLocationComponent;
  let fixture: ComponentFixture<MultiLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
