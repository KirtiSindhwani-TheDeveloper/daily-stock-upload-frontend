import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleStockUploadComponent } from './single-stock-upload/single-stock-upload.component';
import { BulkStockUploadComponent } from './bulk-stock-upload/bulk-stock-upload.component';

const routes: Routes = [

  {
    path:'sl',component:SingleStockUploadComponent
  },
  {
    path:'ml',component:BulkStockUploadComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockUploadByScsUserRoutingModule { }
