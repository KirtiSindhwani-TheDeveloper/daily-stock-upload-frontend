import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockUploadByUserService {

  private url:any=environment.apiUrl;
  constructor(private http:HttpClient) { }

  uploadSingleStockUpload(data:any):Observable<any>{
    return this.http.post(`${this.url}upload/single-upload`,data)
  }

  getAllRecords(data:any):Observable<any>{
    return this.http.post(`${this.url}upload/all-records`,data)
  }

  bulkStockUpload(data:any):Observable<any>{
    return this.http.post(`${this.url}upload/bulk-upload`,data)
  }

  getPartNotInMaster(data:any):Observable<any>{
    return this.http.post(`${this.url}upload/part-not-in-master`,data)
  }
}
