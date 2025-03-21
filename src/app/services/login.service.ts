import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private url=environment.apiUrl;

  constructor(private http:HttpClient,private cookieService: CookieService) { }

  login(data:any):Observable<any>{
    return this.http.post(`${this.url}login/user`,data)
  }

  forgotPassword(data:any):Observable<any>{
    return this.http.post(`${this.url}login/forgot-password`,data);
  }

  verifyOTP(data:any):Observable<any>{
    return this.http.post(`${this.url}login/verify-otp`,data);
  }

  resetPassword(data:any):Observable<any>{
    return this.http.post(`${this.url}login/reset-password`,data);
  }

  private modalVisibilitySubject = new Subject<boolean>();

  // Observable to expose modal visibility changes
  modalVisibility$ = this.modalVisibilitySubject.asObservable();

  // Method to open the modal
  openModal() {
    this.modalVisibilitySubject.next(true);  // Emit 'true' to show the modal
  }

  // Method to close the modal
  closeModal() {
    this.modalVisibilitySubject.next(false);  // Emit 'false' to hide the modal
  }

  loginUser(data:any):Observable<any>{
    return this.http.post(`${this.url}auth-user/auth`,data
    //   ,{
    //   observe: 'response',  // Capture the full response including headers
    // //  withCredentials:true
    // }
  )
  }
  getCookieValue(cookieName: string): string {
    return this.cookieService.get(cookieName);
  }
}
