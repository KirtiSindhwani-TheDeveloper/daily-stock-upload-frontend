import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DealerLocationMappingService {

  private url=environment.apiUrl;
  constructor(private http:HttpClient) { }


  uploadDealerLocationMapping(data:any):Observable<any>{

    return this.http.post(`${this.url}dl-mapping/create`,data)
  }

  exportToExcel(data:any):Observable<any>{
    return this.http.post(`${this.url}dl-mapping/export`,data);
  }
}
