import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockUploadMappingComponent } from './stock-upload-mapping/stock-upload-mapping.component';
import { DealerLocationMappingComponent } from './dealer-location-mapping/dealer-location-mapping.component';

const routes: Routes = [

  {
    path:'stock-upload',
    component:StockUploadMappingComponent
  },

  {
    path:'dealer-location',
    component:DealerLocationMappingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MappingRoutingModule { }
