import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilitiesService } from '../../services/utilities.service';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { StockUploadBySpmService } from '../../services/stock-upload-by-spm.service';

@Component({
  selector: 'app-single-location',
  imports: [PrimengModuleModule,SharedModule,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './single-location.component.html',
  styleUrl: './single-location.component.css'
})
export class SingleLocationComponent {
  selectedFile:any;
  isLoading:boolean=false;
  locations:any=[];
  file:any;
  fileName:any;
  slForm:FormGroup;
  constructor(private utilitiesService:UtilitiesService,
   private fb:FormBuilder,
   private stockUploadService:StockUploadBySpmService
  ){
 
   this.slForm=this.fb.group({
     location:['',Validators.required],
    //  file:['',Validators.required]
   })
  }
 
  ngOnInit(){
   this.getLocations();
  }
 
  onSelect(event:any){
    this.file=event.files[0];
    this.fileName=this.file.name;
  }
 
   onUpload() {
 
    if(this.slForm.invalid){
 
      Object.keys(this.slForm.controls).forEach((controlName:any)=>{
        this.slForm.get(controlName)?.markAsTouched();
      })
    }
    
    else{
    
     let locationId=this.slForm.value.location;
       const formData = new FormData();
       formData.append('excelFile', this.file, this.fileName);
       formData.append('location_id', locationId.toString());
      this.stockUploadService.uploadSingleLocationUpload(formData).subscribe((res:any)=>{
        
      })
       
    }
   }
 
   getLocations(){
       
     this.utilitiesService.getLocations({dealer_id:20295}).subscribe((res:any)=>{
       this.locations=res.data;
       // console.log(this.brands)
     })
   }
 
   exportToExcel(){
 
   }

   

 


}
