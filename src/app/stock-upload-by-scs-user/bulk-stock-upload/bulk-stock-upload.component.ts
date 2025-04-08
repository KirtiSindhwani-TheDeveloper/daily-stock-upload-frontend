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
import { StockUploadByUserService } from '../../services/stock-upload-by-user.service';
import { Table } from 'primeng/table';
import { setActiveConsumer } from '@angular/core/primitives/signals';
@Component({
  selector: 'app-bulk-stock-upload',
  imports: [PrimengModuleModule,SharedModule,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './bulk-stock-upload.component.html',
  styleUrl: './bulk-stock-upload.component.css'
})
export class BulkStockUploadComponent {
 selectedFile:any;
  isLoading:boolean=false;
  locations:any=[];
  file:any;
  fileName:any;
  mlForm:FormGroup;
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
  partNotInMasterRecords:any;
  brands:any=[];
  dealers:any=[];
  min:any;
  max:any;
  @ViewChild('dataTable') dataTable: Table | undefined;
  isDataPresentForPartNotInMaster:boolean=false;
  isDataPresentForPreviousUpload:boolean=false;
  userId:any;
  users:any=[{
    id:1,
    name:'Kirti'
  }]
  @ViewChild('fu') fu:FileUpload|null=null;
  constructor(private utilitiesService:UtilitiesService,
   private fb:FormBuilder,
   private stockUploadService:StockUploadBySpmService,
   private globalBlockUiService:GlobalBlockUiService,
   private messageService:MessageService,
   private stockUploadServiceBySCSUser:StockUploadByUserService
  ){
 
   this.mlForm=this.fb.group({
     brand:['',Validators.required],
     dealer:['',Validators.required],
     date:['',Validators.required],
    file:['',Validators.required]
   })
  }
 
  ngOnInit(){
   this.getLocations();
   this.getBrands();

   this.max = new Date();

   // Set min date to three months ago
   this.min = new Date();
   this.min.setMonth(this.max.getMonth() - 3);
   this.userId=this.users[0].id;
  }
 
  getBrands(){
    this.globalBlockUiService.startLoading()
    this.utilitiesService.getBrands().subscribe((res:any)=>{
      
      this.globalBlockUiService.stopLoading();
      if(res?.data?.error){
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching Brands!'})
      }
      this.brands=res.data;
    },(error:any)=>{
      this.globalBlockUiService.stopLoading()
      this.messageService.add({severity:'error',summary:'Error in fetching the Brands! ',life:4000})
    })
  }

  onSelect(event: any) {
    const fileControl = this.mlForm.get('file'); // Get the file form control
    
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

  onBrandChange(event:any){

  //  this.globalBlockUiService.startLoading();
    this.utilitiesService.getDealers({brand_id:this.mlForm.value.brand}).subscribe((res:any)=>{
      this.globalBlockUiService.stopLoading();
      this.dealers=res.data;
      if(res?.data?.error){
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching Dealers!'})
      }
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
      this.messageService.add({severity:'error',summary:'Error in Fetching the Dealers !',life:4000})
    });

   this.getPartNotInMaster();
    
  }

  onDealerChange(event:any){
    //this.globalBlockUiService.startLoading();
  this.utilitiesService.getLocations({dealer_id:this.mlForm.value.dealer}).subscribe((res:any)=>{
    this.locations=res.data;
    this.globalBlockUiService.stopLoading();
    if(res?.data?.error){
      this.globalBlockUiService.stopLoading();
      return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching locations!'})
    }
  },(error:any)=>{
    this.globalBlockUiService.stopLoading();
    this.messageService.add({severity:'error',summary:'Error in Fetching the Dealers!',life:4000})
  })

  }
  
   onUpload() {
 
    // console.log("ml form ",this.mlForm.value)
    if(this.mlForm.invalid){
 
      Object.keys(this.mlForm.controls).forEach((controlName:any)=>{
        this.mlForm.get(controlName)?.markAsTouched();
      })
    }
    
    else{
    
      if(this.fileName==''||this.fileName==null){
       return this.messageService.add({severity:'error',summary:'Select the File!',life:4000});
       }
     let dealerId=this.mlForm.value.dealer;
    
       const formData = new FormData();
       formData.append('excelFile', this.file, this.fileName);
       formData.append('dealer_id', dealerId.toString());
       formData.append('brand_id', this.mlForm.value.brand.toString());
       formData.append('user_id',  this.userId.toString());
       formData.append('date',this.mlForm.value.date.toString())
      //  console.log("formData ",formData)
       this.globalBlockUiService.startLoading();
      this.stockUploadServiceBySCSUser.bulkStockUpload(formData).subscribe((res:any)=>{
        this.getAllRecords();
        this.getPartNotInMaster();
        this.globalBlockUiService.stopLoading();
        if(res?.headerNotPresent){
          this.fu?.clear();
          this.file=null;
          this.selectedFile=null;
          return this.messageService.add({severity:'error',life:4000,summary:'Headers are not matched with the required fields!'})
        }
        if(res?.mappingNotPresent){
          this.mlForm.reset();
          this.showTable=false
          this.messageService.add({severity:'error',detail:'Brand Mapping is not available!',life:4000});
        }
        if(res?.dealerLocationMappingNotPresent){
          this.mlForm.reset();
          this.showTable=false;
          this.messageService.add({severity:'error',detail:'Dealer Location Mapping is not available for selected Dealer!',life:4000});
        }
        
        if(res?.error){
          this.mlForm.reset();
          this.showTable=false;
          this.file=null;
          this.fu?.clear();
          this.selectedFile=null;
          this.messageService.add({severity:'error',detail:'Error in uploading the file!',life:4000});
        }
        if(res.length==0){
          this.mlForm.get('file')?.reset();
          return this.messageService.add({severity:'success',detail:'No data is uploaded ',life:4000})
        }
        if(res[0]?.currentSumQuantity){
          this.showTable=true;
          this.currentUploadQuantity=res.currentSumQuantity
        }
        if(res[0]?.prevSumQuantity){
          this.showTable=true;
          this.prevUploadQuantity=res.prevUploadQuantity;
        }
        if(res[0]?.currentRecords){
          this.showTable=true;
          this.currentCountRecords=res.currentRecords;
        }
        if(res[0]?.prevRecords){
          this.showTable=true;
          this.prevCountRecords=res.prevCountRecords;
        }
        
        this.mlForm.get('file')?.reset();
        if(this.showTable){
          if (this.dataTable) {
            this.dataTable.reset(); // Reset the paginator after data changes
          }
          this.messageService.add({severity:'success',detail:'Stock Uploaded Succesfully!',life:3000});
        }
        
       
        this.fu?.clear();
        this.file=null;
        this.selectedFile=null;
       
      },(error)=>{
        this.fu?.clear();
        this.file=null;
        this.selectedFile=null;
        this.globalBlockUiService.stopLoading();
        this.messageService.add({severity:'error',summary:'Error in Uploading file!..',life:4000});
      })
       
    }
   }


   getPartNotInMaster(){
    this.stockUploadServiceBySCSUser.getPartNotInMaster({brand_id:this.mlForm.value.brand}).subscribe((res:any)=>{
      this.globalBlockUiService.stopLoading();
      this.partNotInMasterRecords=res.data;
      if(this.partNotInMasterRecords.length>0){
        this.isDataPresentForPartNotInMaster=true;
      }else{
        this.isDataPresentForPartNotInMaster=false;
      }
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
      this.messageService.add({severity:'error',summary:'Error in getting the part not in master !',life:4000})
    });
  
   }


 
   exportToExcel(){

    let brandObj=this.brands.find((obj:any)=> obj.brand_id==this.mlForm.value.brand)
    let brandName=brandObj.brand;
    const modifiedData = this.partNotInMasterRecords.map((item: any) => ({
     
      ['Part Number']: item.partnumber , 
      Brand:brandName

    }));

    const ws = XLSX.utils.json_to_sheet(modifiedData);
    
    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Table Data');

    // Write the workbook to a file and trigger download
    XLSX.writeFile(wb, 'Part_Not_In_Master.xlsx');
    
   }


   getUploadedData(){
   
    if(this.mlForm.value.dealer==''||this.mlForm.value.dealer==null|| this.mlForm.value.dealer==undefined){
      return this.messageService.add({severity:'error',detail:'Select Dealer',life:4000})
    }
    this.globalBlockUiService.startLoading();
    this.stockUploadServiceBySCSUser.getUploadedData({dealer_id:this.mlForm.value.dealer,user_id:this.userId}).subscribe((blob:any)=>{
      const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      // Set the file name and trigger the download
      link.href = url;
      link.download = 'uploaded_data.zip'; // You can set a dynamic file name here
      link.click();

      // Cleanup the object URL after download
      window.URL.revokeObjectURL(url);
          this.globalBlockUiService.stopLoading();
          this.messageService.add({severity:'success',detail:'File is generated succesfully for Uploaded Data',life:3000})
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
      this.messageService.add({severity:'error',detail:'Error in downloading the file',life:4000});
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
          ['Location']: item.locationName,
          ['Previous Records']: item.prevStockUploadCount !=null?item.prevStockUploadCount:0 ,
          ['Current Records']: item.stockUploadCount !=null ?item.stockUploadCount:0,
          ['Previous Sum Quantity']: item.prevQuantitySum !=null? item.prevQuantitySum:0,
          ['Current Sum Quantity']: item.quantitySum !=null? item.quantitySum:0,
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

    this.stockUploadServiceBySCSUser.getAllBulkRecords({dealer_id:this.mlForm.value.dealer,added_by:this.userId}).subscribe((res:any)=>{
      this.records=res.data;
      // console.log("locations ",this.locations)
      this.addedOn=res.data.added_on;
      this.addedBy='Kirti'
     this.records= this.records.map((item:any)=>{
      let locationObj=this.locations.find((obj:any)=>obj.location_id==parseInt(item.location_id));
    //  console.log("loc obj ",locationObj)
      return{
        ...item,
        added_on: this.formatDate(item.added_on),
        locationName:locationObj?.location_name
      }
       
       
     })
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
