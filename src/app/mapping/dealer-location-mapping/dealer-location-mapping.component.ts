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
import { Table } from 'primeng/table';

@Component({
  selector: 'app-dealer-location-mapping',
  imports: [SharedModule,PrimengModuleModule,CommonModule,FormsModule,ReactiveFormsModule],
  providers:[MessageService],
  templateUrl: './dealer-location-mapping.component.html',
  styleUrl: './dealer-location-mapping.component.css'
})
export class DealerLocationMappingComponent {

 @ViewChild('fu') fu: FileUpload|null =null;
 @ViewChild('fu1') fu1: FileUpload|null =null;
  @ViewChild('dataTable') dataTable: Table | undefined;
  users:any[]=[{
    id:1,
    name:'Kirti'
  }]
  records:any=[]
 selectedFile:any;
 isLoading:boolean=false;
 brands:any=[];
 file:any;
 fileName:any;
 dataNotPresentInMaster:any[]=[];
 addFileName:any;
 dlForm:FormGroup;
 uploadedData:any=[];
 showTable:boolean=false;
 isDataExist:boolean=false;
 isDataPresent:boolean=false;
 userId=1;
 formData=new FormData();
 showEditPopUp:boolean=false;
 visible:boolean=false;
 activeStatus:boolean=false;
 wrongDataExist:boolean=false;
 exportType:any='All';
 constructor(private utilitiesService:UtilitiesService,
  private fb:FormBuilder,private dealerLocationService:DealerLocationMappingService,
  private globalUiService:GlobalBlockUiService,
  private messageService:MessageService
 ){

  this.dlForm=this.fb.group({
    brand:['',Validators.required],
    //  file:['',Validators.required]
  })
 }

 ngOnInit(){
  this.getBrands();
 
 }

 onSelect(event:any){
  this.viewMapping();
   this.file=event.files[0];
    this.fileName=this.file.name;
    // this.dlForm.get('file')?.setValue(this.file);

    // // Mark the control as touched (to trigger validation)
    // this.dlForm.get('file')?.markAsTouched();

    // If you want to mark the form as valid after selecting a file, you can validate it
    // if (this.dlForm.get('file')?.valid) {
    //   this.dlForm.get('file')?.setErrors(null); // Clear any validation errors if valid
    // }
   if(this.showEditPopUp){
    this.fileName=this.file.name;
   }
   this.fileName=this.file.name;
   if(!this.showEditPopUp){
    this.addFileName=this.file.name;
   }
 }

  onUpload() {

    //console.log("form valid ",this.dlForm.valid,this.file)
    
   if(this.dlForm.valid){
    let brandId=this.dlForm.value.brand;
    // let formData = new FormData();
    if(this.file!='' || this.file!=null){
     

      this.formData.append('excelFile', this.file, this.fileName);
        this.formData.append('brand_id', this.dlForm.value.brand.toString());
      this.formData.append('added_by',this.userId.toString())
    }

    this.globalUiService.startLoading()
    this.dealerLocationService.uploadDealerLocationMapping(this.formData).subscribe((res:any)=>{
      if(res?.isDealerAndLocationPresent==false){
        this.messageService.add({severity:'error',summary:'Dealer, Location and Inventory Location is not present in Uploaded File!',life:4000})
      }
      if(res?.isDealerAndLocationNull){
        this.messageService.add({severity:'error',summary:'Dealer, Location and Inventory Location cannot be null!',life:4000})
      }

      if(res?.dealerLocationNotInMasterPresent){
        this.dataNotPresentInMaster=res?.dealerLocationNotInMaster
        console.log("data not present in master ",this.dataNotPresentInMaster)
        if(this.dataNotPresentInMaster.length==0){
          this.wrongDataExist=false;
        }
        else{
          this.wrongDataExist=true;
        }
        this.messageService.add({severity:'error',summary:'Dealer and Location are not present in our database!',life:4000})
      }
      if(res?.insertedSuccessfully){
        this.viewMapping();
        this.messageService.add({severity:'success',summary:'Mapping is created successfully!',life:4000})
      }
      this.clearSelectedFiles();
      this.formData=new FormData();
      
      this.selectedFile=null;

      this.file=null;
      this.addFileName='';
      this.fu?.clear();
      this.fu1?.clear();
    },(error:any)=>{
      this.messageService.add({severity:'error',summary:'Error in creating Mapping!',life:4000})
      this.globalUiService.stopLoading();
      this.clearSelectedFiles();
      this.formData=new FormData();
      this.selectedFile=null;
      this.fu?.clear();
      this.file=null;
      this.fu1?.clear();
      this.addFileName='';
    },()=>{
      this.globalUiService.stopLoading();
     // this.dlForm.reset();
      this.clearSelectedFiles();
      this.formData=new FormData();
      this.fu1?.clear();
      this.fu?.clear();
      this.file=null
      this.selectedFile=null;
      this.addFileName='';

    })
     
   }
   else{
    Object.keys(this.dlForm.controls).forEach((controlName:any)=>{
      this.dlForm.get(controlName)?.markAsTouched();
    })
   
   }
  }

  viewMapping(){
    this.globalUiService.startLoading();
    this.dealerLocationService.viewDealerLocationMapping({user_id:1,brand_id:this.dlForm.value.brand}).subscribe((res:any)=>{
       this.globalUiService.stopLoading();
      if(res.error){
        return this.messageService.add({severity:'error',life:4000,detail:'Error in getting View Mapping'})
      }
      if(res.data){
        this.records=res.data;
        this.showTable=true;
        //console.log("records ",this.records)
        let brandObj=this.brands.find((obj:any)=>obj.brand_id==this.dlForm.value.brand);
        let userObj=this.users.find((obj:any)=>obj.id==1)
       this.records= this.records.map((item:any)=>{

          return{
            ...item,
            brandName:brandObj.brand,
            addedOn:this.formatDate(item.added_on),
            addedBy:userObj.name,
            statusBoolean: item.status === 'active'
          }
        })
       // console.log("records ",this.records)
        if(this.showTable){
          if (this.dataTable) {
            this.dataTable.reset(); // Reset the paginator after data changes
          }
        }
      }
    },(error:any)=>{
      this.globalUiService.stopLoading();
    })
  }

  deleteMapping(rowData:any){


    const newStatus = rowData.statusBoolean ? 'active' : 'inactive';
    // console.log("new status ",newStatus,rowData);
    this.globalUiService.startLoading();
    this.dealerLocationService.deleteDealerLocationMapping({brand_id:this.dlForm.value.brand,id:rowData.id,user_id:1,status:newStatus}).subscribe((res:any)=>{
      this.viewMapping();
      this.globalUiService.stopLoading();
      
      if(res?.error){
        return this.messageService.add({severity:'error',detail:'Error in deleting mapping',life:4000})
      }
      
    },(error:any)=>{
      this.globalUiService.stopLoading();
    }
    )
  }

  exportTableData(exportType:any){
   // console.log("export type ",exportType)
    let modifiedData;
    let filteredData;
    if(exportType=='All'){
      modifiedData=this.records.map((item:any)=>{
       return{ Brand:item.brandName,
        Dealer:item.dealer,
        Location:item.location,
        ["Inventory Location"]:item.inventory_location,
        Status:item.status,
        ["Added On"]:item.addedOn,
        ["Added By"]:item.addedBy
       }
      })
    }

    if(exportType=="Active"){
     filteredData= this.records.filter((item:any)=>item.status=="active");
    // console.log("filtered data ",filteredData);
     modifiedData=filteredData.map((item:any)=>{
      return{ Brand:item.brandName,
       Dealer:item.dealer,
       Location:item.location,
       ["Inventory Location"]:item.inventory_location,
       Status:item.status,
       ["Added On"]:item.addedOn,
       ["Added By"]:item.addedBy
      }
     })
    }

    if(exportType=="Inactive"){
      filteredData= this.records.filter((item:any)=>item.status=="inactive");
     // console.log("filtered data ",filteredData);
      modifiedData=filteredData.map((item:any)=>{
        return{ Brand:item.brandName,
         Dealer:item.dealer,
         Location:item.location,
         ["Inventory Location"]:item.inventory_location,
         Status:item.status,
         ["Added On"]:item.addedOn,
         ["Added By"]:item.addedBy
        }
       })
     }

      const ws = XLSX.utils.json_to_sheet(modifiedData);
         
         // Create a workbook and append the worksheet
         const wb = XLSX.utils.book_new();
         XLSX.utils.book_append_sheet(wb, ws, 'Table Data');
     
         // Write the workbook to a file and trigger download
         XLSX.writeFile(wb, 'Dealer Location Mapping.xlsx');

    
  }
  setToggleStatus(product: any, value: boolean): void {
    product.status = value ? 'Active' : 'Inactive';
  }

  setToggleState(product: any): boolean {
    return product.status === 'Active'; // true if 'Active', false if 'Inactive'
  }


  onStatusChange(product: any,status:any) {
    // this.setToggleStatus(product, this.getToggleStatus(product));
    //let status=product.status === 'Active' ? 'Inactive' : 'Active'
    // This ensures that the status is updated correctly when toggling
    product.status = product.status === 'Active' ? 'Inactive' : 'Active'
    
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
  this.globalUiService.startLoading();
  this.dealerLocationService.exportToExcel({brand_id:this.dlForm.value.brand}).subscribe((res:any)=>{
    this.globalUiService.stopLoading();
    this.uploadedData=res.data;
    if(this.uploadedData.length!=0){
      this.isDataPresent=true;
      this.isDataExist=true;;
      this.visible=true;
    }
    else{
      this.isDataPresent=false;
      this.isDataExist=false
    }
    //  console.log(this.uploadedData);
   
  },(error:any)=>{
    this.globalUiService.stopLoading();
    this.messageService.add({severity:'error',summary:'Error in exporting the file!',life:4000})
  })
}

  exportToExcel(){

    
    let modifiedData = this.uploadedData.map((item: any) => {
      let brandObj = this.brands.find((obj: any) => obj.brand_id == item.brandId);
      let arr = {
          Brand: brandObj ? brandObj.brand : null, // Make sure brandObj is found
          Dealer: item["dealer"],
          Location: item["location"],     
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
    if(this.dlForm.value.brand==''){
      return this.messageService.add({severity:'error',detail:'Select Brand',life:4000});
    }
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
        this.messageService.add({severity:'error',summary:'Dealer, Location and Inventory Location is not present in Uploaded File!',life:4000})
      
      }
      if(res?.isDealerAndLocationNull){
        this.messageService.add({severity:'error',summary:'Dealer, Location and Inventory Location cannot be null!',life:4000})
       
      }

      if(res?.dealerLocationNotInMasterPresent){
        this.dataNotPresentInMaster=res?.dealerLocationNotInMaster;
       // console.log("data not present in master ",this.dataNotPresentInMaster)
        if(this.dataNotPresentInMaster.length==0){
          this.wrongDataExist=false;
        }
        else{
          this.wrongDataExist=true;}
        this.messageService.add({severity:'error',summary:'Dealers and Locations are not present in our database!',life:4000})
       
      }
      if(res?.insertedSuccessfully){

        this.messageService.add({severity:'success',summary:'Mapping is updated successfully!',life:4000})
        this.viewMapping();
        this.dealerLocationService.exportToExcel({brand_id:this.dlForm.value.brand}).subscribe((res:any)=>{
         this.uploadedData=res.data;
        if(this.uploadedData.length!=0){
          this.isDataPresent=true;
          this.isDataExist=true;
          this.visible=true;
        }
        else{
          this.isDataPresent=false;
          this.isDataExist=false;
        }})
      }
    //  this.dlForm.reset();
      this.clearSelectedFiles();
      formData=new FormData();
      this.file=null;
       this.fileName=null;     
       this.selectedFile=null; 
       this.fu1?.clear();
       this.showEditPopUp=false;
    },(error:any)=>{
      this.showEditPopUp=false;
      this.globalUiService.stopLoading();
      //this.dlForm.reset();
      this.clearSelectedFiles();
      formData=new FormData();
      this.showEditPopUp=false;
      this.fu1?.clear();
      this.messageService.add({severity:'error',summary:'Error in updating Mapping!',life:4000})
    },()=>{
      // this.showEditPopUp=false
      this.globalUiService.stopLoading();
    //  this.dlForm.reset();
      this.clearSelectedFiles();
      formData=new FormData();
      this.file=null;
      this.fileName=''     
      this.selectedFile=null;
      this.fu1?.clear();

    })
 
  }

  exportWrongDealerLocation(){

   
      let modifiedData=this.dataNotPresentInMaster.map((item:any)=>{

        return{
          Dealer:item.dealer,
          Location:item.location,
          ["Inventory Location"]:item['inventory location']
        }
      })

      const ws = XLSX.utils.json_to_sheet(modifiedData);

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write the workbook to a file and trigger download
    XLSX.writeFile(wb, 'Dealer_Location_Not_Exist.xlsx');
    
  }
  showEditPopup(){
    this.fu?.clear();
    this.showEditPopUp=true;
    this.formData=new FormData;
    this.file=null;
    this.selectedFile=null;
    this.addFileName=''
    this.fu1?.clear();
  }
}
