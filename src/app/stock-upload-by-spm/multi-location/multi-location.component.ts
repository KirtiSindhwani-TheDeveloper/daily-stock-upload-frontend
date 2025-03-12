import { Component, ViewChild } from '@angular/core';
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
        locationSelected: Set<number> = new Set(); // To track selected locations
   @ViewChild('fu') fu:FileUpload|null=null;
    constructor(private utilitiesService:UtilitiesService,
     private fb:FormBuilder,
     private stockUploadService:StockUploadBySpmService,
     private globalBlockUiService:GlobalBlockUiService,
     private messageService:MessageService
    ){

     
        this.mlForm = this.fb.group({
          locations: this.fb.array([])
        });
        this.addLocation(); // Initially add one location entry
      
      
    }

    ngOnInit(){
      this.getLocations();
    }
    get locationControls() {
      return (this.mlForm.get('locations') as FormArray).controls;
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
      console.log(locationGroup)
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
      let dealerId=20295;
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
        
        this.formData.append('dealer_id', dealerId.toString());
      });

        this.stockUploadService.uploadMultiLocation(this.formData).subscribe((res:any)=>{

          if(res?.mappingNotPresent){
            this.messageService.add({severity:'error',detail:'Brand Mapping is not available!!',life:300000});
          }
          else{
            this.showTable=true;
           this.getRecords();
           this.messageService.add({severity:'success',detail:'Stock Upload successfully!!',life:300000});
          }
          this.formData=new FormData();
          this.fu?.clear();
        },(error:any)=>{
          this.globalBlockUiService.stopLoading();
          this.messageService.add({severity:'error',detail:'Error in uploading the file!!',life:300000});
          this.formData=new FormData();
          this.fu?.clear();
        })

      }
      else{}
      const locations = this.mlForm.get('locations') as FormArray;

      // Mark each control as touched to show validation errors
      locations.controls.forEach((locationControl: any) => {
        locationControl.markAllAsTouched(); // Mark all controls within each location as touched
      });
    }
  
  
    getRecords(){
     
      const locations = this.mlForm.get('locations')?.value;
      
      this.globalBlockUiService.startLoading();
      this.stockUploadService.getRecordsMultiLocation({locations:locations}).subscribe((res:any)=>{
        this.records=res.data;
        this.globalBlockUiService.stopLoading();
       
      this.addedOn=res.data.added_on;
      this.addedBy='Kirti'
      this.records=this.records[0]
      this.records = this.records.map((item: any) => {
        // Find the location object based on location_id

        let locObj = this.locations.find((obj: any) => obj.location_id == item.location_id);
        console.log(locObj)
        // Return the updated item with formatted date and locationName
        return {
          ...item,
          added_on: this.formatDate(item.added_on),
          locationName: locObj?.location_name || '' , // Add location name, defaulting to an empty string if not found,
          added_by:this.addedBy
        };
      });

      
      // console.log("records ",this.records)
      },(error:any)=>{
        this.globalBlockUiService.stopLoading();
        // this.messageService.add({severity:'error',detail:'Error in uploading the file!!',life:300000});
      })
    }

    getLocations(){
      this.utilitiesService.getLocations({dealer_id:20295}).subscribe((res:any)=>{
        this.locations=res.data;
        // console.log(this.brands)
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
          this.messageService.add({severity:'success',detail:'File is generated succesfully for part not in master',life:30000})
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

      if(this.mlForm.get('locations')?.value!=''){
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
              this.messageService.add({severity:'success',detail:'File is generated succesfully for uploaded stock',life:30000})
        },(error:any)=>{
          this.globalBlockUiService.stopLoading();
          this.messageService.add({severity:'error',detail:'Error in Downloading the file',life:30000});
        })
      }
      else{
        this.messageService.add({severity:'error',detail:'Select the locations',life:30000});
      }
      
    }
}
