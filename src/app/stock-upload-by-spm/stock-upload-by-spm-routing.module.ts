import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleLocationComponent } from './single-location/single-location.component';

const routes: Routes = [
{
    path:'sl',component:SingleLocationComponent
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockUploadBySpmRoutingModule { }
