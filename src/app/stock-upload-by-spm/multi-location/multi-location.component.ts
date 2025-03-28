import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { FileUpload } from 'primeng/fileupload';
import { UtilitiesService } from '../../services/utilities.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockUploadBySpmService } from '../../services/stock-upload-by-spm.service';
import { GlobalBlockUiService } from '../../services/global-block-ui.service';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-multi-location',
  imports: [PrimengModuleModule,SharedModule,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './multi-location.component.html',
  styleUrl: './multi-location.component.css'
})
export class MultiLocationComponent {

  showTable:boolean=false;
  records:any[]=[];
 mlForm:FormGroup;
 locations:any=[];
 formData=new FormData();
 locationName:any;
 addedBy:any;
 addedOn:any;
 files: any[] = [];
 partNotInMasterData:any[]=[];
 previousLocations:any[]=[];
 userId:any;
 brands:any=[];
 dealers:any=[];
 isDataPresentPartNotInMaster:boolean=false;
        locationSelected: Set<number> = new Set(); // To track selected locations
        @ViewChildren('fu') fu: QueryList<FileUpload> | undefined;
    constructor(private utilitiesService:UtilitiesService,
     private fb:FormBuilder,
     private stockUploadService:StockUploadBySpmService,
     private globalBlockUiService:GlobalBlockUiService,
     private messageService:MessageService
    ){

     
        this.mlForm = this.fb.group({
          locations: this.fb.array([]),
          brand:[''],
          dealer:['']
        });
        this.addLocation(); // Initially add one location entry
      
      
    }

    ngOnInit(){
      // this.getLocations();
      this.getBrands();
    }
    get locationControls() {
      return (this.mlForm.get('locations') as FormArray);
    }
  
    // Add new location entry (dropdown and file upload)
    addLocation() {
      const locationGroup = this.fb.group({
        location: ['', Validators.required],
        file: [null, Validators.required]
      });
  
      (this.mlForm.get('locations') as FormArray).push(locationGroup);
    }
  
    // Remove location entry
    removeLocation(index: number) {
      (this.mlForm.get('locations') as FormArray).removeAt(index);
      this.locationSelected.clear(); // Reset the set of selected locations
      this.validateLocations(); // Revalidate all locations
    }
  
    // Handle file selection
    onFileSelect(event: any, index: number) {
      const file = event.files[0]; // Only take the first file selected
      const locationGroup = (this.mlForm.get('locations') as FormArray).at(index);
      locationGroup.patchValue({ file: file });
      // console.log(locationGroup)
    }
  
    // Handle location change (to validate duplicate location selection)
    onLocationChange(index: number) {

      const locationControl = (this.mlForm.get('locations') as FormArray).at(index).get('location');
      const selectedLocation = locationControl?.value;
    
      // Clear previous errors
      locationControl?.setErrors(null);
    
      // Check if there was a previous location selected
      const previousLocation = this.previousLocations[index];
    
      // If there was a previous location and it's different, remove it from the locationSelected set
      if (previousLocation && previousLocation !== selectedLocation) {
        this.locationSelected.delete(previousLocation);
      }
    
      // Update previous location with the new one
      this.previousLocations[index] = selectedLocation;
    
      // Check for duplicate locations
      if (this.locationSelected.has(selectedLocation)) {
        locationControl?.setErrors({ duplicateLocation: true });
      } else {
        this.locationSelected.add(selectedLocation); // Mark the location as selected
        
      }
    }
    
  
    // Validate that no location is selected twice
    validateLocations() {
      const locations = this.mlForm.get('locations')?.value;
      const locationIds = locations.map((loc: any) => loc.location);
  
      // Find duplicate locations and set validation errors
      locationIds.forEach((locationId:any, index:any) => {
        const locationControl = (this.mlForm.get('locations') as FormArray).at(index).get('location');
        if (locationIds.indexOf(locationId) !== index) {
          locationControl?.setErrors({ duplicateLocation: true });
        }
      });
    }
  
    // Handle the submit (upload)
    onUpload() {
      let userId=1;
      // let dealerId=20295;
      if (this.mlForm.valid) {
        this.globalBlockUiService.startLoading();
        // const formData = new FormData();
  
        const locations = this.mlForm.get('locations')?.value;

      // Iterate through locations and append each file and location to FormData
      locations.forEach((location: any) => {
        if (location.file) {
          this.formData.append('files[]', location.file, location.file.name); // Append file
        }
        if (location.location) {
          this.formData.append('location_id', location.location); // Append location ID
        }
        this.formData.append('user_id', userId.toString());
        
        this.formData.append('dealer_id', this.mlForm.value.dealer.toString());
      });

        this.stockUploadService.uploadMultiLocation(this.formData).subscribe((res:any)=>{
          this.globalBlockUiService.stopLoading();
          if(res?.headerNotPresent){
            this.formData=new FormData();
            this.clearFileUploads();
            return this.messageService.add({severity:'error',life:300000,summary:'Headers are not matched with the brand mapping!'})
          }
          if(res?.error){
            this.mlForm.reset();
            this.showTable=false;
            this.messageService.add({severity:'error',detail:'Error in uploading the file!',life:300000});
          }
          if(res?.mappingNotPresent){
            this.mlForm.reset();
            this.messageService.add({severity:'error',detail:'Brand Mapping is not available!!',life:300000});
          }
          else{
            this.showTable=true;
           this.getRecords();
           this.messageService.add({severity:'success',detail:'Stock Upload successfully!!',life:3000});
          }
          this.formData=new FormData();
          this.clearFileUploads();
        },(error:any)=>{
          this.globalBlockUiService.stopLoading();
          this.messageService.add({severity:'error',detail:'Error in uploading the file!!',life:300000});
          this.formData=new FormData();
          // this.mlForm.get('locations')?.setValue(null);
          this.clearFileUploads();
          // this.mlForm.reset();
        })

      }
      else{
      const locations = this.mlForm.get('locations') as FormArray;

      // Mark each control as touched to show validation errors
      locations.controls.forEach((locationControl: any) => {
        locationControl.markAllAsTouched(); // Mark all controls within each location as touched
      });
    }
    }
   
    clearFileUploads() {
      // Iterate through each location control in the FormArray
      if (this.fu && this.fu.toArray().length > 0 && this.locationControls.controls.length > 0) {
        this.locationControls.controls.forEach((locationControl, index) => {
          // Clear the location form control
          const location = locationControl.get('location');
          // location?.setValue(null);
  
          // Access the file upload component and clear the files
          const fileUpload = this.fu?.toArray()[index];
          if (fileUpload) {
            fileUpload.clear();  // Clear the file upload component
            this.files=[];
          }
        });
      }
    
    }
    getRecords(){
      this.userId=1;
      const locations = this.mlForm.get('locations')?.value;
      
      this.globalBlockUiService.startLoading();
      this.stockUploadService.getRecordsMultiLocation({locations:locations,added_by:this.userId}).subscribe((res:any)=>{
        this.records=res.data;
        this.globalBlockUiService.stopLoading();
       
      this.addedOn=res.data.added_on;
      this.addedBy='Kirti'
      // this.records=this.records[0]
      // console.log('this.records:', this.records); // Log the structure of records to check

      this.records = this.records.flat().map((item: any) => {
        // Find the location object based on location_id
        let locObj = this.locations.find((obj: any) => obj.location_id == item.location_id);
      
        // Return the updated item with formatted date, locationName, and added_by
        return {
          ...item,
          added_on: this.formatDate(item.added_on),  // Format the added_on date
          locationName: locObj?.location_name || '',  // Default locationName if not found
          added_by: this.addedBy || ''  // Ensure added_by is always set, defaulting to empty string if undefined
        };
      });
  
      
      // console.log("records ",this.records)
      },(error:any)=>{
        this.globalBlockUiService.stopLoading();
        // this.messageService.add({severity:'error',detail:'Error in uploading the file!!',life:300000});
      })
    }

    getLocations(){
      this.globalBlockUiService.startLoading();
      this.utilitiesService.getLocations({dealer_id:20295}).subscribe((res:any)=>{
        this.globalBlockUiService.stopLoading();
        this.locations=res.data;
        // console.log(this.brands)
      },(error:any)=>{
        this.globalBlockUiService.stopLoading();
      })
    }

    onSelect(event:any){
      const files = event.files;
      const formArray = this.mlForm.get('files') as FormArray;
  
      files.forEach((file: File) => {
        formArray.push(this.fb.control(file));
      });
    }


    getPartNotInMasterRecords(){

      if(this.mlForm.get('locations')?.value!=''){
        this.globalBlockUiService.startLoading();
        this.stockUploadService.getPartNotInMasterMultiLocation({locations:this.mlForm.get('locations')?.value}).subscribe((blob:any)=>{
          const link = document.createElement('a');
      const url = window.URL.createObjectURL(blob);

      // Set the file name and trigger the download
      link.href = url;
      link.download = 'part_not_in_master.zip'; // You can set a dynamic file name here
      link.click();

      // Cleanup the object URL after download
      window.URL.revokeObjectURL(url);
          this.globalBlockUiService.stopLoading();
          this.messageService.add({severity:'success',detail:'File is generated succesfully for part not in master',life:3000})
        },(error:any)=>{
          this.globalBlockUiService.stopLoading();
          this.messageService.add({severity:'error',detail:'Error in downloading the file',life:30000});
        })
      }
      else{
        this.messageService.add({severity:'error',detail:'Select the locations',life:30000});
      }
    }

    exportTableData(){

       const modifiedData = this.records.map((item: any) => ({
                ['Location']: this.locationName,
                ['Previous Records']: item.prevStockUploadCount ,
                ['Current Records']: item.stockUploadCount,
                ['Previous Sum Quantity']: item.prevQuantitySum,
                ['Current Sum Quantity']: item.quantitySum ,
                ['Added On ']: this.formatDate(item.added_on),
                ['Added By ']:'Kirti'
               
          
              }));
              const ws = XLSX.utils.json_to_sheet(modifiedData);
          
              // Create a workbook and append the worksheet
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Table Data');
          
              // Write the workbook to a file and trigger download
              XLSX.writeFile(wb, 'exported_data.xlsx');
    }

    exportToExcel(){
    this.getPartNotInMasterRecords();
    }

    exportUploadedData(){
      this.getUploadedData();
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

    getUploadedData(){
      const hasEmptyLocation = this.mlForm.get('locations')?.value.some((item:any) => item.location === "");
     
      if(!hasEmptyLocation){
        this.globalBlockUiService.startLoading();
        this.stockUploadService.getMultiLocationUploadedData({locations:this.mlForm.get('locations')?.value}).subscribe((blob:any)=>{
          const link = document.createElement('a');
          const url = window.URL.createObjectURL(blob);
    
          // Set the file name and trigger the download
          link.href = url;
          link.download = 'uploaded_data.zip'; // You can set a dynamic file name here
          link.click();
    
          // Cleanup the object URL after download
          window.URL.revokeObjectURL(url);
              this.globalBlockUiService.stopLoading();
              this.messageService.add({severity:'success',detail:'File is generated succesfully for uploaded stock',life:3000})
        },(error:any)=>{
          this.globalBlockUiService.stopLoading();
          this.messageService.add({severity:'error',detail:'Error in Downloading the file',life:30000});
        })
      }
      else{
        this.messageService.add({severity:'error',detail:'Select the locations',life:30000});
      }
      
    }

    getBrands(){

      this.globalBlockUiService.startLoading();
      this.utilitiesService.getBrands().subscribe((res:any)=>{
       
        this.globalBlockUiService.stopLoading();
        if(res?.data?.error){
          // console.log("res ",res.data.error)
          this.globalBlockUiService.stopLoading();
          return this.messageService.add({severity:'error',life:300000,summary:'Error in fetching Brands!'})
        }
        
          this.brands=res.data;
      
      },(error:any)=>{
        this.globalBlockUiService.stopLoading();
      })
    }
  
    onBrandChange(event:any){
      // this.getPartNotInMasterRecords()

      // this.globalBlockUiService.startLoading();
      this.utilitiesService.getDealers({brand_id:this.mlForm.value.brand}).subscribe((res:any)=>{
        this.dealers=res.data;
        this.globalBlockUiService.stopLoading();
        if(res?.data?.error){
          this.globalBlockUiService.stopLoading();
          return this.messageService.add({severity:'error',life:300000,summary:'Error in fetching Dealers!'})
        }
      },(error:any)=>{
        this.globalBlockUiService.stopLoading();
      })
    }
  
    onDealerChange(event:any){
      // this.globalBlockUiService.startLoading();
    this.utilitiesService.getLocations({dealer_id:this.mlForm.value.dealer}).subscribe((res:any)=>{
      this.locations=res.data;
      this.globalBlockUiService.stopLoading();
      if(res?.data?.error){
        this.globalBlockUiService.stopLoading();
        return this.messageService.add({severity:'error',life:300000,summary:'Error in fetching Locations!'})
      }
    },(error:any)=>{
      this.globalBlockUiService.stopLoading();
    })
    }
}
