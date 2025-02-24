import { Component } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@Component({
  selector: 'app-stock-upload-mapping',
  imports: [PrimengModuleModule,SharedModule,CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './stock-upload-mapping.component.html',
  styleUrl: './stock-upload-mapping.component.css'
})
export class StockUploadMappingComponent {
  selectedBrand:any;
  brands:any=[]
  stMappingForm:FormGroup;
  isMappingForBothOlder = new FormControl(false);

  constructor(private fb:FormBuilder){
    this.stMappingForm=this.fb.group({
      mappingForBothStock:[''],
      brands:['']
    })
  }
  onUpload(event:any){

  }
}
