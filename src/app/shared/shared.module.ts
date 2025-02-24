import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { PrimengModuleModule } from './primeng-module/primeng-module.module';
import { AngularModuleModule } from './angular-module/angular-module.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedRoutingModule,
    PrimengModuleModule,
    AngularModuleModule
  ]
})
export class SharedModule { }
