import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router,private http: HttpClient,
    private cookieService:CookieService) { }
  private accessTokenKey = 'authToken';
  private refreshTokenKey = 'refreshToken';

  private loggedIn = new BehaviorSubject<boolean>(false);
  loggedIn$ = this.loggedIn.asObservable();
  apiUrl=environment.apiUrl

  // Login method: sends credentials to API and stores tokens
  login(data:any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}auth-user/auth`, data)
      // .pipe(
      //   tap((response:any) => {
      //     this.storeTokens(response.accessToken, response.refreshToken);
      //     this.loggedIn.next(true);
      //   })
      // );
  }

  // Refresh access token using the refresh token
   refreshAccessToken(): Observable<any> {
    const refreshToken = localStorage.getItem(this.refreshTokenKey);

    if (!refreshToken) {
      // this.messageService.add({severity:'warn',summary:'Kindly re-login Again !!!',life:20000000})
      throw new Error('No refresh token available');
    }

    try {
      return this.http
        .post<{ accessToken: string }>(`${this.apiUrl}/auth-user/refresh`, { refreshToken })
        
      // Store the new access token and return it
      // this.storeAccessToken(response.accessToken);
      // return response.accessToken;
    } catch (error) {
      // Handle refresh token errors (e.g., expired or invalid refresh token)
      throw new Error('Failed to refresh access token');
    }
  
  }


  // Get the access token from localStorage
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }


  // Logout the user by clearing the tokens
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId')
    localStorage.removeItem('designationId')
    localStorage.removeItem('roleId')
    localStorage.removeItem('status')
    localStorage.removeItem('name')
    localStorage.setItem('isLoggedIn','false')
    this.cookieService.deleteAll()
    // localStorage.removeItem(this.refreshTokenKey);
    this.loggedIn.next(false);
    this.router.navigate(['/login'])
  }

  // Add JWT to request header for protected routes
  addAuthHeader(): HttpHeaders {
    const token = this.getAccessToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  isAuthenticated(): boolean {
    // You can check for a token in local storage or session
    return !!localStorage.getItem('authToken'); 
  }

  twoFactorAuthentication(data:any):Observable<any>{
    return this.http.post(`${this.apiUrl}auth-user/verify`,data)
  }

  generateQR():Observable<any>{
    return this.http.get(`${this.apiUrl}auth-user/generate-qr`)
  }

  checkEmail(data:any):Observable<any>{
    return this.http.post(`${this.apiUrl}auth-user/check-email`,data)
  }

  updatePasswordWhileCreatingUser(data:any):Observable<any>{
    return this.http.post(`${this.apiUrl}auth-user/update-user`,data)
  }
}
