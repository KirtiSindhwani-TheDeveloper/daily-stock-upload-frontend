import { Component, ViewChild } from '@angular/core';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';
import { SharedModule } from '../../shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  FormArray,
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
  @ViewChild('fu') fu: FileUpload|null =null;
 
  selectedBrand: any;
  brands: any = [];
  formData = new FormData()
  stMappingForm: FormGroup;
  isMappingForBothOlder: boolean = false;
  visible: boolean = false;
  showUploader:boolean=true
  columnsForStockCalculation:any[]=[];
  operatorsColumns:any[]=["-","+"]
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
  isCurrentQtyOne:boolean=false;
  isOlderQtyOne:boolean=false
  rowData:any=[];
  selectedFile:any;
  selectedFileName:any;
  stockCalculationForm:FormGroup;
  first: number = 0;
  visibleStockCalculation:boolean=false;
  users:any=[{
    id:1,name:'Kirti'
  }]
  stockType:any;
  calculativeFormula:any=''
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
      stockQty: [[], Validators.required],
      location: ['', Validators.required],
      file:[null],
      calculativeField:[]
      
    });
    this.stockCalculationForm = this.fb.group({
      firstColumn: [null, Validators.required],
      operations: this.fb.array([])
    });

    this.currentStockForm = this.fb.group({
      partNumber: [null, Validators.required],
      location: [null, Validators.required],
      stockQty: ['', Validators.required],
      file:[null],
      calculativeField:[]
     
      
    });

    this.olderStockForm = this.fb.group({
      partNumber: [null, Validators.required],
      location: [null, Validators.required],
      stockQty: ['', Validators.required],
      file:[null],
      calculativeField:[]
      
    });

    this.editCurrentDayStockForm = this.fb.group({
      partNumber: ['', Validators.required],
      stockQty: ['', Validators.required],
      location: ['', Validators.required],
      file:[null],
      calculativeField:[]
      
    });

    this.editOlderDaysStockForm = this.fb.group({
      partNumber: ['', Validators.required],
      stockQty: ['', Validators.required],
      location: ['', Validators.required],
      file:[null],
      calculativeField:[]
    });
  }

  ngOnInit() {
    // Disable the fields after initialization
    this.editOlderDaysStockForm.get('partNumber')?.disable();
    this.editOlderDaysStockForm.get('stockQty')?.disable();
    this.editOlderDaysStockForm.get('location')?.disable();
    this.editOlderDaysStockForm.get('calculativeField')?.disable();

    this.editCurrentDayStockForm.get('partNumber')?.disable();
    this.editCurrentDayStockForm.get('stockQty')?.disable();
    this.editCurrentDayStockForm.get('location')?.disable();
    this.editCurrentDayStockForm.get('calculativeField')?.disable();

    this.getBrands();

    this.editCurrentDayStockForm.get('stockQty')?.valueChanges.subscribe((value:any) => {
      this.checkStockQtySelection('edit current');
    });

    this.editOlderDaysStockForm.get('stockQty')?.valueChanges.subscribe((value:any) => {
      this.checkStockQtySelection('edit older');
    });
    
    
  }

  get operations(): FormArray {
    return this.stockCalculationForm.get('operations') as FormArray;
  }

  createOperationGroup(): FormGroup {
    return this.fb.group({
      operator: [null, Validators.required],
      column: [null, Validators.required]
    });
  }
  // createOperationGroup(operator?: string , column?: string): FormGroup {
  //   return this.fb.group({
  //     operator: [operator, Validators.required],
  //     column: [column, Validators.required]
  //   });
  // }
  

  showCalculationDialog(stockType:any,addCurrentDaysStockFromTable?:any,addOlderDaysStockFromTable?:any){
  // console.log("stock type 182 ",stockType,addCurrentDaysStockFromTable,addOlderDaysStockFromTable)
   
   this.columnsForStockCalculation=[];
    if(stockType=='current'){
      this.columnsForStockCalculation=this.currentStockForm.value.stockQty;
    //  console.log("form value ",this.currentStockForm.value)
      if(this.columnsForStockCalculation.length>1){
        this.visibleStockCalculation=true;
        this.resetOperations(); 
        const size = this.columnsForStockCalculation.length - 1;
       // console.log("size ",size)
        for (let i = 0; i < size; i++) {      
          this.operations.push(this.createOperationGroup());
        }
        this.stockType="current"
        
      }
      else{
        this.onSubmit('current');
       this.isCurrentQtyOne=true;
      }
    }
    if(stockType=='older'){
      this.columnsForStockCalculation=this.olderStockForm.value.stockQty;
    //  console.log("form value ",this.olderStockForm.value)
    
      if(this.columnsForStockCalculation.length>1){
        this.visibleStockCalculation=true;
        this.resetOperations(); 
        const size = this.columnsForStockCalculation.length - 1;
        for (let i = 0; i < size; i++) {
          this.operations.push(this.createOperationGroup());
        }
         this.stockType="older"
      }
      else{
       this.onSubmit('older')
    this.isOlderQtyOne=true;
      }
     
    }

    if(stockType=='Edit Current'){
      this.visibleStockCalculation=true;
   //   console.log("edit currentt in stock Qty ",this.editCurrentDayStockForm.value)
      this.columnsForStockCalculation=this.editCurrentDayStockForm.value.stockQty;
    //  console.log(this.columnsForStockCalculation)
   //   this.patchStockCalculation(this.viewMappedData[0].calculativeField)
      if(this.columnsForStockCalculation.length>1){
       
        this.visibleStockCalculation=true;
        this.resetOperations(); 
   
        const size = this.columnsForStockCalculation.length - 1;
       // console.log("size ",size)
        for (let i = 0; i < size; i++) {      
          this.operations.push(this.createOperationGroup());
        }
        this.stockType="Edit Current"   
      }
      else{
      //  this.onSubmit('Edit Current');
      this.isCurrentQtyOne=true;
      }
     
    }

    if(stockType=='Edit Older'){
      this.visibleStockCalculation=true;
    //  console.log("edit currentt in stock Qty ",this.editOlderDaysStockForm.value)
      this.columnsForStockCalculation=this.editOlderDaysStockForm.value.stockQty;
    //  console.log(this.columnsForStockCalculation)
   //   this.patchStockCalculation(this.viewMappedData[0].calculativeField)
      if(this.columnsForStockCalculation.length>1){
       
        this.visibleStockCalculation=true;
        this.resetOperations(); 
   
        const size = this.columnsForStockCalculation.length - 1;
       // console.log("size ",size)
        for (let i = 0; i < size; i++) {      
          this.operations.push(this.createOperationGroup());
        }
        this.stockType="Edit Older"   
      }
      else{
       // this.onSubmit('Edit Older');
       this.isOlderQtyOne=true;
      }
 
    }

    if(stockType=='Add From Table'){
    //  console.log("is executed 269 ",addCurrentDaysStockFromTable,addOlderDaysStockFromTable)
      this.visibleStockCalculation=true;
      if(addCurrentDaysStockFromTable){
      //  console.log("Add currentt from table in stock Qty ",this.currentStockForm.value)

        this.columnsForStockCalculation=this.currentStockForm.value.stockQty;
       //   console.log("form value ",this.columnsForStockCalculation)
          if(this.columnsForStockCalculation.length>1){
            this.visibleStockCalculation=true;
            this.resetOperations(); 
            const size = this.columnsForStockCalculation.length - 1;
           // console.log("size ",size)
            for (let i = 0; i < size; i++) {      
              this.operations.push(this.createOperationGroup());
            }
            this.stockType="add current"
            
          }
          else{
         //   console.log("else executed ")
            this.visibleStockCalculation=false;
            this.isCurrentQtyOne=true
            this.addMappingFromTable(addCurrentDaysStockFromTable,addOlderDaysStockFromTable);
          }
        }
       
        if(addOlderDaysStockFromTable){
          this.visibleStockCalculation=true;
         // console.log("Add older from table in stock Qty ",this.olderStockForm.value)
          this.columnsForStockCalculation=this.olderStockForm.value.stockQty;
          //  console.log("form value ",this.currentStockForm.value)
            if(this.columnsForStockCalculation.length>1){
              this.visibleStockCalculation=true;
              this.resetOperations(); 
              const size = this.columnsForStockCalculation.length - 1;
             // console.log("size ",size)
              for (let i = 0; i < size; i++) {      
                this.operations.push(this.createOperationGroup());
              }
              this.stockType="add older"
              
            }
          else{
         //   this.addMappingFromTable(addCurrentDaysStockFromTable,addOlderDaysStockFromTable);
         this.isOlderQtyOne=true;
          }
        }
      }

      if(stockType=='Edit Current From Table'){
        this.columnsForStockCalculation=this.editCurrentDayStockForm.value.stockQty;
    //  console.log("form value ",this.editCurrentDayStockForm.value)
      if(this.columnsForStockCalculation.length>1){
        this.visibleStockCalculation=true;
        this.resetOperations(); 
        const size = this.columnsForStockCalculation.length - 1;
       // console.log("size ",size)
        for (let i = 0; i < size; i++) {      
          this.operations.push(this.createOperationGroup());
        }
        this.stockType="Edit Current From Table"
       // this.editFromTable(addCurrentDaysStockFromTable,addOlderDaysStockFromTable);
       
      }
      else{
        this.isCurrentQtyOne=true;
     //   this.editFromTable(addCurrentDaysStockFromTable,addOlderDaysStockFromTable);
      }
    }
      if(stockType=='Edit Older From Table'){
        this.columnsForStockCalculation=this.editOlderDaysStockForm.value.stockQty;
    //  console.log("form value ",this.currentStockForm.value)
      if(this.columnsForStockCalculation.length>1){
        this.visibleStockCalculation=true;
        this.resetOperations(); 
        const size = this.columnsForStockCalculation.length - 1;
       // console.log("size ",size)
        for (let i = 0; i < size; i++) {      
          this.operations.push(this.createOperationGroup());
        }
        this.stockType="Edit Older From Table"
      // this.editFromTable(addCurrentDaysStockFromTable,addOlderDaysStockFromTable);
      }
      else{
       // this.editFromTable(addCurrentDaysStockFromTable,addOlderDaysStockFromTable);
       this.isOlderQtyOne=true;
      }
      }
  }

  checkStockQtySelection(stockType:any){
    
    if(stockType=='edit current'){
      this.editCurrentDayStockForm.get('stockQty')?.valueChanges.subscribe((selected: any[]) => {
        this.isCurrentQtyOne = selected.length >1 ? false:true;
      });
    }

    if(stockType=='edit older'){
      this.editOlderDaysStockForm.get('stockQty')?.valueChanges.subscribe((selected: any[]) => {
        this.isOlderQtyOne = selected.length >1 ? false:true;
      });
    }

    console.log("is stock one ",this.isCurrentQtyOne,this.isOlderQtyOne)

   
  }

  resetOperations() {
    while (this.operations.length !== 0) {
      this.operations.removeAt(0);
    }
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
          id:item.id,
          current_calculativeField:item.calculativeField
          
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
          older_calculativeField:item.calculativeField
        };
      }

      return acc;
    }, {});

    //  console.log("grouped data ",groupedData)

    const finalResult = Object.keys(groupedData).map((brand_id) => {
      const data = groupedData[brand_id];
    //  console.log("data ",data)
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
        older_calculativeField:data.older.older_calculativeField,
        current_calculativeField:data.current.current_calculativeField
      };
    });
    this.tableData = finalResult;
    // console.log(this.tableData);
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
    this.editOlderDaysStockForm.get('calculativeField')?.disable();

    this.editCurrentDayStockForm.get('partNumber')?.disable();
    this.editCurrentDayStockForm.get('stockQty')?.disable();
    this.editCurrentDayStockForm.get('location')?.disable();
    this.editCurrentDayStockForm.get('calculativeField')?.disable();
    this.visible = true;
   this.viewColumnMapping()
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
    this.editOlderDaysStockForm.get('calculativeField')?.disable();

    this.editCurrentDayStockForm.get('partNumber')?.disable();
    this.editCurrentDayStockForm.get('stockQty')?.disable();
    this.editCurrentDayStockForm.get('location')?.disable();
    this.editCurrentDayStockForm.get('calculativeField')?.disable();
  //  console.log("stock type 519 ",stockType)
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
          stockQty: rowData.current_stock_qty.split(','),
          calculativeField:rowData.current_calculativeField
        });
         console.log("show current ",this.editCurrentDayStockForm.value)
      } else {
        this.showforAddCurrentData = true;
        this.showforEditOlderData = false;
        this.visibleAddPopUp = true;
        this.currentStockForm.reset();
      //  this.editCurrentDaysStock=false;
      this.editCurrentDaysStock=true;
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
       // console.log("older ",this.editOlderDaysStockForm.value)
        this.showOlderStockColumnsInTable=JSON.parse(rowData.olderBrandColumns);
        this.editOlderDaysStockForm.patchValue({
          partNumber: rowData.older_part_number,
          location: rowData.older_loc,
          stockQty: rowData.older_stock_qty.split(','),
          calculativeField:rowData.older_calculativeField
        });
       //console.log("older ",this.editOlderDaysStockForm.value,rowData.older_part_number,rowData.older_loc)
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

  editFromTable(isCurrent:any,isOlder:any,formula?:any){
    // console.log("edit fromtable ",isCurrent,isOlder)
    
    if (isCurrent) {
      if (this.editCurrentDayStockForm.valid) {
        if(this.showCurrentStockColumnsInTable.length==0){
          this.showCurrentStockColumnsInTable=JSON.parse(this.rowData.currentBrandColumns);
        }

        this.globalBlockUIService.startLoading();
        this.stockUploadMappingService
          .editColumnMapping({
            brandId: this.rowData?.brand_id,
            values: this.editCurrentDayStockForm.value,
            brandColumns: this.showCurrentStockColumnsInTable,
            calculativeField:formula,
            userId: 1,
            stockType: 'current',
            id: this.rowData.current_id,
          })
          .subscribe(
            (res: any) => {
              this.editCurrentDayStockForm?.get('file')?.reset();
              this.globalBlockUIService.stopLoading();
              this.visibleStockCalculation=false;
              this.viewAllExistingMapping();
              this.messageService.add({
                severity: 'success',
                summary: 'Mapping has been successfully updated !',
                life: 10000,
              });
            },
            (error: any) => {
              this.editCurrentDayStockForm?.get('file')?.reset();
              this.globalBlockUIService.stopLoading();
              this.visibleStockCalculation=false;
              this.messageService.add({
                severity: 'error',
                summary:
                  'Error in updating the mapping for current stocks !',
                life: 4000,
              });
            },
            () => {
              this.editCurrentDayStockForm?.get('file')?.reset();
              this.globalBlockUIService.stopLoading();
              this.visibleViewEditPopUp=false
              this.clearSelectedFiles();
              this.visibleStockCalculation=false;
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
        this.globalBlockUIService.startLoading();
        this.stockUploadMappingService
          .editColumnMapping({
            brandId: this.rowData?.brand_id,
            values: this.editOlderDaysStockForm.value,
            brandColumns: this.showOlderStockColumnsInTable,
            calculativeField:formula,
            userId: 1,
            stockType: 'older',
            id: this.rowData.older_id,
          })
          .subscribe(
            (res: any) => {
              this.editOlderDaysStockForm?.get('file')?.reset();
              this.globalBlockUIService.stopLoading();
              this.viewAllExistingMapping();
              this.visibleStockCalculation=false
              this.messageService.add({
                severity: 'success',
                summary: 'Mapping has been successfully updated !',
                life: 10000,
              });
            },
            (error: any) => {
              this.editOlderDaysStockForm?.get('file')?.reset();
              this.messageService.add({
                severity: 'error',
                summary:
                  'Error in updating the mapping for current stocks !',
                life: 4000,
              });
              this.visibleStockCalculation=false
            },
            () => {
              this.editOlderDaysStockForm?.get('file')?.reset();
              this.globalBlockUIService.stopLoading();
              this.visibleViewEditPopUp=false
              this.clearSelectedFiles();
              this.visibleStockCalculation=false;
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

    let formula=''
    if(this.visibleStockCalculation){
      if (this.stockCalculationForm.invalid) {
        this.stockCalculationForm.markAllAsTouched(); // show errors
        return;
      }else{
      this.calculativeFormula='';
    //  console.log("this cal form ",this.stockCalculationForm.value)
      const formValue = this.stockCalculationForm.value;
  
    this.calculativeFormula = formValue?.firstColumn?.trim() || '';
  
    if (formValue.operations && formValue.operations.length > 0) {
      for (const op of formValue.operations) {
        const operator = op.operator?.trim();
        const column = op.column?.trim();
  
        if (operator && column) {
          this.calculativeFormula += ` ${operator} ${column}`;
        }
      }
    }

   formula=this.calculativeFormula
  }
    }

    this.selectedFile=''
    this.selectedFileName=''
   // console.log("row data ",this.rowData)
   this.globalBlockUIService.startLoading();
    if(isCurrent){
      if(this.currentStockForm.valid){
        this.stockUploadMappingService.addColumnMapping({
          brandId: this.rowData?.brand_id,
            values: this.currentStockForm.value,
            brandColumns: this.currentStockColumns,
            calculativeField:formula,
            userId: 1,
            stockType: 'current',
        }).subscribe((res:any)=>{
          this.globalBlockUIService.stopLoading();
          this.viewAllExistingMapping();
          this.clearSelectedFiles()
          this.messageService.add({
            severity: 'success',
            summary: 'Mapping has been successfully updated !',
            life: 10000,
          });
        },(error:any)=>{
          this.clearSelectedFiles()
          this.messageService.add({
            severity: 'error',
            summary:
              'Error in updating the mapping for current stocks !',
            life: 4000,
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
        this.globalBlockUIService.startLoading();
        this.stockUploadMappingService.addColumnMapping({
          brandId: this.rowData?.brand_id,
            values: this.olderStockForm.value,
            brandColumns: this.olderStockColumns,
            calculativeField:formula,
            userId: 1,
            stockType: 'older',
        }).subscribe((res:any)=>{
          this.globalBlockUIService.stopLoading();
          this.viewAllExistingMapping();
          this.clearSelectedFiles();
          this.messageService.add({
            severity: 'success',
            summary: 'Mapping has been successfully updated !',
            life: 10000,
          });
        },(error:any)=>{
          this.clearSelectedFiles()
          this.messageService.add({
            severity: 'error',
            summary:
              'Error in updating the mapping for current stocks !',
            life: 4000,
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

  // editMappingWithViewEditBtn(formula?:any) {
  //   if (this.isViewMappingForBothStocks) {
  //     for (let i = 0; i < this.viewMappedData.length; i++) {
  //       this.globalBlockUIService.startLoading();
  //      // console.log("edit current ",this.editCurrentDayStockForm.value)
  //       if (this.editCurrentDayStockForm.valid) {
  //         if (this.viewMappedData[i].stock_type == 'current') {
  //           this.stockUploadMappingService
  //             .editColumnMapping({
  //               brandId: this.stMappingForm.value.brands,
  //               values: this.editCurrentDayStockForm.value,
  //               brandColumns: this.editCurrentStockColumns,
  //               calculativeField:formula,
  //               userId: 1,
  //               stockType: 'current',
  //               id: this.viewMappedData[i].id,
  //             })
  //             .subscribe(
  //               (res: any) => {
  //                 this.viewAllExistingMapping();
  //                 this.globalBlockUIService.stopLoading();
  //                 this.messageService.add({
  //                   severity: 'success',
  //                   summary: 'Mapping has been successfully updated !',
  //                   life: 10000,
  //                 });
  //               },
  //               (error: any) => {
  //                 this.globalBlockUIService.stopLoading();
  //                 this.messageService.add({
  //                   severity: 'error',
  //                   summary:
  //                     'Error in updating the mapping for current stocks !',
  //                   life: 4000,
  //                 });
  //               },
  //               () => {
  //                 this.globalBlockUIService.stopLoading();
  //                 this.visible=false
  //                 this.clearSelectedFiles()
  //               }
  //             );
  //         }
  //         else if(this.viewMappedData.length==1 && this.viewMappedData[0].stock_type=='older'){
  //           this.stockUploadMappingService.addColumnMapping({
  //             brandId: this.stMappingForm.value.brands,
  //               values: this.editCurrentDayStockForm.value,
  //               brandColumns: this.editCurrentStockColumns,
  //               userId: 1,
  //               calculativeField:formula,
  //               stockType: 'current',
  //           }).subscribe((res:any)=>{
  //             this.messageService.add({
  //               severity: 'success',
  //               summary: 'Mapping has been successfully updated !',
  //               life: 10000,
  //             });
  //           },(error:any)=>{
  //             this.messageService.add({
  //               severity: 'error',
  //               summary:
  //                 'Error in updating the mapping for current stocks !',
  //               life: 4000,
  //             });
  //           },()=>{
  //             this.globalBlockUIService.stopLoading();
  //             this.visible=false;
  //             this.clearSelectedFiles()
  //           })
  //         }
  //       } else {
  //         Object.keys(this.editCurrentDayStockForm.controls).forEach(
  //           (controlName: any) => {
  //             this.editCurrentDayStockForm
  //               ?.get(controlName)
  //               ?.markAllAsTouched();
  //           }
  //         );
  //       }

  //       if (this.editOlderDaysStockForm.valid) {
  //         this.globalBlockUIService.startLoading();
  //         if (this.viewMappedData[i].stock_type == 'older' ) {
  //           this.stockUploadMappingService
  //             .editColumnMapping({
  //               brandId: this.stMappingForm.value.brands,
  //               values: this.editOlderDaysStockForm.value,
  //               brandColumns: this.editOlderStockColumns,
  //               userId: 1,
  //               stockType: 'older',
  //               calculativeField:formula,
  //               id: this.viewMappedData[i].id,
  //             })
  //             .subscribe(
  //               (res: any) => {
  //                 this.globalBlockUIService.stopLoading();
  //                 this.viewAllExistingMapping();
  //                 // this.messageService.add({severity:'success',summary:'Mapping has been successfully updated !',life:10000})
  //               },
  //               (error: any) => {
  //                 this.globalBlockUIService.stopLoading();
  //                 this.messageService.add({
  //                   severity: 'error',
  //                   summary:
  //                     'Error in updating the mapping for older stocks !',
  //                   life: 4000,
  //                 });
  //               },
  //               () => {
  //                 this.globalBlockUIService.stopLoading();
  //                 this.clearSelectedFiles()
  //                 this.visible=false;
  //               }
  //             );
  //         }
  //         else if(this.viewMappedData.length==1 && this.viewMappedData[0].stock_type=='current'){
  //           this.stockUploadMappingService.addColumnMapping({
  //             brandId: this.stMappingForm.value.brands,
  //               values: this.editOlderDaysStockForm.value,
  //               brandColumns: this.editOlderStockColumns,
  //               userId: 1,
  //               calculativeField:formula,
  //               stockType: 'older',
  //           }).subscribe((res:any)=>{
  //             this.messageService.add({
  //               severity: 'success',
  //               summary: 'Mapping has been successfully updated !',
  //               life: 10000,
  //             });
  //           },(error:any)=>{
  //             this.messageService.add({
  //               severity: 'error',
  //               summary:
  //                 'Error in updating the mapping for older stocks !',
  //               life: 4000,
  //             });
  //           },()=>{
  //             this.globalBlockUIService.stopLoading();
  //             this.visible=false;
  //             this.clearSelectedFiles()
  //           })
  //         }
  //       } else {
  //         Object.keys(this.editOlderDaysStockForm.controls).forEach(
  //           (controlName: any) => {
  //             this.editOlderDaysStockForm?.get(controlName)?.markAllAsTouched();
  //           }
  //         );
  //       }
  //     }
  //   } else {
  //     if (this.editCurrentDayStockForm.valid) {
  //       this.globalBlockUIService.startLoading();

  //       this.stockUploadMappingService
  //         .editColumnMapping({
  //           brandId: this.stMappingForm.value.brands,
  //           values: this.editCurrentDayStockForm.value,
  //           brandColumns: this.editCurrentStockColumns,
  //           userId: 1,
  //           calculativeField:formula,
  //           stockType: 'current',
  //           id: this.viewMappedData[0].id,
  //         })
  //         .subscribe(
  //           (res: any) => {
  //             this.viewAllExistingMapping();
  //             this.globalBlockUIService.stopLoading();
  //             this.messageService.add({
  //               severity: 'success',
  //               summary: 'Mapping has been successfully updated !',
  //               life: 10000,
  //             });
  //           },
  //           (error: any) => {
  //             this.globalBlockUIService.stopLoading();
  //             this.messageService.add({
  //               severity: 'error',
  //               summary: 'Error in updating the mapping for current stocks !',
  //               life: 10000,
  //             });
  //           },
  //           () => {
  //             this.globalBlockUIService.stopLoading();
  //             this.visible=false;
  //             this.clearSelectedFiles()
  //           }
  //         );
  //     }
  //   }
  // }


  editMappingWithViewEditBtn(formula?:any){
    for (let i = 0; i < this.viewMappedData?.length; i++) {
      this.globalBlockUIService.startLoading();
     // console.log("edit current ",this.editCurrentDayStockForm.value)
     console.log("stok type 1007 ",this.stockType)
      if (this.editCurrentDayStockForm.valid) {
        if (this.viewMappedData[i].stock_type == 'current' && this.stockType=='Edit Current') {
          this.stockUploadMappingService
            .editColumnMapping({
              brandId: this.stMappingForm.value.brands,
              values: this.editCurrentDayStockForm.value,
              brandColumns: this.editCurrentStockColumns,
              calculativeField:formula,
              userId: 1,
              stockType: 'current',
              id: this.viewMappedData[i].id,
            })
            .subscribe(
              (res: any) => {
                this.viewAllExistingMapping();
                this.viewColumnMapping();
                this.visibleStockCalculation=false
                this.globalBlockUIService.stopLoading();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Mapping has been successfully updated !',
                  life: 10000,
                });
              },
              (error: any) => {
                this.globalBlockUIService.stopLoading();
                this.visibleStockCalculation=false;
                this.messageService.add({
                  severity: 'error',
                  summary:
                    'Error in updating the mapping for current stocks !',
                  life: 4000,
                });
              },
              () => {
                this.globalBlockUIService.stopLoading();
                this.visible=false
                this.clearSelectedFiles()
              }
            );
        }
       
      } else {
        this.globalBlockUIService.stopLoading()
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
        if (this.viewMappedData[i].stock_type == 'older' && this.stockType=='Edit Older' ) {
          this.stockUploadMappingService
            .editColumnMapping({
              brandId: this.stMappingForm.value.brands,
              values: this.editOlderDaysStockForm.value,
              brandColumns: this.editOlderStockColumns,
              userId: 1,
              stockType: 'older',
              calculativeField:formula,
              id: this.viewMappedData[i].id,
            })
            .subscribe(
              (res: any) => {
                this.globalBlockUIService.stopLoading();
                this.viewAllExistingMapping();
                this.visibleStockCalculation=false;
                this.viewColumnMapping();
                 this.messageService.add({severity:'success',summary:'Mapping has been successfully updated !',life:10000})
              },
              (error: any) => {
                this.globalBlockUIService.stopLoading();
                this.visibleStockCalculation=false;
                this.messageService.add({
                  severity: 'error',
                  summary:
                    'Error in updating the mapping for older stocks !',
                  life: 4000,
                });
              },
              () => {
                this.globalBlockUIService.stopLoading();
                this.clearSelectedFiles()
                this.visible=false;
              }
            );
        }
      } else {
        Object.keys(this.editOlderDaysStockForm.controls).forEach(
          (controlName: any) => {
            this.editOlderDaysStockForm?.get(controlName)?.markAllAsTouched();
          }
        );
      }
    }
  }
patchStockCalculation(formula: string) {
  if (!formula) return;

  const parts = formula
    .split(/([+\-*/])/g)
    .map(part => part.trim())
    .filter(part => part);

  if (!parts.length) return;

  // Step 1: Patch the first column value
  const first = parts[0];
 // this.stockCalculationForm.patchValue({ firstColumn: first });

  // Step 2: Clear previous operations and reset columns array
  this.operations.clear();
  this.columnsForStockCalculation = [first];

  // Step 3: Prepare the operations
  for (let i = 1; i < parts.length; i += 2) {
    const operator = parts[i];
    const column = parts[i + 1];

    if (operator && column) {
      // Update the columns list
      this.columnsForStockCalculation.push(column);

      // Create and add a new FormGroup for the operation
      // const group = this.createOperationGroup(operator,column);
     // group.patchValue({ operator, column });
      // this.operations.push(group)
      // ;
      this.stockCalculationForm.patchValue({
        operator:operator,
        column:column
      })
  
    }

  }



  // Step 4: Final log
 // console.log("✅ Final Form Value", this.stockCalculationForm.value, this.columnsForStockCalculation);
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
         console.log(this.viewMappedData);
        if (this.viewMappedData.length > 0) {
          this.isMappingExist = true;
          this.visibleMapping = true;
        //  console.log("view mapped data ",this.viewMappedData)

          if(this.viewMappedData.length==1){
            if (this.viewMappedData[0].stock_type == 'current') {
              this.editOlderStockColumns=[];
              this.editCurrentStockColumns = JSON.parse(
                this.viewMappedData[0]?.brandColumns
              );
              let calcField = this.viewMappedData[0].calculativeField;
              // if (calcField == null) {
              //   this.isQtyOne = true;
              // }
              
              this.editCurrentDayStockForm.patchValue({
                partNumber: this.viewMappedData[0].part_number,
                location: this.viewMappedData[0].loc,
                stockQty: this.viewMappedData[0].stock_qty.split(','),
                calculativeField: calcField
              });
             // this.patchStockCalculation(this.viewMappedData[0].calculativeField)
            }else{
              this.editCurrentStockColumns=[];
              this.editOlderStockColumns = JSON.parse(
                this.viewMappedData[0]?.brandColumns
              );
              //  console.log("edit older stock columns",this.editOlderStockColumns)
              let calcField = this.viewMappedData[0].calculativeField;
              // if (calcField == null) {
              //   this.isQtyOne = true;
              // }
              
              this.editOlderDaysStockForm.patchValue({
                partNumber: this.viewMappedData[0].part_number,
                location: this.viewMappedData[0].loc,
                stockQty: this.viewMappedData[0].stock_qty.split(','),
                calculativeField: calcField
              });
           //   this.patchStockCalculation(this.viewMappedData[0].calculativeField)
            }
          }
          else{

          for (let i = 0; i < this.viewMappedData.length; i++) {
           
            if (this.viewMappedData[i].stock_type == 'current') {
              j++;
              this.editCurrentStockColumns = JSON.parse(
                this.viewMappedData[i]?.brandColumns
              );
              let calcField = this.viewMappedData[i].calculativeField;
              // if (calcField == null) {
              //   this.isQtyOne = true;
              // }
              
              this.editCurrentDayStockForm.patchValue({

                partNumber: this.viewMappedData[i].part_number,
                location: this.viewMappedData[i].loc,
                stockQty: this.viewMappedData[i].stock_qty.split(','),
                calculativeField: calcField
              });
             
              //this.patchStockCalculation(this.viewMappedData[0].calculativeField)
              // console.log(this.editCurrentStockColumns)
            }
            if (this.viewMappedData[i].stock_type == 'older') {
              j++;
              this.editOlderStockColumns = JSON.parse(
                this.viewMappedData[i]?.brandColumns
              );
              //  console.log("edit older stock columns",this.editOlderStockColumns)
              let calcField = this.viewMappedData[i].calculativeField;
              // if (calcField == null) {
              //   this.isQtyOne = true;
              // }
              
              this.editOlderDaysStockForm.patchValue({
                partNumber: this.viewMappedData[i].part_number,
                location: this.viewMappedData[i].loc,
                stockQty: this.viewMappedData[i].stock_qty.split(','),
                calculativeField: calcField
              });
            //  this.patchStockCalculation(this.viewMappedData[0].calculativeField)
            }
          }
          if (j == 2) {
            this.isViewMappingForBothStocks = true;
          }
        } 
      }else {
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
          this.formData=new FormData();
          this.clearSelectedFiles();
          this.currentStockForm.get('file')?.reset();
          this.currentStockColumns = this.validateArray(res.data.headers);

          if(this.currentStockColumns?.length>0){
            this.messageService.add({
              severity: 'success',
              summary: 'File Uploaded Successfully',
              life: 4000,
            });
          }
        
        },
        (error: any) => {
          this.formData=new FormData();
          this.clearSelectedFiles();
          this.globalBlockUIService.stopLoading();
          this.currentStockForm.get('file')?.reset();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !',
            life: 4000,
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
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles();
          this.olderStockColumns = this.validateArray(res.data.headers);
          this.formData=new FormData();
          this.olderStockForm.get('file')?.reset();

          if(this.olderStockColumns?.length>0){
            this.messageService.add({
              severity: 'success',
              summary: 'File Uploaded Successfully',
              life: 4000,
            });
          }
         
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.formData=new FormData();
          this.clearSelectedFiles()
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !',
            life: 4000,
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
      this.globalBlockUIService.startLoading();
      this.editCurrentDayStockForm?.get('stockQty')?.reset();
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles()
          this.formData=new FormData();
          this.editCurrentDayStockForm.get('file')?.reset()
          this.editCurrentStockColumns = this.validateArray(res.data.headers);
          // console.log("show older stock ",this.editCurrentStockColumns)
          if(this.editCurrentStockColumns?.length>0){

            this.messageService.add({
              severity: 'success',
              summary: 'File Uploaded Successfully',
              life: 4000,
            });
          }

         
       //  console.log('edit current ', this.editCurrentStockColumns);
        },
        (error: any) => {
          this.clearSelectedFiles()
          this.formData=new FormData();
          this.globalBlockUIService.stopLoading();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !',
            life: 4000,
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
      this.globalBlockUIService.startLoading();
      this.editOlderStockColumns = [];
      this.editOlderDaysStockForm?.get('stockQty')?.reset();
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {

          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles()
          this.formData=new FormData();
          this.editOlderStockColumns = this.validateArray(res.data.headers);
          this.editOlderDaysStockForm.get('file')?.reset();
          if(this.editOlderStockColumns?.length>0){
            this.messageService.add({
              severity: 'success',
              summary: 'File Uploaded Successfully',
              life: 4000,
            });
          }
         
         
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles()
          this.formData=new FormData();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !',
            life: 4000,
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
      this.editCurrentDayStockForm?.get('stockQty')?.reset();
      this.globalBlockUIService.startLoading();
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.globalBlockUIService.stopLoading();
          this.showCurrentStockColumnsInTable = this.validateArray(res.data.headers);
        //  console.log("show current stock col ",this.showCurrentStockColumnsInTable)
          this.editCurrentDayStockForm.get('file')?.reset();
          if( this.showCurrentStockColumnsInTable?.length>0){
            this.messageService.add({
              severity: 'success',
              summary: 'File Uploaded Successfully',
              life: 4000,
            });
          }
         
          this.clearSelectedFiles()
          this.formData=new FormData();
          
          // console.log('edit current ', this.showCurrentStockColumnsInTable);
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles()
          this.formData=new FormData();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !',
            life: 4000,
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
      this.editOlderDaysStockForm?.get('stockQty')?.reset();
      this.globalBlockUIService.startLoading();
      this.utilitiesService.singleUploadFile(this.formData).subscribe(
        (res: any) => {
          this.showOlderStockColumnsInTable = this.validateArray(res.data.headers);
        //  console.log("show older stock col ",this.showOlderStockColumnsInTable)
          this.editOlderDaysStockForm.get('file')?.reset();
        if(this.showOlderStockColumnsInTable?.length>0){
          this.messageService.add({
            severity: 'success',
            summary: 'File Uploaded Successfully',
            life: 4000,
          });
        }
          this.clearSelectedFiles()
          this.formData=new FormData();
          this.globalBlockUIService.stopLoading();
        
        },
        (error: any) => {
          this.globalBlockUIService.stopLoading();
          this.clearSelectedFiles()
          this.formData=new FormData();
          this.messageService.add({
            severity: 'error',
            summary: 'Error in uploading the file !',
            life: 4000,
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


  validateArray(arr:any[]) {
    if (arr?.includes(null) || arr?.includes("")) {
      return this.messageService.add({severity:'error',life:4000,summary:'Headers cannot contains empty columns!'})
    }
 //  console.log(arr)
    return arr; // Valid
  }

  clearSelectedFiles() {
   
      this.fu?.clear();  // Clear the file input from the p-fileupload component
      this.selectedFile=null;
      this.selectedFileName=null;
    
      this.showUploader = false;

      setTimeout(() => {
        this.showUploader = true;
      }, 0);
      this.formData=new FormData();
    
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

  onSubmit(stockType?:any,editCurrentFromTable?:any,editOlderFromTable?:any) {
     console.log("clicked ",stockType,this.stockCalculationForm.invalid)
    if(this.visibleStockCalculation){
      if (this.stockCalculationForm.invalid) {
        this.stockCalculationForm.markAllAsTouched(); // show errors
        return;
      }else{
      this.calculativeFormula='';
    //  console.log("this cal form ",this.stockCalculationForm.value)
      const formValue = this.stockCalculationForm.value;
  
    this.calculativeFormula = formValue?.firstColumn?.trim() || '';
  
    if (formValue.operations && formValue.operations.length > 0) {
      for (const op of formValue.operations) {
        const operator = op.operator?.trim();
        const column = op.column?.trim();
  
        if (operator && column) {
          this.calculativeFormula += ` ${operator} ${column}`;
        }
      }
    }
  }
    }
   
    if(stockType=='Edit Current'){
      this.editMappingWithViewEditBtn(this.calculativeFormula)
    }

    if(stockType=='Edit Older'){
      this.editMappingWithViewEditBtn(this.calculativeFormula)
    }

    if(stockType=='Edit Current From Table'){
  //    console.log("executed ")
      this.editFromTable(true,false,this.calculativeFormula)
    }

    if(stockType=='Edit Older From Table'){
      this.editFromTable(false,true,this.calculativeFormula)
    }
  // console.log("calculative formula ",this.calculativeFormula)
    if (this.isMappingForBothOlder) {
      if(stockType=='current'){
        if (this.currentStockForm.invalid) {
          this.validMappingForBothStock = false;
          // console.log("current stock invalid")
          Object.keys(this.currentStockForm.controls).forEach(
            (controlName: any) => {
              this.currentStockForm.get(controlName)?.markAsTouched();
            }
          );
        }
        else{
          this.globalBlockUIService.startLoading();
          this.visibleStockCalculation=false;
          this.stockUploadMappingService
            .addColumnMapping({
              brandId: this.stMappingForm.value.brands,
              values: this.currentStockForm.value,
              brandColumns: this.currentStockColumns,
              calculativeField:this.calculativeFormula,
              userId: 1,
              stockType: 'current',
            })
            .subscribe(
              (res: any) => {
                this.globalBlockUIService.stopLoading();
                      this.currentStockForm.reset();
                      this.currentStockColumns=[];
                      this.clearSelectedFiles()
                      this.messageService.add({
                        severity: 'success',
                        life: 10000,
                        summary: 'Mapping is created Successfully for current days stock.',
                      });
                    },
                    (error: any) => {
                      this.globalBlockUIService.stopLoading();
                      this.stMappingForm.reset();
                      this.currentStockForm.reset();
                      this.currentStockColumns=[];
                      this.clearSelectedFiles()
                      this.messageService.add({
                        severity: 'error',
                        summary:
                          'Error in creating mapping for current stock days stock !',
                        life: 4000,
                      });
                    },
                    () => {
                      this.globalBlockUIService.stopLoading();
                    }
                  );
                // this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully for Current Stock'})           
        }
      }
    
      if (stockType=='older') {
        //  console.log("older stock invalid")
        if(this.olderStockForm.invalid){
          Object.keys(this.olderStockForm.controls).forEach(
            (controlName: any) => {
              this.olderStockForm.get(controlName)?.markAsTouched();
            }
          );
        }
        else{
          this.globalBlockUIService.startLoading();
          this.visibleStockCalculation=false;
          this.stockUploadMappingService
          .addColumnMapping({
            brandId: this.stMappingForm.value.brands,
            values: this.olderStockForm.value,
            brandColumns: this.olderStockColumns,
            userId: 1,
            stockType: 'older',
            calculativeField:this.calculativeFormula,
          })
          .subscribe(
            (res: any) => {
              
              this.currentStockForm.reset();
              this.currentStockColumns=[];
              this.olderStockForm.reset();
              this.olderStockColumns = [];
              this.globalBlockUIService.stopLoading();
              this.selectedFile=null;

              this.clearSelectedFiles()
              this.messageService.add({
                severity: 'success',
                life: 10000,
                summary: 'Mapping is created Successfully for older days stock',
              });
            },
            (error: any) => {
              this.stMappingForm.reset();
              this.olderStockForm.reset();
              this.olderStockColumns = [];
              this.globalBlockUIService.stopLoading();
              this.clearSelectedFiles()
              this.messageService.add({
                severity: 'error',
                summary:
                  'Error in creating mapping in older days stock !',
                life: 4000,
              });
            },
            () => {
               this.globalBlockUIService.stopLoading();
              this.clearSelectedFiles()
            }
          );        
                // this.messageService.add({severity:'success',life:10000,summary:'Mapping is created Successfully for Current Stock'})
        }
       
      }   
    } else {
      let brandId=this.stMappingForm.value.brands;
      if (this.currentStockForm.invalid) {
        Object.keys(this.currentStockForm.controls).forEach(
          (controlName: any) => {
            this.currentStockForm.get(controlName)?.markAsTouched();
          }
        );
      } else {
        this.globalBlockUIService.startLoading();
        this.visibleStockCalculation=false;
        this.stockUploadMappingService
          .addColumnMapping({
            brandId: brandId,
            values: this.currentStockForm.value,
            brandColumns: this.currentStockColumns,
            userId: 1,
            calculativeField:this.calculativeFormula,
            stockType: 'current',
          })
          .subscribe(
            (res: any) => {
              this.stockUploadMappingService
              .addColumnMapping({
                brandId: brandId,
                values: this.currentStockForm.value,
                brandColumns: this.currentStockColumns,
                userId: 1,
                calculativeField:this.calculativeFormula,
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
                summary: 'Error in creating mapping!',
                life: 4000,
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
