import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { AvatarModule } from 'primeng/avatar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
const modules:any=[
  MultiSelectModule,
  ButtonModule,
  SelectModule,
  TableModule,
  DialogModule,
  FileUploadModule,
    SidebarModule,
    InputTextModule,
    ButtonModule,
    AvatarModule,
    TieredMenuModule,
    ToastModule,
    DrawerModule
   
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...modules
  ],
  exports:[
    ...modules
  ]
})
export class PrimengModuleModule { }
