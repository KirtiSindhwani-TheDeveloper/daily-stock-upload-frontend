import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockUploadMappingComponent } from './stock-upload-mapping/stock-upload-mapping.component';

const routes: Routes = [

  {
    path:'stock-upload',
    component:StockUploadMappingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MappingRoutingModule { }
