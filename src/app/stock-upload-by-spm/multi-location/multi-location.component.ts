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

@Component({
  selector: 'app-multi-location',
  imports: [PrimengModuleModule,SharedModule,CommonModule,ReactiveFormsModule,FormsModule],
  templateUrl: './multi-location.component.html',
  styleUrl: './multi-location.component.css'
})
export class MultiLocationComponent {

  showTable:boolean=false;
  records:any=[];
 mlForm:FormGroup;
 locations:any=[];
 formData=new FormData();
 locationName:any;
 addedBy:any;
 files: any[] = [];
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
      if (this.mlForm.valid) {
        const formData = new FormData();
  
        // Append all files and locations to FormData
        const locations = this.mlForm.get('locations')?.value;
        locations.forEach((location: any) => {
          formData.append('files[]', location.file, location.file.name);
          formData.append('location_id', location.location);
        });

      }
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



    exportTableData(){

    }

    exportToExcel(){

    }

    exportUploadedData(){

    }
}
