import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockUploadBySpmService {

  private url=environment.apiUrl;
  constructor(private http:HttpClient) { }

  uploadSingleLocationUpload(data:any):Observable<any>{
   return  this.http.post(`${this.url}stock-upload/single-location`,data);
  }

  getAllRecords(data:any):Observable<any>{
    return this.http.post(`${this.url}stock-upload/all-records`,data);
  }

  getPartNotInMaster(data:any):Observable<any>{
    return this.http.post(`${this.url}stock-upload/part-not-in-master`,data);
  }

  getUploadedData(data:any):Observable<any>{
    
    return this.http.post(`${this.url}stock-upload/all-uploadedData`,data);
  }

  uploadMultiLocation(data:any):Observable<any>{
    return this.http.post(`${this.url}stock-upload/multi-location`,data)
  }

  getMultiLocationUploadedData(data:any):Observable<any>{  
    return this.http.post(`${this.url}stock-upload/multi-uploadedData`,data,{responseType:'blob'})
  }

  getPartNotInMasterMultiLocation(data:any):Observable<any>{
    return this.http.post(`${this.url}stock-upload/part-not-in-master-ml`,data,{
      responseType:'blob'
    })
  }

  getRecordsMultiLocation(data:any):Observable<any>{
    return this.http.post(`${this.url}stock-upload/all-records-ml`,data)
  }

}
