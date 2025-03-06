import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilitiesService } from '../../services/utilities.service';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';

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
   private fb:FormBuilder
  ){
 
   this.slForm=this.fb.group({
     location:['',Validators.required],
     file:['',Validators.required]
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
    
     let brandId=this.slForm.value.brand;
       const formData = new FormData();
       formData.append('excelFile', this.file, this.fileName);
       formData.append('brand_id', brandId.toString());
    }
   }
 
   getLocations(){
       
     // this.utilitiesService.getLocations().subscribe((res:any)=>{
     //   this.Locations=res.data;
     //   // console.log(this.brands)
     // })
   }
 
   exportToExcel(){
 
   }

  //  getDealers(){
  //   this.utilitiesService.getDealers({dealer_id:})
  //  }


}
