import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  private url:any=environment.apiUrl;
  constructor(private http:HttpClient) { }

  getBrands():Observable<any>{
    return this.http.get(`${this.url}utilities/brands`);
  }

  singleUploadFile(data:any):Observable<any>{
    return this.http.post(`${this.url}utilities/upload`,data)
  }
}
