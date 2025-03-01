import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ObservableLike } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockUploadMappingService {

  private url=environment.apiUrl;
  constructor(private http:HttpClient) { }

  addColumnMapping(data:any):Observable<any>{
    return this.http.post(`${this.url}st-mapping/create`,data);
  }

  viewColumnMapping(data:any):Observable<any>{
    return this.http.post(`${this.url}st-mapping/view`,data);
  }

  editColumnMapping(data:any):Observable<any>{
    return this.http.post(`${this.url}st-mapping/edit`,data);
  }

  alreadyExistedMapping(data:any):Observable<any>{
    return this.http.post(`${this.url}st-mapping/already-existed`,data);
  }
}
