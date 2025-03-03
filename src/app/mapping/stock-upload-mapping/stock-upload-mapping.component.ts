import { Component } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { UtilitiesService } from '../../services/utilities.service';
import { StockUploadMappingService } from '../../services/stock-upload-mapping.service';
import { MessageService } from 'primeng/api';
import { GlobalBlockUiService } from '../../services/global-block-ui.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-stock-upload-mapping',
  imports: [PrimengModuleModule,SharedModule,CommonModule,FormsModule,ReactiveFormsModule],
  providers:[MessageService],
  templateUrl: './stock-upload-mapping.component.html',
  styleUrl: './stock-upload-mapping.component.css'
})
export class StockUploadMappingComponent {
;
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
  isAddMapping:boolean=false;
  tableData:any=[];
  showTable:boolean=false;
  showforEditCurrentData:boolean=false;
  showforAddCurrentData:boolean=false;
  showforEditOlderData:boolean=false;
  showforAddOlderData:boolean=false;
  visibleViewEditPopUp:boolean=false;
  showAddCurrentData:boolean=false;
  showAddOlderData:boolean=false;
  visibleAddPopUp:boolean=false;
  constructor(private fb:FormBuilder,private utilitiesService:UtilitiesService,
    private stockUploadMappingService:StockUploadMappingService,
    private messageService:MessageService,
    private globalBlockUIService:GlobalBlockUiService
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

  viewAllExistingMapping(){
    this.globalBlockUIService.startLoading();
  this.showTable=true;
  this.isAddMapping=false;
  this.stockUploadMappingService.alreadyExistedMapping().subscribe(async (res:any)=>{
    this.tableData=res.data;
   
    this.tableData=this.tableData.map((item:any)=>{
      
     let obj=this.brands.find((obj:any)=> {return obj.brand_id==item.brand_id})
     return{
       ...item,
       brandName:obj.brand
       
      }
    })
   this.formatTableData(this.tableData);

   
   
  },(error:any)=>{
    
  },()=>{
    this.globalBlockUIService.stopLoading();
  })
}

formatTableData(tableData:any){
  const groupedData = tableData.reduce((acc: any, item: any) => {
    const { brand_id, stock_type,added_on } = item;
  
    // Ensure the brand_id group exists
    if (!acc[brand_id]) {
      acc[brand_id] = { brandName: item.brandName, current: {}, older: {} };
    }
  
    // Based on stock_type, assign current or older data
    if (stock_type === "current") {
      acc[brand_id].current = {
        added_by: item.added_by,
        added_on: this.formatDate(item.added_on)
      };
    } else if (stock_type === "older") {
      acc[brand_id].older = {
        added_by: item.added_by,
        added_on: this.formatDate(item.added_on)
      };
    }
  
    return acc;
  }, {});

  const finalResult = Object.keys(groupedData).map((brand_id) => {
    const data = groupedData[brand_id];
  
    return {
      brand_id,
      brandName: data.brandName,
      current_added_by: data.current.added_by || '-',
      current_added_on: data.current.added_on || '-',
      older_added_by: data.older.added_by || '-',
      older_added_on: data.older.added_on || '-',
      current_data_exists: data.current.added_by ? true : false, // Set to true if current data exists
    older_data_exists: data.older.added_by ? true : false, 
    };
  });
  this.tableData=finalResult;
  console.log(this.tableData)
}

 formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Ensure two digits
  const day = date.getDate().toString().padStart(2, '0'); // Ensure two digits
  const hours = date.getHours().toString().padStart(2, '0'); // Ensure two digits
  const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure two digits
  // const seconds = date.getSeconds().toString().padStart(2, '0'); // Ensure two digits

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

  showAddMapping(){
    this.isAddMapping=true;
    this.showTable=false;
  }

  exportTableData(){
    const modifiedData = this.tableData.map((item:any) => ({
      ['Brand']:item.brandName,
      ['Current Days Stock']: item.current_data_exists ? 'Yes' : 'No',
      ['Added On for Current Days Stock']:item.current_added_on,
      ['Added By for Current Days Stock']:item.current_added_by,
      ['Older Days Stock']: item.older_data_exists ? 'Yes' : 'No',
      ['Added On for Older Days Stock']:item.older_added_on,
      ['Added By for Older Days Stock']:item.older_added_on,
    }));
    const ws = XLSX.utils.json_to_sheet(modifiedData);
    
    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Table Data');
    
    // Write the workbook to a file and trigger download
    XLSX.writeFile(wb, 'exported_data.xlsx');
  }

    showDialog() {
        this.visible = true;   
          
    }

    showEditStock(stockType:any,dataExist:any){
      if(stockType=='current'){
        if(dataExist){
          this.visibleViewEditPopUp=true;
          this.showforEditCurrentData=true;
          this.showforEditOlderData=false;
        }
        else{
          this.showforAddCurrentData=true;
          this.showforEditOlderData=false;
          this.visibleAddPopUp=true;
          this.showAddCurrentData=true;
          this.showAddOlderData=false;
        }
      }
      else{
       if(dataExist){
        this.visibleViewEditPopUp=true;
        this.showforEditCurrentData=false;
        this.showforEditOlderData=true;
       }
       else{
        this.showforEditCurrentData=false;
        this.showforAddOlderData=true;
        this.visibleAddPopUp=true;
        this.showAddOlderData=true;
        this.showAddCurrentData=false;
       }
      }
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
     
      this.globalBlockUIService.startLoading();
      this.utilitiesService.singleUploadFile(formData).subscribe((res:any)=>{
        this.currentStockColumns=res.data;
      
        
      },(error:any)=>{
     
        this.messageService.add({severity:'error',summary:'Error in uploading the file !!',life:300000});
      },()=>{
        this.globalBlockUIService.stopLoading();
      })
}
else{
  
 this.globalBlockUIService.startLoading();
  this.utilitiesService.singleUploadFile(formData).subscribe((res:any)=>{
  
    this.olderStockColumns=res.data;
  },(error:any)=>{
  
    this.messageService.add({severity:'error',summary:'Error in uploading the file !!',life:300000});
  },()=>{
    this.globalBlockUIService.stopLoading();
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
        this.globalBlockUIService.startLoading();
          this.stockUploadMappingService.addColumnMapping({brandId:this.stMappingForm.value.brands,values:this.currentStockForm.value,brandColumns:this.currentStockColumns,userId:1,stockType:'current'}).subscribe((res:any)=>{
         
            this.stMappingForm.reset();
            this.currentStockForm.reset();
            this.currentStockColumns=[];
            this.stockUploadMappingService.addColumnMapping({brandId:this.stMappingForm.value.brands,values:this.olderStockForm.value,brandColumns:this.olderStockColumns,userId:1,stockType:'older'}).subscribe((res:any)=>{
            
              this.stMappingForm.reset();
              this.olderStockForm.reset();
              this.olderStockColumns=[];
               this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully.'})
             },(error:any)=>{
           
               this.stMappingForm.reset();
               this.olderStockForm.reset();
               this.olderStockColumns=[];
               this.messageService.add({severity:'error',summary:'Error in creating mapping in older days stock !!',life:300000});
             },()=>{
              this.globalBlockUIService.stopLoading();
             })
            // this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully for Current Stock'})
          },(error:any)=>{
           
            this.stMappingForm.reset();
            this.currentStockForm.reset();
            this.currentStockColumns=[];
            this.messageService.add({severity:'error',summary:'Error in creating mapping in current days stock !!',life:300000});
          },()=>{
            this.globalBlockUIService.stopLoading();
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
        this.globalBlockUIService.startLoading();
        this.stockUploadMappingService.addColumnMapping({brandId:this.stMappingForm.value.brands,values:this.currentStockForm.value,brandColumns:this.currentStockColumns,userId:1,stockType:'current'}).subscribe((res:any)=>{
        
          this.stMappingForm.reset();
            this.currentStockForm.reset();
             this.currentStockColumns=[];
          this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully.'})
        },(error:any)=>{
        this.stMappingForm.reset();
          this.currentStockForm.reset();
          this.currentStockColumns=[];
          this.messageService.add({severity:'error',summary:'Error in creating mapping!!',life:300000});
        },()=>{
          this.globalBlockUIService.stopLoading();
         })
      }
    }
  }
}
