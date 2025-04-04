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
import { Table } from 'primeng/table';
@Component({
  selector: 'app-single-location',
  imports: [PrimengModuleModule,SharedModule,FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './single-location.component.html',
  providers:[MessageService],
  styleUrl: './single-location.component.css'
})
export class SingleLocationComponent {

  @ViewChild('dataTable') dataTable: Table | undefined;
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
      file:['',Validators.required],
    brand:[''],
    dealer:['']
   })
  }
 
  ngOnInit(){
  //  this.getLocations();
   this.getBrands();  
  }
 
  onSelect(event: any) {
    const fileControl = this.slForm.get('file'); // Get the file form control
    
    // Check if exactly one file is selected
    if (event.files && event.files.length === 1) {
      const file = event.files[0]; // Get the first selected file
      
      // If a file is selected, update the form control with the new file
      fileControl?.setValue(file);
      
      // Set class variables for further use (e.g., for displaying the file name)
      this.file = file;
      this.fileName = file.name;
    } else {
      // If no file or more than one file is selected, reset the form control
      fileControl?.setValue(null);
      this.file = null;
      this.fileName = '';
    }
  
    // Trigger form control validation to ensure the validation state is updated
    fileControl?.updateValueAndValidity();
  }
  
  
 
   onUpload() {
 
    if(this.slForm.invalid){
 
      Object.keys(this.slForm.controls).forEach((controlName:any)=>{
        this.slForm.get(controlName)?.markAsTouched();
      })
    }
    
    else{
    
      if(this.fileName==''||this.fileName==null){
       return this.messageService.add({severity:'error',summary:'Select the File!!',life:4000});
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
        if(res?.headerNotPresent){
          this.fu?.clear();
          this.file=null;
          this.selectedFile=null;
          return this.messageService.add({severity:'error',life:4000,summary:'Headers are not matched with the required fields!'})
        }
        if(res?.error){
          this.slForm.reset();
          this.file=null;
          this.fu?.clear();
          this.selectedFile=null;
          this.showTable=false;
          this.messageService.add({severity:'error',detail:'Error in uploading the file!',life:4000});
        }
        if(res?.mappingNotPresent){
          return this.messageService.add({severity:'error',life:4000,summary:'Brand Mapping is not available!'});
        }
        if(res?.currentSumQuantity){
          this.showTable=true;
          this.currentUploadQuantity=res.currentSumQuantity
        }
        if(res?.prevSumQuantity){
          this.showTable=true;
          this.prevUploadQuantity=res.prevUploadQuantity;
        }
        if(res?.currentRecords){
          this.showTable=true;
          this.currentCountRecords=res.currentRecords;
        }
        if(res?.prevRecords){
          this.showTable=true;
          this.prevCountRecords=res.prevCountRecords;
        }
        
        if(this.showTable){
          if (this.dataTable) {
            this.dataTable.reset(); // Reset the paginator after data changes
          }
          this.messageService.add({severity:'success',life:3000,summary:'Stock uploaded successfully!'});
        }
       
        this.getAllRecords();
        this.fu?.clear();
        this.file=null;
        this.selectedFile=null;
        this.slForm.get('file')?.reset();
       
      },(error)=>{
        this.globalBlockUiService.stopLoading();
        this.file=null;
        this.selectedFile=null;
        this.messageService.add({severity:'error',summary:'Error in Uploading file!!..',life:4000});
      })
       
    }
   }

   onLocationChange(event:any){
    this.getPartNotInMaster();
    this.getUploadedData();
   }

   onBrandChange(event:any){
    this.utilitiesService.getDealers({brand_id:this.slForm.value.brand}).subscribe((res:any)=>{
     
      if(res?.data?.error){
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching Dealers!'})
      }
      else{
        this.dealers=res.data;
      }
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
    })
   }

   getBrands(){
    this.globalBlockUiService.startLoading();
    this.utilitiesService.getBrands().subscribe((res:any)=>{
     
      this.globalBlockUiService.stopLoading();
      if(res?.data?.error){
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching Brands!'})
      }
      this.brands=res.data;
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
    })
  }
   onDealerChange(event:any){
    // console.log(this.slForm.value)
    // this.globalBlockUiService.startLoading();
    this.utilitiesService.getLocations({dealer_id:this.slForm.value.dealer}).subscribe((res:any)=>{
      this.locations=res.data;
      this.globalBlockUiService.stopLoading();
      // console.log(this.brands)
      if(res?.data?.error){
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching Locations!'})
      }
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
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
