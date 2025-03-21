import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UtilitiesService } from '../../services/utilities.service';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { StockUploadBySpmService } from '../../services/stock-upload-by-spm.service';
import * as XLSX from 'xlsx';
import { GlobalBlockUiService } from '../../services/global-block-ui.service';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
@Component({
  selector: 'app-single-location',
  imports: [PrimengModuleModule,SharedModule,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './single-location.component.html',
  providers:[MessageService],
  styleUrl: './single-location.component.css'
})
export class SingleLocationComponent {
  selectedFile:any;
  isLoading:boolean=false;
  locations:any=[];
  file:any;
  fileName:any;
  slForm:FormGroup;
  records:any=[];
  currentUploadQuantity:any;
  prevCountRecords:any;
  currentCountRecords:any;
  prevUploadQuantity:any;
  showTable:any;
  locationName:any;
  addedOn:any;
  addedBy:any;
  uploadedData:any=[];
  visible:boolean=false;
  userId:any;
  isDataPresent:boolean=false;
  partNotInMasterRecords:any;
  dealers:any;
  brands:any;
  isDataPresentPartNotInMaster:boolean=false;
  @ViewChild('fu') fu:FileUpload|null=null;
  constructor(private utilitiesService:UtilitiesService,
   private fb:FormBuilder,
   private stockUploadService:StockUploadBySpmService,
   private globalBlockUiService:GlobalBlockUiService,
   private messageService:MessageService
  ){
 
   this.slForm=this.fb.group({
     location:['',Validators.required],
    //  file:['',Validators.required]
    brand:[''],
    dealer:['']
   })
  }
 
  ngOnInit(){
  //  this.getLocations();
   this.getBrands();  
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
    
      if(this.fileName==''||this.fileName==null){
       return this.messageService.add({severity:'error',summary:'Select the File!!',life:300000});
       }
     let locationId=this.slForm.value.location;
    this.userId=1;
       const formData = new FormData();
       formData.append('excelFile', this.file, this.fileName);
       formData.append('location_id', locationId.toString());
       formData.append('user_id', this.userId.toString());
       
       this.globalBlockUiService.startLoading();
      this.stockUploadService.uploadSingleLocationUpload(formData).subscribe((res:any)=>{
        this.getPartNotInMaster();
        this.getUploadedData();
        this.globalBlockUiService.stopLoading();
        if(res?.mappingNotPresent){
          return this.messageService.add({severity:'error',life:300000,summary:'Brand Mapping is not available!!'});
        }
        if(res?.currentSumQuantity){
          this.currentUploadQuantity=res.currentSumQuantity
        }
        if(res?.prevSumQuantity){
          this.prevUploadQuantity=res.prevUploadQuantity;
        }
        if(res?.currentRecords){
          this.currentCountRecords=res.currentRecords;
        }
        if(res?.prevRecords){
          this.prevCountRecords=res.prevCountRecords;
        }
        this.showTable=true;

        this.getAllRecords();
        this.fu?.clear();
       
      },(error)=>{
        this.globalBlockUiService.stopLoading();
        this.messageService.add({severity:'error',summary:'Error in Uploading file!!..',life:300000});
      })
       
    }
   }

   onLocationChange(event:any){
    this.getPartNotInMaster();
    this.getUploadedData();
   }

   onBrandChange(event:any){
    this.utilitiesService.getDealers({brand_id:this.slForm.value.brand}).subscribe((res:any)=>{
      this.dealers=res.data;
    })
   }

   getBrands(){
    this.utilitiesService.getBrands().subscribe((res:any)=>{
      this.brands=res.data;
    })
  }
   onDealerChange(event:any){
    console.log(this.slForm.value)
    this.utilitiesService.getLocations({dealer_id:this.slForm.value.dealer}).subscribe((res:any)=>{
      this.locations=res.data;
      // console.log(this.brands)
    })
   }
   getPartNotInMaster(){

    this.stockUploadService.getPartNotInMaster({location_id:this.slForm.value.location}).subscribe((res:any)=>{
      this.partNotInMasterRecords=res.data;
      if(this.partNotInMasterRecords.length!=0){
         this.isDataPresentPartNotInMaster=true;
      }else{
        this.isDataPresentPartNotInMaster=false;
      }
    },(error:any)=>{

    })
   }
 
   exportToExcel(){

    const modifiedData = this.partNotInMasterRecords.map((item: any) => ({
     
      ['Part Number']: item.partnumber , 

    }));

    const ws = XLSX.utils.json_to_sheet(modifiedData);
    
    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Table Data');

    // Write the workbook to a file and trigger download
    XLSX.writeFile(wb, 'Part_Not_In_Master.xlsx');
    
   }


   getUploadedData(){
    this.stockUploadService.getUploadedData({location_id:this.slForm.value.location}).subscribe((res:any)=>{
      this.uploadedData=res.data;
      if(this.uploadedData.length!=0){
        this.isDataPresent=true;
      }
      else{
        this.isDataPresent=false;
      }

      
    })  
   }

   exportUploadedData(){
    
    const modifiedData = this.uploadedData.map((item: any) => ({
     
      ['Part Number']: item.partnumber , 
      Quantity:item.qty

    }));
    const ws = XLSX.utils.json_to_sheet(modifiedData);
  
    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Uploaded Data');

    // Write the workbook to a file and trigger download
    XLSX.writeFile(wb, 'uploaded_data.xlsx');
   }
   getLocations(){
       
     this.utilitiesService.getLocations({dealer_id:20295}).subscribe((res:any)=>{
       this.locations=res.data;
       // console.log(this.brands)
     })
   }
 
   exportTableData(){
 
      const modifiedData = this.records.map((item: any) => ({
          ['Location']: this.locationName,
          ['Previous Records']: item.prevStockUploadCount ,
          ['Current Records']: item.stockUploadCount,
          ['Previous Sum Quantity']: item.prevQuantitySum,
          ['Current Sum Quantity']: item.quantitySum ,
          ['Added On ']: (item.added_on),
          ['Added By ']:'Kirti'
         
    
        }));
        const ws = XLSX.utils.json_to_sheet(modifiedData);
    
        // Create a workbook and append the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Table Data');
    
        // Write the workbook to a file and trigger download
        XLSX.writeFile(wb, 'exported_data.xlsx');
   }

   getAllRecords(){

    this.userId=1;
    let locObj=this.locations.find((obj:any)=> obj.location_id==this.slForm.value.location)
    this.stockUploadService.getAllRecords({location_id:this.slForm.value.location,added_by:this.userId}).subscribe((res:any)=>{
      this.records=res.data;
      this.locationName=locObj.location_name;
      this.addedOn=res.data.added_on;
      this.addedBy='Kirti'
     this.records= this.records.map((item:any)=>({
        ...item,
        added_on: this.formatDate(item.added_on),
        added_by:this.addedBy
      }))
    })
   }

   formatDate(dateString: string): string {
    const date = new Date(dateString); // Parse the input string as a date
  
    // Check if the Date object is valid
    if (isNaN(date.getTime())) {
      return '-'; // Return a default value if the date is invalid
    }
  
    // Extract year, month, day, hours, minutes, and seconds in IST
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Use UTC methods to avoid time zone conversion
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    // const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  
    // Combine and return the formatted string as 'DD-MM-YYYY HH:MM:SS'
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

   

 


}
