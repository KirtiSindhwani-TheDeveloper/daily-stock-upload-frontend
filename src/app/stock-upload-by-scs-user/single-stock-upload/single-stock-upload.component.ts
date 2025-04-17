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
@Component({
  selector: 'app-single-stock-upload',
  imports: [PrimengModuleModule,SharedModule,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './single-stock-upload.component.html',
  styleUrl: './single-stock-upload.component.css'
})
export class SingleStockUploadComponent {
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
  partNotInMasterRecords:any;
  brands:any=[];
  dealers:any=[];
  userId:any;
  @ViewChild('dataTable') dataTable: Table | undefined;
  isDataPresent:boolean=false;
  isDataPresentForPartNotInMaster:boolean=false
  min:any;
  max:any;
  @ViewChild('fu') fu:FileUpload|null=null;
  constructor(private utilitiesService:UtilitiesService,
   private fb:FormBuilder,
   private stockUploadServiceByUser:StockUploadByUserService,
   private stockUploadService:StockUploadBySpmService,
   private globalBlockUiService:GlobalBlockUiService,
   private messageService:MessageService
  ){
 
   this.slForm=this.fb.group({
     location:['',Validators.required],
     brand:['',Validators.required],
     dealer:['',Validators.required],
     date:['',Validators.required],
    file:['',Validators.required]
   })
  }
 
  ngOnInit(){
    // this.getLocations();
   this.getBrands();

   this.max = new Date();

   // Set min date to three months ago
   this.min = new Date();
   this.min.setMonth(this.max.getMonth() - 3);


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

  getBrands(){
     this.globalBlockUiService.startLoading();
    this.utilitiesService.getBrands().subscribe((res:any)=>{
      if(res?.data?.error){
        // console.log("res ",res.data.error)
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching Brands!'})
      }
      this.brands=res.data;
       this.globalBlockUiService.stopLoading();
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
      this.messageService.add({severity:'error',life:4000,detail:'Error in fetching Brands'})
    })
  }

  onBrandChange(event:any){
    this.getPartNotInMaster();
    this.utilitiesService.getDealers({brand_id:this.slForm.value.brand}).subscribe((res:any)=>{
      this.dealers=res.data;
    })
    this.slForm.get('date')?.reset();
    this.slForm.get('file')?.reset();
    this.slForm.get('location')?.reset();
    this.showTable=false;
  }

  onDealerChange(event:any){
  this.utilitiesService.getLocations({dealer_id:this.slForm.value.dealer}).subscribe((res:any)=>{
    this.locations=res.data;
  })
  }
 
   onUpload() {
 
    //  console.log("form ",this.slForm.valid)
    if(this.slForm.invalid){
 
      Object.keys(this.slForm.controls).forEach((controlName:any)=>{

        // if(controlName=='file'){
        //   return
        // }
            this.slForm.get(controlName)?.markAsTouched();
      })
    }
    
    else{
      if(this.fileName==''||this.fileName==null){
       return this.messageService.add({severity:'error',summary:'Select the File!!',life:4000});
       }

     let locationId=this.slForm.value.location;
     this.userId=1;
     
       let formData = new FormData();
       formData.append('excelFile', this.file, this.fileName);
       formData.append('location_id', locationId.toString());
       formData.append('user_id', this.userId.toString());
       formData.append('dealer_id', this.slForm.value.dealer.toString());
       formData.append('brand_id', this.slForm.value.brand.toString());
       formData.append('date',this.slForm.value.date.toString())
       this.globalBlockUiService.startLoading();
      this.stockUploadServiceByUser.uploadSingleStockUpload(formData).subscribe((res:any)=>{
        this.getUploadedData();
        this.getPartNotInMaster();
        // this.slForm.reset();
        this.globalBlockUiService.stopLoading();
        // console.log("res ",res)
        if(res?.data?.headerNotPresent){
          this.fu?.clear();
          this.file=null;
          this.selectedFile=null;
          return this.messageService.add({severity:'error',life:4000,summary:'Headers are not matched with the required fields!'})
        }
        if(res?.data?.mappingNotPresent){
          this.fu?.clear();
          this.file=null;
          formData=new FormData();
          return this.messageService.add({severity:'error',life:4000,summary:'Brand Mapping is not available!!'});
        }

        if(res?.data?.error){
          this.slForm.reset();
          this.showTable=false;
          this.file=null;
          this.fu?.clear();
          this.selectedFile=null;
          this.messageService.add({severity:'error',detail:'Error in uploading the file!',life:4000});
        }
        if(res?.data?.currentSumQuantity){
          this.showTable=true;
          this.currentUploadQuantity=res.currentSumQuantity
        }
        if(res?.data?.prevSumQuantity){
          this.showTable=true;
          this.prevUploadQuantity=res.prevUploadQuantity;
        }
        if(res?.data.currentRecords){
          this.showTable=true;
          this.currentCountRecords=res.currentRecords;
        }
        if(res?.data.prevRecords){
          this.showTable=true;
          this.prevCountRecords=res.prevCountRecords;
        }
        this.slForm.get('file')?.reset();
        if(this.showTable){
          if (this.dataTable) {
            this.dataTable.reset(); // Reset the paginator after data changes
          }
          this.messageService.add({severity:'success',summary:'Stock uploaded succesfully!',life:3000})
        }

        this.getAllRecords();
        this.fu?.clear();
        formData=new FormData();
        this.file=null;

       
      },(error)=>{
        // this.slForm.reset();
        this.fu?.clear();
        this.fileName='';
        formData=new FormData();
        this.file=null;
        this.slForm.get('file')?.reset();
        this.globalBlockUiService.stopLoading();
        this.messageService.add({severity:'error',summary:'Error in Uploading file!!..',life:4000});
      })
       
    }
   }

 
  
   onLocationChange(event:any){
   
    this.getUploadedData();
   }

   getPartNotInMaster(){

    this.stockUploadServiceByUser.getPartNotInMaster({brand_id:this.slForm.value.brand}).subscribe((res:any)=>{
      this.partNotInMasterRecords=res.data;
      if(this.partNotInMasterRecords.length!=0){
        this.isDataPresentForPartNotInMaster=true;
      }
      else{
        this.isDataPresentForPartNotInMaster=false;
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
       
    // this.globalBlockUiService.startLoading();
     this.utilitiesService.getLocations({dealer_id:20295}).subscribe((res:any)=>{
      if(res?.data?.error){
        // console.log("res ",res.data.error)
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:4000,summary:'Error in fetching Locations!'})
      }
       this.locations=res.data;
       // console.log(this.brands)
     },(error:any)=>{
      this.globalBlockUiService.stopLoading();
     })
   }
 
   exportTableData(){
 
    // console.log("records",this.records)
    let brandObj=this.brands.find((obj:any)=> obj.brand_id==this.slForm.value.brand)
    let dealerObj=this.dealers.find((obj:any)=>obj.dealer_id==this.slForm.value.dealer)
      const modifiedData = this.records.map((item: any) => ({
          ['Brand']:brandObj?.brand,
          ['Dealer']:dealerObj?.dealer_name,
          ['Location']: this.locationName,
          ['Previous Records']: item.prevStockUploadCount !=null ?item.prevStockUploadCount :0,
          ['Current Records']: item.stockUploadCount !=null ?item.stockUploadCount:0,
          ['Previous Sum Quantity']: item.prevQuantitySum !=null ?item.prevQuantitySum :0,
          ['Current Sum Quantity']: item.quantitySum !=null ?item.quantitySum:0 ,
          ['Added On ']: item.added_on,
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
    this.stockUploadServiceByUser.getAllRecords({location_id:this.slForm.value.location,added_by:this.userId,dealer_id:this.slForm.value.dealer,brand_id:this.slForm.value.brand}).subscribe((res:any)=>{
      this.records=res.data;
      let brandObj=this.brands.find((obj:any)=> obj.brand_id==this.slForm.value.brand)
      let dealerObj=this.dealers.find((obj:any)=>obj.dealer_id==this.slForm.value.dealer)
      this.locationName=locObj?.location_name;
      this.addedOn=res.data.added_on;
      //console.log("brands ",brandObj,this.brands)
      this.addedBy='Kirti'
     this.records= this.records.map((item:any)=>({
        ...item,
        brandName:brandObj?.brand,
        dealerName:dealerObj?.dealer_name,
        added_on: this.formatDate(item.added_on)
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
