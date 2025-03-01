import { Component } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { UtilitiesService } from '../../services/utilities.service';
import { StockUploadMappingService } from '../../services/stock-upload-mapping.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stock-upload-mapping',
  imports: [PrimengModuleModule,SharedModule,CommonModule,FormsModule,ReactiveFormsModule],
  providers:[MessageService],
  templateUrl: './stock-upload-mapping.component.html',
  styleUrl: './stock-upload-mapping.component.css'
})
export class StockUploadMappingComponent {
  isLoading:boolean=false;
  selectedBrand:any;
  brands:any=[]
  stMappingForm:FormGroup;
  isMappingForBothOlder :boolean=false;
  visible: boolean = false;
  editOlderDaysStock:boolean=false;
  editCurrentDaysStock:boolean=false;
  isViewMappingForBothStocks:boolean=false;
  editCurrentDayStockForm:FormGroup;
  editOlderDaysStockForm:FormGroup;
  currentStockForm:FormGroup
  olderStockForm:FormGroup;
  currentStockColumns:any;
  olderStockColumns:any;
  viewMappedData:any;
  isMappingExist:boolean=false;
  visibleMapping:boolean=false;
  validMappingForBothStock:boolean=false;
  editCurrentStockColumns:any=[];
  editOlderStockColumns:any=[];
  constructor(private fb:FormBuilder,private utilitiesService:UtilitiesService,
    private stockUploadMappingService:StockUploadMappingService,
    private messageService:MessageService
  ){
    this.stMappingForm=this.fb.group({
      mappingForBothStock:[''],
      brands:['',Validators.required]
    });
    this.editOlderDaysStockForm = this.fb.group({
      partNumber: ['',Validators.required],
      stockQty: ['',Validators.required],
      location: ['',Validators.required]
    });

    this.currentStockForm=this.fb.group({
      partNumber:[null,Validators.required],
      location:[null,Validators.required],
      stockQty:[null,Validators.required]

    })

    this.olderStockForm=this.fb.group({
      partNumber:[null,Validators.required],
      location:[null,Validators.required],
      stockQty:[null,Validators.required]
    })
    
   
    
    this.editCurrentDayStockForm=this.fb.group({
      partNumber:['',Validators.required],
      stockQty:['',Validators.required],
      location:['',Validators.required]
    })
    this.editOlderDaysStockForm=this.fb.group({
      partNumber:['',Validators.required],
      stockQty:['',Validators.required],
      location:['',Validators.required]
    })
  }

 
  ngOnInit(){
 // Disable the fields after initialization
 this.editOlderDaysStockForm.get('partNumber')?.disable();
 this.editOlderDaysStockForm.get('stockQty')?.disable();
 this.editOlderDaysStockForm.get('location')?.disable();

 this.editCurrentDayStockForm.get('partNumber')?.disable();
 this.editCurrentDayStockForm.get('stockQty')?.disable();
 this.editCurrentDayStockForm.get('location')?.disable();
 
 this.getBrands();
  }

    showDialog() {
        this.visible = true;   
          
    }

    getBrands(){
      
      this.utilitiesService.getBrands().subscribe((res:any)=>{
        this.brands=res.data;
        // console.log(this.brands)
      })
    }

    onBrandSelect(event:any){
     
      this.stockUploadMappingService.viewColumnMapping({brand_id:this.stMappingForm.value.brands}).subscribe((res:any)=>{
        this.viewMappedData=res.data;
        if(this.viewMappedData.length>0){
        this.isMappingExist=true;
      this.visibleMapping=true;
      for(let i=0;i<this.viewMappedData.length;i++){

        if(this.viewMappedData[i].stock_type=='current'){
  
          this.editCurrentStockColumns=JSON.parse(this.viewMappedData[i].brandColumns)
          this.editCurrentDayStockForm.patchValue({
            partNumber:this.viewMappedData[i].part_number,
            location:this.viewMappedData[i].loc,
            stockQty:this.viewMappedData[i].stock_qty

          })
          // console.log(this.editCurrentStockColumns)
        }
        if(this.viewMappedData[i].stock_type=='older'){
          this.editOlderStockColumns=JSON.parse(this.viewMappedData[i].brandColumns)
          // console.log(this.editOlderStockColumns)
          this.editOlderDaysStockForm.patchValue({
            partNumber:this.viewMappedData[i].part_number,
            location:this.viewMappedData[i].loc,
            stockQty:this.viewMappedData[i].stock_qty

          })
        }
      }
    }
    
      else{
        this.isMappingExist=false;
      }
      },(error:any)=>{

      }) 
    }

  onUpload(event:any,stockType:any){
    // console.log("event ",event)
    let file=event.files[0];
    let brandId=this.stMappingForm.value.brands;
      const formData = new FormData();
      formData.append('excelFile', file, file.name);
      formData.append('brand_id', brandId.toString());
      if(this.stMappingForm.value.brands==''){
      this.messageService.add({severity:'error',summary:'Select the brand'});
      return;
      }
    if(stockType=='Current'){ 
      this.isLoading=true;
      
      this.utilitiesService.singleUploadFile(formData).subscribe((res:any)=>{
        this.currentStockColumns=res.data;
        this.isLoading=false;
      },(error:any)=>{
        this.isLoading=false;
        this.messageService.add({severity:'error',summary:'Error in uploading the file !!',life:300000});
      })
}
else{
  this.isLoading=true;
  this.utilitiesService.singleUploadFile(formData).subscribe((res:any)=>{
    this.isLoading=false;
    this.olderStockColumns=res.data;
  },(error:any)=>{
    this.isLoading=false;
    this.messageService.add({severity:'error',summary:'Error in uploading the file !!',life:300000});
  })
}
  }
  onCheckboxChangeInView(event:Event){
    this.isViewMappingForBothStocks = (event.target as HTMLInputElement).checked;
  }
  
  onCheckboxChange(event: Event) {
    this.isMappingForBothOlder = (event.target as HTMLInputElement).checked;
  }

  editOlderStock(){
    this.editOlderDaysStock=true;
    this.editOlderDaysStockForm.get('partNumber')?.enable();
    this.editOlderDaysStockForm.get('stockQty')?.enable();
    this.editOlderDaysStockForm.get('location')?.enable();
  }

  editCurrentStock(){
    this.editCurrentDaysStock=true;
    this.editCurrentDayStockForm.get('partNumber')?.enable();
    this.editCurrentDayStockForm.get('stockQty')?.enable();
    this.editCurrentDayStockForm.get('location')?.enable();
  }

  onSubmit(){
 
    // console.log("clicked ",this.isMappingForBothOlder)
    if(this.isMappingForBothOlder){

      if(this.currentStockForm.valid && this.olderStockForm.valid){
        this.validMappingForBothStock=true;
      }
      if(this.currentStockForm.invalid){
        this.validMappingForBothStock=false;
       // console.log("current stock invalid")
        Object.keys(this.currentStockForm.controls).forEach((controlName:any)=>{
          this.currentStockForm.get(controlName)?.markAsTouched();
        })
      }
      
      if(this.olderStockForm.invalid){
        this.validMappingForBothStock=false;
      //  console.log("older stock invalid")
        Object.keys(this.olderStockForm.controls).forEach((controlName:any)=>{
          this.olderStockForm.get(controlName)?.markAsTouched();
        })
      }

        if(this.validMappingForBothStock){
          this.isLoading=true;
          this.stockUploadMappingService.addColumnMapping({brandId:this.stMappingForm.value.brands,values:this.currentStockForm.value,brandColumns:this.currentStockColumns,userId:1,stockType:'current'}).subscribe((res:any)=>{
            this.isLoading=true;
            this.stMappingForm.reset();
            this.currentStockForm.reset();
            this.currentStockColumns=[];
            this.stockUploadMappingService.addColumnMapping({brandId:this.stMappingForm.value.brands,values:this.olderStockForm.value,brandColumns:this.olderStockColumns,userId:1,stockType:'older'}).subscribe((res:any)=>{
              this.isLoading=false;
              this.stMappingForm.reset();
              this.olderStockForm.reset();
              this.olderStockColumns=[];
               this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully.'})
             },(error:any)=>{
               this.isLoading=false;
               this.stMappingForm.reset();
               this.olderStockForm.reset();
               this.olderStockColumns=[];
               this.messageService.add({severity:'error',summary:'Error in creating mapping in older days stock !!',life:300000});
             })
            // this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully for Current Stock'})
          },(error:any)=>{
            this.isLoading=false;
            this.stMappingForm.reset();
            this.currentStockForm.reset();
            this.currentStockColumns=[];
            this.messageService.add({severity:'error',summary:'Error in creating mapping in current days stock !!',life:300000});
          })
          
        }
      
    }
    else{
      
      if(this.currentStockForm.invalid){
       
        Object.keys(this.currentStockForm.controls).forEach((controlName:any)=>{
          this.currentStockForm.get(controlName)?.markAsTouched();
        })
      }
      else{
        this.isLoading=true;
        this.stockUploadMappingService.addColumnMapping({brandId:this.stMappingForm.value.brands,values:this.currentStockForm.value,brandColumns:this.currentStockColumns,userId:1,stockType:'current'}).subscribe((res:any)=>{
          this.isLoading=false;
          this.stMappingForm.reset();
            this.currentStockForm.reset();
             this.currentStockColumns=[];
          this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully.'})
        },(error:any)=>{
          this.isLoading=false;this.stMappingForm.reset();
          this.currentStockForm.reset();
          this.currentStockColumns=[];
          this.messageService.add({severity:'error',summary:'Error in creating mapping!!',life:300000});
        })
      }
    }
  }
}
