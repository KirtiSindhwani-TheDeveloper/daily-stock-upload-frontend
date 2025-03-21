import { Component, ViewChild } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { UtilitiesService } from '../../services/utilities.service';
import { StockUploadMappingService } from '../../services/stock-upload-mapping.service';
import { MessageService } from 'primeng/api';
import { GlobalBlockUiService } from '../../services/global-block-ui.service';
import * as XLSX from 'xlsx';
import { FileUpload } from 'primeng/fileupload';
import { PaginatorState } from 'primeng/paginator';
@Component({
  selector: 'app-stock-upload-mapping',
  imports: [
    PrimengModuleModule,
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [MessageService],
  templateUrl: './stock-upload-mapping.component.html',
  styleUrl: './stock-upload-mapping.component.css',
})
export class StockUploadMappingComponent {
  @ViewChild('fu') fileUpload: FileUpload|null =null;
  selectedBrand: any;
  brands: any = [];
  formData = new FormData()
  stMappingForm: FormGroup;
  isMappingForBothOlder: boolean = false;
  visible: boolean = false;
  editOlderDaysStock: boolean = false;
  editCurrentDaysStock: boolean = false;
  isViewMappingForBothStocks: boolean = false;
  editCurrentDayStockForm: FormGroup;
  editOlderDaysStockForm: FormGroup;
  currentStockForm: FormGroup;
  olderStockForm: FormGroup;
  currentStockColumns: any;
  olderStockColumns: any;
  viewMappedData: any;
  isMappingExist: boolean = false;
  visibleMapping: boolean = false;
  validMappingForBothStock: boolean = false;
  editCurrentStockColumns: any = [];
  showCurrentStockColumnsInTable:any=[];
  showOlderStockColumnsInTable:any=[];
  editOlderStockColumns: any = [];
  isAddMapping: boolean = false;
  tableData: any = [];
  showTable: boolean = false;
  showforEditCurrentData: boolean = false;
  showforAddCurrentData: boolean = false;
  showforEditOlderData: boolean = false;
  showforAddOlderData: boolean = false;
  visibleViewEditPopUp: boolean = false;
  showAddCurrentData: boolean = false;
  showAddOlderData: boolean = false;
  visibleAddPopUp: boolean = false;
  rowData:any=[];
  selectedFile:any;
  selectedFileName:any;
  first: number = 0;
  users:any=[{
    id:1,name:'Kirti'
  }]
  rows: number = 10;
  constructor(
    private fb: FormBuilder,
    private utilitiesService: UtilitiesService,
    private stockUploadMappingService: StockUploadMappingService,
    private messageService: MessageService,
    private globalBlockUIService: GlobalBlockUiService
  ) {
    this.stMappingForm = this.fb.group({
      mappingForBothStock: [''],
      brands: ['', Validators.required],
    });
    this.editOlderDaysStockForm = this.fb.group({
      partNumber: ['', Validators.required],
      stockQty: ['', Validators.required],
      location: ['', Validators.required],
    });

    this.currentStockForm = this.fb.group({
      partNumber: [null, Validators.required],
      location: [null, Validators.required],
      stockQty: [null, Validators.required],
    });

    this.olderStockForm = this.fb.group({
      partNumber: [null, Validators.required],
      location: [null, Validators.required],
      stockQty: [null, Validators.required],
    });

    this.editCurrentDayStockForm = this.fb.group({
      partNumber: ['', Validators.required],
      stockQty: ['', Validators.required],
      location: ['', Validators.required],
    });

    this.editOlderDaysStockForm = this.fb.group({
      partNumber: ['', Validators.required],
      stockQty: ['', Validators.required],
      location: ['', Validators.required],
    });
  }

  ngOnInit() {
    // Disable the fields after initialization
    this.editOlderDaysStockForm.get('partNumber')?.disable();
    this.editOlderDaysStockForm.get('stockQty')?.disable();
    this.editOlderDaysStockForm.get('location')?.disable();

    this.editCurrentDayStockForm.get('partNumber')?.disable();
    this.editCurrentDayStockForm.get('stockQty')?.disable();
    this.editCurrentDayStockForm.get('location')?.disable();

    this.getBrands();
  }

  viewAllExistingMapping() {
    this.globalBlockUIService.startLoading();
    this.showTable = true;
    this.isAddMapping = false;
    this.stockUploadMappingService.alreadyExistedMapping().subscribe(
      async (res: any) => {
        this.tableData = res.data;
       
        this.tableData = this.tableData.map((item: any) => {
          let obj = this.brands.find((obj: any) => {
            return obj.brand_id == item.brand_id;
          });
          let currentAddedByObj=this.users.find((obj:any)=>obj.id==item.added_by)
          // let olderAddedByObj=this.users.find((obj:any)=>obj.id==item.older_added_by)
          return {
            ...item,
            brandName: obj.brand,
            currentAddedBy:currentAddedByObj?.name,

          };
        });
        this.formatTableData(this.tableData);
        this.globalBlockUIService.stopLoading();
      },
      (error: any) => {
        this.globalBlockUIService.stopLoading();
      },
      () => {
        this.globalBlockUIService.stopLoading();
      }
    );
  }

  formatTableData(tableData: any) {
   // console.log(tableData);
    const groupedData = tableData.reduce((acc: any, item: any) => {
      const { brand_id, stock_type, added_on,added_by,brandColumns,id,currentAddedBy } = item;

      // console.log(brandColumns,item.brandColumns)
      // Ensure the brand_id group exists
      if (!acc[brand_id]) {
        acc[brand_id] = { brandName: item.brandName, current: {}, older: {} };
      }

      // Based on stock_type, assign current or older data
      if (stock_type === 'current') {

        acc[brand_id].current = {
          currentBrandColumns:brandColumns,
          added_by: currentAddedBy,
          added_on: this.formatDate(item.added_on),
          part_number:item.part_number,
          loc:item.loc,
          stock_qty:item.stock_qty,
          id:item.id
          
        };
      } else if (stock_type === 'older') {
        acc[brand_id].older = {
          olderBrandColumns:brandColumns,
          added_by: currentAddedBy,
          part_number:item.part_number,
          loc:item.loc,
          stock_qty:item.stock_qty,
          id:item.id,
          added_on: this.formatDate(item.added_on),
        };
      }

      return acc;
    }, {});

    //  console.log("grouped data ",groupedData)

    const finalResult = Object.keys(groupedData).map((brand_id) => {
      const data = groupedData[brand_id];

      return {
        brand_id,
        currentBrandColumns:data.current.currentBrandColumns,
        olderBrandColumns:data.older.olderBrandColumns,
        brandName: data.brandName,
        current_part_number:data.current.part_number,
        current_loc:data.current.loc,
        current_stock_qty:data.current.stock_qty,
        older_part_number:data.older.part_number ,
        older_loc:data.older.loc,
        older_stock_qty:data.older.stock_qty,
        current_id:data.current.id,
        older_id:data.older.id,
        current_added_by: data.current.added_by || '-',
        current_added_on: data.current.added_on || '-',
        older_added_by: data.older.added_by || '-',
        older_added_on: data.older.added_on || '-',
        current_data_exists: data.current.added_by ? true : false, // Set to true if current data exists
        older_data_exists: data.older.added_by ? true : false,
      };
    });
    this.tableData = finalResult;
    //  console.log(this.tableData);
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
  
  
  

  showAddMapping() {
    this.clearSelectedFiles()
    this.isAddMapping = true;
    this.showTable = false;
  }

  exportTableData() {
    // ['Added By for Current Days Stock']: item.current_added_by,
    // ['Added By for Older Days Stock']: item.older_added_by,
    const modifiedData = this.tableData.map((item: any) => ({
      ['Brand']: item.brandName,
      ['Current Days Stock']: item.current_data_exists ? 'Yes' : 'No',
      ['Added On for Current Days Stock']: item.current_added_on,
      ['Added By for Current Days Stock']: 'Kirti',
      ['Older Days Stock']: item.older_data_exists ? 'Yes' : 'No',
      ['Added On for Older Days Stock']: item.older_added_on,
      ['Added By for Older Days Stock']:'Kirti'
     

    }));
    const ws = XLSX.utils.json_to_sheet(modifiedData);

    // Create a workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Table Data');

    // Write the workbook to a file and trigger download
    XLSX.writeFile(wb, 'exported_data.xlsx');
  }

  

  onPageChange(event: PaginatorState) {
      this.first = event.first ?? 0;
      this.rows = event.rows ?? 10;
  }
  showDialog() {
    // this.editOlderDaysStockForm.reset();
    // this.editCurrentDayStockForm.reset();
    this.clearSelectedFiles()
    this.editCurrentDaysStock = false;
    this.editOlderDaysStock = false;
    this.editOlderDaysStockForm.get('partNumber')?.disable();
    this.editOlderDaysStockForm.get('stockQty')?.disable();
    this.editOlderDaysStockForm.get('location')?.disable();

    this.editCurrentDayStockForm.get('partNumber')?.disable();
    this.editCurrentDayStockForm.get('stockQty')?.disable();
    this.editCurrentDayStockForm.get('location')?.disable();
    this.visible = true;
  }

  showEditStock(stockType: any, dataExist: any,rowData:any) {
    //  console.log("rowdata ",rowData)
    this.clearSelectedFiles()
    this.rowData=rowData;
    this.editCurrentDaysStock=false;
    this.editOlderDaysStock=false;
    this.editOlderDaysStockForm.get('partNumber')?.disable();
    this.editOlderDaysStockForm.get('stockQty')?.disable();
    this.editOlderDaysStockForm.get('location')?.disable();

    this.editCurrentDayStockForm.get('partNumber')?.disable();
    this.editCurrentDayStockForm.get('stockQty')?.disable();
    this.editCurrentDayStockForm.get('location')?.disable();
    if (stockType == 'current') {
      if (dataExist) {
        // console.log("data exist",dataExist)
        this.visibleViewEditPopUp = true;
        this.showforEditCurrentData = true;
        this.showforEditOlderData = false;
        // this.editCurrentDaysStock=true;
        // this.editOlderDaysStock=false;
        this.showCurrentStockColumnsInTable=JSON.parse(rowData.currentBrandColumns);
        this.editCurrentDayStockForm.patchValue({
          partNumber: rowData.current_part_number,
          location: rowData.current_loc,
          stockQty: rowData.current_stock_qty,
        });
        // console.log("show current ",this.showCurrentStockColumnsInTable)
      } else {
        this.showforAddCurrentData = true;
        this.showforEditOlderData = false;
        this.visibleAddPopUp = true;
        this.currentStockForm.reset();
       this.editCurrentDaysStock=false;
        this.showAddCurrentData = true;
        this.showAddOlderData = false;
        this.selectedFile='';
        this.formData=new FormData();
        this.selectedFileName='';
        this.clearSelectedFiles()
      }
    } else {
      if (dataExist) {
        this.visibleViewEditPopUp = true;
        this.showforEditCurrentData = false;
        this.showforEditOlderData = true;
        // this.editCurrentDaysStock=false;
        // this.editOlderDaysStock=true;
        this.showCurrentStockColumnsInTable=JSON.parse(rowData.olderBrandColumns);
        this.editOlderDaysStockForm.patchValue({
          partNumber: rowData.older_part_number,
          location: rowData.older_loc,
          stockQty: rowData.older_stock_qty,
        });
       
      } else {
        this.showforEditCurrentData = false;
        this.showforAddOlderData = true;
        this.visibleAddPopUp = true;
        this.editOlderDaysStock=false;
        this.showAddOlderData = true;
        this.showAddCurrentData = false;
        this.selectedFile='';
        this.formData=new FormData();
        this.selectedFileName='';
        this.olderStockForm.reset();
        this.clearSelectedFiles();
      }
    }
  }

  editFromTable(isCurrent:any,isOlder:any){
    // console.log("edit fromtable ",isCurrent,isOlder)
    if (isCurrent) {
      if (this.editCurrentDayStockForm.valid) {
        if(this.showCurrentStockColumnsInTable.length==0){
          this.showCurrentStockColumnsInTable=JSON.parse(this.rowData.currentBrandColumns);
        }
        this.stockUploadMappingService
          .editColumnMapping({
            brandId: this.rowData?.brand_id,
            values: this.editCurrentDayStockForm.value,
            brandColumns: this.showCurrentStockColumnsInTable,
            userId: 1,
            stockType: 'current',
            id: this.rowData.current_id,
          })
          .subscribe(
            (res: any) => {
              this.viewAllExistingMapping();
              this.messageService.add({
                severity: 'success',
                summary: 'Mapping has been successfully updated !!',
                life: 10000,
              });
            },
            (error: any) => {
              this.messageService.add({
                severity: 'error',
                summary:
                  'Error in updating the mapping for current stocks !!',
                life: 300000,
              });
            },
            () => {
              this.globalBlockUIService.stopLoading();
              this.visibleViewEditPopUp=false
              this.clearSelectedFiles();
            }
          );
      }
      else{
        Object.keys(this.editCurrentDayStockForm.controls).forEach((controlName:any)=>{
          this.editCurrentDayStockForm?.get(controlName)?.markAllAsTouched();
        })
      }
     
    }
    
    if(isOlder){
      if (this.editOlderDaysStockForm.valid) {
          // console.log("is form valid ",this.editOlderDaysStockForm.value)
        if(this.showOlderStockColumnsInTable.length==0){
          this.showOlderStockColumnsInTable=JSON.parse(this.rowData.olderBrandColumns);
        }
        this.stockUploadMappingService
          .editColumnMapping({
            brandId: this.rowData?.brand_id,
            values: this.editOlderDaysStockForm.value,
            brandColumns: this.showOlderStockColumnsInTable,
            userId: 1,
            stockType: 'older',
            id: this.rowData.older_id,
          })
          .subscribe(
            (res: any) => {
              this.viewAllExistingMapping();
              this.messageService.add({
                severity: 'success',
                summary: 'Mapping has been successfully updated !!',
                life: 10000,
              });
            },
            (error: any) => {
              this.messageService.add({
                severity: 'error',
                summary:
                  'Error in updating the mapping for current stocks !!',
                life: 300000,
              });
            },
            () => {
              this.globalBlockUIService.stopLoading();
              this.visibleViewEditPopUp=false
              this.clearSelectedFiles();
            }
          );
      }
      else{
        Object.keys(this.editOlderDaysStockForm.controls).forEach((controlName:any)=>{
          this.editOlderDaysStockForm?.get(controlName)?.markAllAsTouched();
        })
      }
    }
  }

  getBrands() {
    this.utilitiesService.getBrands().subscribe((res: any) => {
      this.brands = res.data;
      // console.log(this.brands)
    });
  }

  addMappingFromTable(isCurrent:any,isOlder:any){

    this.selectedFile=''
    this.selectedFileName=''
   // console.log("row data ",this.rowData)
    if(isCurrent){
      if(this.currentStockForm.valid){
        this.stockUploadMappingService.addColumnMapping({
          brandId: this.rowData?.brand_id,
            values: this.currentStockForm.value,
            brandColumns: this.currentStockColumns,
            userId: 1,
            stockType: 'current',
        }).subscribe((res:any)=>{
          this.viewAllExistingMapping();
          this.messageService.add({
            severity: 'success',
            summary: 'Mapping has been successfully updated !!',
            life: 10000,
          });
        },(error:any)=>{
          this.messageService.add({
            severity: 'error',
            summary:
              'Error in updating the mapping for current stocks !!',
            life: 300000,
          });
        },()=>{
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles()
          this.visibleAddPopUp=false;
        })
      }
      else{
        Object.keys(this.currentStockForm.controls).forEach((controlName:any)=>{
            this.currentStockForm?.get(controlName)?.markAsTouched();
          
        })
      }
    }
    if(isOlder){
      if(this.olderStockForm.valid){
        this.stockUploadMappingService.addColumnMapping({
          brandId: this.rowData?.brand_id,
            values: this.olderStockForm.value,
            brandColumns: this.olderStockColumns,
            userId: 1,
            stockType: 'older',
        }).subscribe((res:any)=>{
          this.viewAllExistingMapping();
          this.messageService.add({
            severity: 'success',
            summary: 'Mapping has been successfully updated !!',
            life: 10000,
          });
        },(error:any)=>{
          this.messageService.add({
            severity: 'error',
            summary:
              'Error in updating the mapping for current stocks !!',
            life: 300000,
          });
        },()=>{
          this.globalBlockUIService.stopLoading();
          this.visibleAddPopUp=false;
          this.clearSelectedFiles()
        })
      }
      else{
        Object.keys(this.olderStockForm.controls).forEach((controlName:any)=>{
            this.olderStockForm?.get(controlName)?.markAsTouched();
          
        })
      }
    }

  }

  editMappingWithViewEditBtn() {
    if (this.isViewMappingForBothStocks) {
      for (let i = 0; i < this.viewMappedData.length; i++) {
        this.globalBlockUIService.startLoading();
        if (this.editCurrentDayStockForm.valid) {
          if (this.viewMappedData[i].stock_type == 'current') {
            this.stockUploadMappingService
              .editColumnMapping({
                brandId: this.stMappingForm.value.brands,
                values: this.editCurrentDayStockForm.value,
                brandColumns: this.editCurrentStockColumns,
                userId: 1,
                stockType: 'current',
                id: this.viewMappedData[i].id,
              })
              .subscribe(
                (res: any) => {
                  this.viewAllExistingMapping();
                  this.globalBlockUIService.stopLoading();
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Mapping has been successfully updated !!',
                    life: 10000,
                  });
                },
                (error: any) => {
                  this.globalBlockUIService.stopLoading();
                  this.messageService.add({
                    severity: 'error',
                    summary:
                      'Error in updating the mapping for current stocks !!',
                    life: 300000,
                  });
                },
                () => {
                  this.globalBlockUIService.stopLoading();
                  this.visible=false
                  this.clearSelectedFiles()
                }
              );
          }
          else if(this.viewMappedData.length==1 && this.viewMappedData[0].stock_type=='older'){
            this.stockUploadMappingService.addColumnMapping({
              brandId: this.stMappingForm.value.brands,
                values: this.editCurrentDayStockForm.value,
                brandColumns: this.editCurrentStockColumns,
                userId: 1,
                stockType: 'current',
            }).subscribe((res:any)=>{
              this.messageService.add({
                severity: 'success',
                summary: 'Mapping has been successfully updated !!',
                life: 10000,
              });
            },(error:any)=>{
              this.messageService.add({
                severity: 'error',
                summary:
                  'Error in updating the mapping for current stocks !!',
                life: 300000,
              });
            },()=>{
              this.globalBlockUIService.stopLoading();
              this.visible=false;
              this.clearSelectedFiles()
            })
          }
        } else {
          Object.keys(this.editCurrentDayStockForm.controls).forEach(
            (controlName: any) => {
              this.editCurrentDayStockForm
                ?.get(controlName)
                ?.markAllAsTouched();
            }
          );
        }

        if (this.editOlderDaysStockForm.valid) {
          this.globalBlockUIService.startLoading();
          if (this.viewMappedData[i].stock_type == 'older') {
            this.stockUploadMappingService
              .editColumnMapping({
                brandId: this.stMappingForm.value.brands,
                values: this.editOlderDaysStockForm.value,
                brandColumns: this.editOlderStockColumns,
                userId: 1,
                stockType: 'older',
                id: this.viewMappedData[i].id,
              })
              .subscribe(
                (res: any) => {
                  this.globalBlockUIService.stopLoading();
                  this.viewAllExistingMapping();
                  // this.messageService.add({severity:'success',summary:'Mapping has been successfully updated !!',life:10000})
                },
                (error: any) => {
                  this.globalBlockUIService.stopLoading();
                  this.messageService.add({
                    severity: 'error',
                    summary:
                      'Error in updating the mapping for older stocks !!',
                    life: 300000,
                  });
                },
                () => {
                  this.globalBlockUIService.stopLoading();
                  this.clearSelectedFiles()
                  this.visible=false;
                }
              );
          }
          else if(this.viewMappedData.length==1 && this.viewMappedData[0].stock_type=='current'){
            this.stockUploadMappingService.addColumnMapping({
              brandId: this.stMappingForm.value.brands,
                values: this.editOlderDaysStockForm.value,
                brandColumns: this.editOlderStockColumns,
                userId: 1,
                stockType: 'older',
            }).subscribe((res:any)=>{
              this.messageService.add({
                severity: 'success',
                summary: 'Mapping has been successfully updated !!',
                life: 10000,
              });
            },(error:any)=>{
              this.messageService.add({
                severity: 'error',
                summary:
                  'Error in updating the mapping for older stocks !!',
                life: 300000,
              });
            },()=>{
              this.globalBlockUIService.stopLoading();
              this.visible=false;
              this.clearSelectedFiles()
            })
          }
        } else {
          Object.keys(this.editOlderDaysStockForm.controls).forEach(
            (controlName: any) => {
              this.editOlderDaysStockForm?.get(controlName)?.markAllAsTouched();
            }
          );
        }
      }
    } else {
      if (this.editCurrentDayStockForm.valid) {
        this.globalBlockUIService.startLoading();

        this.stockUploadMappingService
          .editColumnMapping({
            brandId: this.stMappingForm.value.brands,
            values: this.editCurrentDayStockForm.value,
            brandColumns: this.editCurrentStockColumns,
            userId: 1,
            stockType: 'current',
            id: this.viewMappedData[0].id,
          })
          .subscribe(
            (res: any) => {
              this.viewAllExistingMapping();
              this.globalBlockUIService.stopLoading();
              this.messageService.add({
                severity: 'success',
                summary: 'Mapping has been successfully updated !!',
                life: 10000,
              });
            },
            (error: any) => {
              this.globalBlockUIService.stopLoading();
              this.messageService.add({
                severity: 'error',
                summary: 'Error in updating the mapping for current stocks !!',
                life: 10000,
              });
            },
            () => {
              this.globalBlockUIService.stopLoading();
              this.visible=false;
              this.clearSelectedFiles()
            }
          );
      }
    }
  }

  onBrandSelect(event: any) {
   
    this.viewColumnMapping();
  }

  viewColumnMapping(){
     let j = 0;
    this.stockUploadMappingService
    .viewColumnMapping({ brand_id: this.stMappingForm.value.brands })
    .subscribe(
      (res: any) => {
        this.viewMappedData = res.data;
        // console.log(this.viewMappedData);
        if (this.viewMappedData.length > 0) {
          this.isMappingExist = true;
          this.visibleMapping = true;
          for (let i = 0; i < this.viewMappedData.length; i++) {
            if (this.viewMappedData[i].stock_type == 'current') {
              j++;
              this.editCurrentStockColumns = JSON.parse(
                this.viewMappedData[i]?.brandColumns
              );
              this.editCurrentDayStockForm.patchValue({
                partNumber: this.viewMappedData[i].part_number,
                location: this.viewMappedData[i].loc,
                stockQty: this.viewMappedData[i].stock_qty,
              });
              // console.log(this.editCurrentStockColumns)
            }
            if (this.viewMappedData[i].stock_type == 'older') {
              j++;
              this.editOlderStockColumns = JSON.parse(
                this.viewMappedData[i]?.brandColumns
              );
              //  console.log("edit older stock columns",this.editOlderStockColumns)
              this.editOlderDaysStockForm.patchValue({
                partNumber: this.viewMappedData[i].part_number,
                location: this.viewMappedData[i].loc,
                stockQty: this.viewMappedData[i].stock_qty,
              });
            }
          }
          if (j == 2) {
            this.isViewMappingForBothStocks = true;
          }
        } else {
          this.isMappingExist = false;
        }
      },
      (error: any) => {}
    );
  }

  onSelect(event:any){
   
    this.selectedFile = event.files[0];
    this.selectedFileName=this.selectedFile.name;
  }
  
  onUpload(stockType: any) {
    // console.log("event ",event)
    // let file = event.files[0];
    let brandId ;
    if(stockType=='Edit Current From Table'|| stockType=='Edit Older From Table'
       || stockType=='Add Current From Table' || stockType=='Add Older From Table'){
      brandId=this.rowData.brand_id;
    }
    else{
      brandId = this.stMappingForm.value.brands;
      if (this.stMappingForm.value.brands == '' || brandId=='' || brandId==null || this.selectedFile==null) {
        this.messageService.add({
          severity: 'error',
          summary: 'Select the brand and File',
        });
        return;
      }
    }
    //  console.log(brandId)
    
      this.formData.append('excelFile', this.selectedFile, this.selectedFileName);
      this.formData.append('brand_id', brandId.toString());

  
   
    if (stockType == 'Current' || stockType=='Add Current From Table') {
      this.globalBlockUIService.startLoading();
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.globalBlockUIService.stopLoading();
          this.currentStockColumns = res.data.headers;
          this.messageService.add({
            severity: 'success',
            summary: 'File Uploaded Successfully',
            life: 3000,
          });
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !!',
            life: 300000,
          });
        },
        () => {
          this.globalBlockUIService.stopLoading();
          this.formData=new FormData();
           this.clearSelectedFiles();
          //  this.stMappingForm.reset();
        }
      );
    } else if (stockType == 'Older' || stockType=='Add Older From Table') {
      this.globalBlockUIService.startLoading();

      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.messageService.add({
            severity: 'success',
            summary: 'File Uploaded Successfully',
            life: 3000,
          });
          this.globalBlockUIService.stopLoading();
          this.olderStockColumns = res.data.headers;
        },
        (error: any) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !!',
            life: 300000,
          });
        },
        () => {
          this.globalBlockUIService.stopLoading();
           this.clearSelectedFiles()
          this.formData=new FormData();
          // this.stMappingForm.reset();
        }
      );
    } else if (stockType == 'Edit Current') {
      this.editCurrentStockColumns = [];
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'success',
            summary: 'File Uploaded Successfully',
            life: 3000,
          });
          this.editCurrentStockColumns = res.data.headers;
          // console.log('edit current ', this.editCurrentStockColumns);
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !!',
            life: 300000,
          });
        },
        () => {
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles()
          this.formData=new FormData();
          // this.stMappingForm.reset();
        }
      );
    } else if (stockType == 'Edit Older') {
      this.editOlderStockColumns = [];
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {

          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'success',
            summary: 'File Uploaded Successfully',
            life: 3000,
          });
          this.editOlderStockColumns = res.data.headers;
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !!',
            life: 300000,
          });
        },
        () => {
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles();
          this.formData=new FormData();
          // this.stMappingForm.reset();
        }
      );
    }
    else if (stockType == 'Edit Current From Table') {
      this.showCurrentStockColumnsInTable = [];
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'success',
            summary: 'File Uploaded Successfully',
            life: 3000,
          });
          this.showCurrentStockColumnsInTable = res.data.headers;
          // console.log('edit current ', this.showCurrentStockColumnsInTable);
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !!',
            life: 300000,
          });
        },
        () => {
          this.globalBlockUIService.stopLoading();
          this.formData=new FormData();
        
          this.clearSelectedFiles();
          // this.stMappingForm.reset();
        }
      );
    } else if (stockType == 'Edit Older From Table') {
      this.showOlderStockColumnsInTable = [];
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.showOlderStockColumnsInTable = res.data.headers;

          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'success',
            summary: 'File Uploaded Successfully',
            life: 3000,
          });
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !!',
            life: 300000,
          });
        },
        () => {
          this.globalBlockUIService.stopLoading();
         this.clearSelectedFiles();
         this.formData=new FormData();
        //  this.stMappingForm.get()();
        }
      );
    }
  }

  clearSelectedFiles() {
    if (this.fileUpload) {
      this.fileUpload.clear();  // Clear the file input from the p-fileupload component
    }
  }
  onCheckboxChangeInView(event: Event) {
    this.isViewMappingForBothStocks = (
      event.target as HTMLInputElement
    ).checked;
  }

  onCheckboxChange(event: Event) {
    this.isMappingForBothOlder = (event.target as HTMLInputElement).checked;
  }

  editOlderStock() {
    this.editOlderDaysStock = true;
    this.editOlderDaysStockForm.get('partNumber')?.enable();
    this.editOlderDaysStockForm.get('stockQty')?.enable();
    this.editOlderDaysStockForm.get('location')?.enable();
  }

  editCurrentStock() {
    this.editCurrentDaysStock = true;
    this.editCurrentDayStockForm.get('partNumber')?.enable();
    this.editCurrentDayStockForm.get('stockQty')?.enable();
    this.editCurrentDayStockForm.get('location')?.enable();
  }

  onSubmit() {
    // console.log("clicked ",this.isMappingForBothOlder)
    if (this.isMappingForBothOlder) {
      if (this.currentStockForm.valid && this.olderStockForm.valid) {
        this.validMappingForBothStock = true;
      }
      if (this.currentStockForm.invalid) {
        this.validMappingForBothStock = false;
        // console.log("current stock invalid")
        Object.keys(this.currentStockForm.controls).forEach(
          (controlName: any) => {
            this.currentStockForm.get(controlName)?.markAsTouched();
          }
        );
      }

      if (this.olderStockForm.invalid) {
        this.validMappingForBothStock = false;
        //  console.log("older stock invalid")
        Object.keys(this.olderStockForm.controls).forEach(
          (controlName: any) => {
            this.olderStockForm.get(controlName)?.markAsTouched();
          }
        );
      }

      if (this.validMappingForBothStock) {
        this.globalBlockUIService.startLoading();
        this.stockUploadMappingService
          .addColumnMapping({
            brandId: this.stMappingForm.value.brands,
            values: this.currentStockForm.value,
            brandColumns: this.currentStockColumns,
            userId: 1,
            stockType: 'current',
          })
          .subscribe(
            (res: any) => {
             
              this.stMappingForm.reset();
              this.currentStockForm.reset();
              this.currentStockColumns = [];
              this.stockUploadMappingService
                .addColumnMapping({
                  brandId: this.stMappingForm.value.brands,
                  values: this.olderStockForm.value,
                  brandColumns: this.olderStockColumns,
                  userId: 1,
                  stockType: 'older',
                })
                .subscribe(
                  (res: any) => {
                    
                    this.stMappingForm.reset();
                    this.olderStockForm.reset();
                    this.olderStockColumns = [];
                    this.messageService.add({
                      severity: 'success',
                      life: 10000,
                      summary: 'Mapping is created Successfully.',
                    });
                  },
                  (error: any) => {
                    this.stMappingForm.reset();
                    this.olderStockForm.reset();
                    this.olderStockColumns = [];
                    this.messageService.add({
                      severity: 'error',
                      summary:
                        'Error in creating mapping in older days stock !!',
                      life: 300000,
                    });
                  },
                  () => {
                    this.globalBlockUIService.stopLoading();
                  }
                );
              // this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully for Current Stock'})
            },
            (error: any) => {
              this.stMappingForm.reset();
              this.currentStockForm.reset();
              this.currentStockColumns = [];
              this.messageService.add({
                severity: 'error',
                summary: 'Error in creating mapping in current days stock !!',
                life: 300000,
              });
            },
            () => {
              this.globalBlockUIService.stopLoading();
              this.clearSelectedFiles()
            }
          );
      }
    } else {
      if (this.currentStockForm.invalid) {
        Object.keys(this.currentStockForm.controls).forEach(
          (controlName: any) => {
            this.currentStockForm.get(controlName)?.markAsTouched();
          }
        );
      } else {
        this.globalBlockUIService.startLoading();
        this.stockUploadMappingService
          .addColumnMapping({
            brandId: this.stMappingForm.value.brands,
            values: this.currentStockForm.value,
            brandColumns: this.currentStockColumns,
            userId: 1,
            stockType: 'current',
          })
          .subscribe(
            (res: any) => {
              this.stockUploadMappingService
              .addColumnMapping({
                brandId: this.stMappingForm.value.brands,
                values: this.currentStockForm.value,
                brandColumns: this.currentStockColumns,
                userId: 1,
                stockType: 'older',
              }).subscribe((res1:any)=>{

                this.stMappingForm.reset();
                this.currentStockForm.reset();
                this.currentStockColumns = [];
                this.messageService.add({
                  severity: 'success',
                  life: 10000,
                  summary: 'Mapping is created Successfully.',
                });
              })
            },
            (error: any) => {
              this.stMappingForm.reset();
              this.currentStockForm.reset();
              this.currentStockColumns = [];
              this.messageService.add({
                severity: 'error',
                summary: 'Error in creating mapping!!',
                life: 300000,
              });
            },
            () => {
              this.globalBlockUIService.stopLoading();
              this.clearSelectedFiles();
            }
          );
      }
    }
  }
}
