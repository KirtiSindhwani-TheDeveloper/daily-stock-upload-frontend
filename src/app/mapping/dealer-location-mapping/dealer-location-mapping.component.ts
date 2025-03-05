import { Component } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilitiesService } from '../../services/utilities.service';



@Component({
  selector: 'app-dealer-location-mapping',
  imports: [SharedModule,PrimengModuleModule,CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './dealer-location-mapping.component.html',
  styleUrl: './dealer-location-mapping.component.css'
})
export class DealerLocationMappingComponent {

 
 selectedFile:any;
 isLoading:boolean=false;
 brands:any=[];
 file:any;
 fileName:any;
 dlForm:FormGroup;
 constructor(private utilitiesService:UtilitiesService,
  private fb:FormBuilder
 ){

  this.dlForm=this.fb.group({
    brand:['',Validators.required],
    file:['',Validators.required]
  })
 }

 ngOnInit(){
  this.getBrands();
 }

 onSelect(event:any){
   this.file=event.files[0];
   this.fileName=this.file.name;
 }

  onUpload() {

   if(this.dlForm.invalid){

     Object.keys(this.dlForm.controls).forEach((controlName:any)=>{
       this.dlForm.get(controlName)?.markAsTouched();
     })
   }
   else{
   
    let brandId=this.dlForm.value.brand;
      const formData = new FormData();
      formData.append('excelFile', this.file, this.fileName);
      formData.append('brand_id', brandId.toString());
   }
  }

  getBrands(){
      
    this.utilitiesService.getBrands().subscribe((res:any)=>{
      this.brands=res.data;
      // console.log(this.brands)
    })
  }

  exportToExcel(){

  }
}
