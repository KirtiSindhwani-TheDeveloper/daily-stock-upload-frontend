import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleLocationComponent } from './single-location/single-location.component';
import { MultiLocationComponent } from './multi-location/multi-location.component';

const routes: Routes = [
{
    path:'sl',component:SingleLocationComponent
},
{
  path:'ml',component:MultiLocationComponent
}


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockUploadBySpmRoutingModule { }
