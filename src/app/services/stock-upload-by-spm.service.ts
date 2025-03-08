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
}
