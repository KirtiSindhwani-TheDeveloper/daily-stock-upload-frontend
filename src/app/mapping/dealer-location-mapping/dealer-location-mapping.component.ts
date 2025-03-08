import { Component, ViewChild } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilitiesService } from '../../services/utilities.service';

import * as XLSX from 'xlsx';
import { DealerLocationMappingService } from '../../services/dealer-location-mapping.service';
import { GlobalBlockUiService } from '../../services/global-block-ui.service';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';

@Component({
  selector: 'app-dealer-location-mapping',
  imports: [SharedModule,PrimengModuleModule,CommonModule,FormsModule,ReactiveFormsModule],
  providers:[MessageService],
  templateUrl: './dealer-location-mapping.component.html',
  styleUrl: './dealer-location-mapping.component.css'
})
export class DealerLocationMappingComponent {

 @ViewChild('fu') fu: FileUpload|null =null;
 selectedFile:any;
 isLoading:boolean=false;
 brands:any=[];
 file:any;
 fileName:any;
 addFileName:any;
 dlForm:FormGroup;
 uploadedData:any=[];
 isDataPresent:boolean=false;
 userId=1;
 showEditPopUp:boolean=false;
 visible:boolean=false;
 constructor(private utilitiesService:UtilitiesService,
  private fb:FormBuilder,private dealerLocationService:DealerLocationMappingService,
  private globalUiService:GlobalBlockUiService,
  private messageService:MessageService
 ){

  this.dlForm=this.fb.group({
    brand:['',Validators.required],
    // file:['',Validators.required]
  })
 }

 ngOnInit(){
  this.getBrands();
 }

 onSelect(event:any){
 
   this.file=event.files[0];
   if(this.showEditPopUp){
    this.fileName=this.file.name;
   }
   this.fileName=this.file.name;
   if(!this.showEditPopUp){
    this.addFileName=this.file.anme;
   }
 }

  onUpload() {

   if(this.dlForm.invalid){

     Object.keys(this.dlForm.controls).forEach((controlName:any)=>{
       this.dlForm.get(controlName)?.markAsTouched();
     })
   }
   else{
   
    let brandId=this.dlForm.value.brand;
      let formData = new FormData();
      if(this.file!='' || this.file!=null){
        formData.append('excelFile', this.file, this.fileName);
        formData.append('brand_id', brandId.toString());
        formData.append('added_by',this.userId.toString())

      }
      this.globalUiService.startLoading()
      this.dealerLocationService.uploadDealerLocationMapping(formData).subscribe((res:any)=>{
        if(res?.isDealerAndLocationPresent==false){
          this.messageService.add({severity:'error',summary:'Dealer and Location is not present in Uploaded File!!',life:300000})
        }
        if(res?.isDealerAndLocationNull){
          this.messageService.add({severity:'error',summary:'Dealer and Location cannot be null!!',life:300000})
        }

        if(res?.dealerLocationNotInMasterPresent){
          this.messageService.add({severity:'error',summary:'Dealer and Location are not present in our database!!',life:300000})
        }
        if(res?.insertedSuccessfully){
          this.messageService.add({severity:'success',summary:'Mapping is created successfully!!',life:10000})
        }
        this.clearSelectedFiles();
        formData=new FormData();
        this.selectedFile=null;
        this.file=null;
        this.addFileName='';
      },(error:any)=>{
        this.messageService.add({severity:'error',summary:'Error in creating Mapping!!',life:300000})
        this.globalUiService.stopLoading();
      },()=>{
        this.globalUiService.stopLoading();
        this.dlForm.reset();
        this.clearSelectedFiles();
        formData=new FormData();
        this.file=null
        this.selectedFile=null;
        this.addFileName='';

      })
   }
  }

  clearSelectedFiles() {
    if (this.fu) {
      this.fu.clear();
      this.file=null;
      this.selectedFile=null
        // Clear the file input from the p-fileupload component
    }
  }

  getBrands(){
      
    this.utilitiesService.getBrands().subscribe((res:any)=>{
      this.brands=res.data;
      // console.log(this.brands)
    })
  }

onBrandSelect(event:any){

  this.clearSelectedFiles();
  this.dealerLocationService.exportToExcel({brand_id:this.dlForm.value.brand}).subscribe((res:any)=>{
    this.uploadedData=res.data;
    if(this.uploadedData.length!=0){
      this.isDataPresent=true;
      this.visible=true;
    }
    else{
      this.isDataPresent=false;
    }
    //  console.log(this.uploadedData);
   
  })
}

  exportToExcel(){

    
    let modifiedData = this.uploadedData.map((item: any) => {
      let brandObj = this.brands.find((obj: any) => obj.brand_id == item.brandId);
      let arr = {
          Dealer: item["dealer"],
          Location: item["location"],
          Brand: brandObj ? brandObj.brand : null, // Make sure brandObj is found
          ["Inventory Location"]: item.inventory_location
      };
      return arr;
  });
   
    
 const ws = XLSX.utils.json_to_sheet(modifiedData);

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write the workbook to a file and trigger download
    XLSX.writeFile(wb, 'Dealer_Location_Mapping.xlsx');
  }

  onEdit(){
    let brandId=this.dlForm.value.brand;
    let formData = new FormData();
    if(this.file!='' || this.file!=null){
      formData.append('excelFile', this.file, this.fileName);
      formData.append('brand_id', brandId.toString());
      formData.append('added_by',this.userId.toString())

    }
    this.globalUiService.startLoading()
    this.dealerLocationService.editDealerLocationMapping(formData).subscribe((res:any)=>{
      if(res?.isDealerAndLocationPresent==false){
        this.messageService.add({severity:'error',summary:'Dealer and Location is not present in Uploaded File!!',life:300000})
      
      }
      if(res?.isDealerAndLocationNull){
        this.messageService.add({severity:'error',summary:'Dealer and Location cannot be null!!',life:300000})
       
      }

      if(res?.dealerLocationNotInMasterPresent){
        this.messageService.add({severity:'error',summary:'Dealer and Location are not present in our database!!',life:300000})
       
      }
      if(res?.insertedSuccessfully){
        this.messageService.add({severity:'success',summary:'Mapping is updated successfully!!',life:10000})
       
      }
      this.dlForm.reset();
      this.clearSelectedFiles();
      formData=new FormData();
      this.file=null;
       this.fileName=null;     
       this.selectedFile=null; 
       this.fu?.clear();
    },(error:any)=>{
      this.showEditPopUp=false;
      this.globalUiService.stopLoading();
      this.dlForm.reset();
      this.clearSelectedFiles();
      formData=new FormData();
      
      this.messageService.add({severity:'error',summary:'Error in updating Mapping!!',life:300000})
    },()=>{
      // this.showEditPopUp=false
      this.globalUiService.stopLoading();
      this.dlForm.reset();
      this.clearSelectedFiles();
      formData=new FormData();
      this.file=null;
      this.fileName=''     
      this.selectedFile=null;
      this.fu?.clear();

    })
 
  }

  showEditPopup(){
    this.fu?.clear();
    this.fileName='';
    this.showEditPopUp=true;
  }
}
