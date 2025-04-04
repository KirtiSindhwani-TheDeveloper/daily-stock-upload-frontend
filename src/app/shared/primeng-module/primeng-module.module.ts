import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { AvatarModule } from 'primeng/avatar';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { BlockUIModule } from 'primeng/blockui';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { PaginatorModule } from 'primeng/paginator';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RadioButtonModule } from 'primeng/radiobutton';
const modules:any=[
  MultiSelectModule,
  ButtonModule,
  SelectModule,
  TableModule,
  DialogModule,
  FileUploadModule,
    SidebarModule,
    InputTextModule,
    DatePickerModule,
    AvatarModule,
    TieredMenuModule,
    ToastModule,
    DrawerModule,
    DropdownModule,
    BlockUIModule,
    PasswordModule,
    PaginatorModule,
    ToggleButtonModule,
    ToggleSwitchModule,
    RadioButtonModule

   
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
