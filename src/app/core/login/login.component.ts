import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { PrimengModuleModule } from '../../shared/primeng-module/primeng-module.module';



@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule,FormsModule,CommonModule,SharedModule,PrimengModuleModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoading:boolean=false
  visible: boolean = false;
  formSubmitted:boolean = false;
  isPasswordFilledVisible:boolean=false;
  visibleTwoFactor:boolean=false;
  otp:any;
  secretKey:any;
  token:any;
  qrCodeUrl: string = '';
  OTP: string = '';
  loginUser:any=[];
  isResetClicked:boolean=false;
  private modalVisibilitySubscription: any;
  getOtp:boolean=true;
  userId:any;
  userLoginInputDetails : FormGroup = new FormGroup({
    email: new FormControl('',[Validators.required]),
    userPassword: new FormControl('',[Validators.required])
  })

  updateInfoForm:FormGroup;
  isPasswordVisible = false;
  constructor(private loginService:LoginService,
    private messageService:MessageService,
    private authService:AuthService,
    private router:Router,
    private fb:FormBuilder,
    private cookieService:CookieService
  ){

    this.updateInfoForm=this.fb.group({
      email: new FormControl('',[Validators.required,Validators.email]),
      password: new FormControl('',[Validators.required]),
      otp:new FormControl('',[Validators.required])
    })
  }

  ngOnInit(){
    // this.modalVisibilitySubscription = this.loginService.modalVisibility$.subscribe(isVisible => {
    //   this.visible = isVisible;
    // });
  }

  shouldShowError(controlName: string) {
    const control = this.updateInfoForm.get(controlName);
    return (control?.touched || this.formSubmitted) && control?.invalid;
  }
 
  onLogin() {
    if(this.userLoginInputDetails.valid){
      let email=this.userLoginInputDetails.value.email;
      let password=this.userLoginInputDetails.value.userPassword
      // console.log(email,password)
      this.isLoading=true;
      this.authService.login({email:email,userPassword:password}).subscribe((res:any)=>{
       // console.log("res ",res)
        this.visibleTwoFactor=true;
        
        this.loginUser={...res.user,refreshToken:res.refreshToken,accessToken:res.accessToken};
        if(res.user){
          this.secretKey=res.user.secretKey;
          // this.cookieService.set('refreshToken',res.refreshToken)
          // localStorage.setItem('authToken',res.accessToken)
              this.userId=res.user.userId;
              // localStorage.setItem('userId',res.user.userId)
              // // localStorage.setItem('authToken', res.data);
              // localStorage.setItem('designationId',res.user.designationId)
              // localStorage.setItem('roleId',res.user.roleId)
              // localStorage.setItem('name',res.user.name)
              // localStorage.setItem('status',res.user.status)
              // localStorage.setItem('isLoggedIn','true')
             //this.qrCodeUrl=res.qr
            
  
        }

        
        this.isLoading=false;
      },(error:any)=>{
        this.isLoading=false;
        this.messageService.add({severity:'error',summary:'Invalid Credentials',life:10000})
      })
      
    }
    else{
      Object.keys(this.userLoginInputDetails.controls).forEach(controlName => {
        this.userLoginInputDetails.get(controlName)?.markAsTouched();
      });
    }
     
  }

  verifyOTP(){
    //console.log(this.token)
    if(!this.OTP){
      
      this.messageService.add({severity:'error',life:30000,detail:'OTP cannot be Blank...'})
      return;
    }
    else{
      this.isLoading=true;
      this.authService.twoFactorAuthentication({token:this.OTP,secret:this.secretKey,userId:this.userId}).subscribe( (response) => {
        // this.messageService.add({severity:'success',life:300000,summary:'Invalid OTP',detail:'Try Again!!'})
         this.isLoading=false;

              this.userLoginInputDetails.reset();
              this.router.navigate(['/dashboard']);
              this.OTP=''
              // this.loginUser={...res.user,refreshToken:res.refreshToken,accessToken:res.accessToken};
              this.cookieService.set('refreshToken',this.loginUser.refreshToken)
              localStorage.setItem('authToken',this.loginUser.accessToken)
                  localStorage.setItem('userId',this.loginUser.userId)
                  // localStorage.setItem('authToken', res.data);
                  localStorage.setItem('designationId',this.loginUser.designationId)
                  localStorage.setItem('roleId',this.loginUser.roleId)
                  localStorage.setItem('name',this.loginUser.name)
                  localStorage.setItem('status',this.loginUser.status)
                  localStorage.setItem('isLoggedIn','true')
        // alert('2FA verified successfully!');
      },
      (error:any) => {
        this.isLoading=false;
        this.OTP=''
        this.messageService.add({severity:'error',life:300000,summary:'Invalid OTP',detail:'Try re-scanning QR Code Again!!'})
        // alert('Invalid OTP');
      })

    }
  }

  resetAuthentication(){
    this.isResetClicked=true;
    this.authService.generateQR().subscribe((res:any)=>{
      this.qrCodeUrl=res.qr;
      this.secretKey=res.secret;
    })
  }
  showAuthDialog(){
    this.visibleTwoFactor=true;
  }

cancel(){
  this.loginService.closeModal();
  this.visible=false
  this.resetForm();
}
  send(){
    this.getOtp=false
  }
  showDialog() {
    this.updateInfoForm.reset();
    this.resetForm();
    this.visible = true;
    this.isPasswordFilledVisible=false;
    this.getOtp=true;
}
submit(){

if(this.updateInfoForm.get('email')?.valid){
  this.formSubmitted = true;
  if(this.getOtp){
    
    this.loginService.forgotPassword({email:this.updateInfoForm.value.email}).subscribe( {next: (res: any) => {
      if(res.status==200){
         this.getOtp=false;
      }
      // if(res.status==404){
      //   this.messageService.add({ severity: 'error', summary: 'Error', detail: 'This user does not exist', life: 3000 });
      // }
    },
    error: (err: any) => {
      this.getOtp=true
      // This block will execute if an error occurs (e.g., network issue, server error)
      // console.error('Error occurred:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'This user does not exist', life: 3000 });
    }})
  }
  if(!this.isPasswordFilledVisible && !this.getOtp){
    this.loginService.verifyOTP({email:this.updateInfoForm.value.email,otp:this.updateInfoForm.value.otp}).subscribe({
      next: (res: any) => {
       // console.log("Response received:", res);
        
        // Check if res and res.status exist before checking status
        if (res && res.status === 200) {
          this.isPasswordFilledVisible = true; // OTP valid, show password field
          this.token=res.error.token
          // console.log(token)
        } else if (res && res.status === 201) {
          this.messageService.add({ severity: 'warn', summary: 'Invalid OTP', life: 3000 });
        } else if (res && res.status === 400) {
          this.messageService.add({ severity: 'error', summary: 'Bad Request', detail: 'Invalid input or OTP.', life: 3000 });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.', life: 3000 });
        }
      },
      error: (err: any) => {
        // This block will execute if an error occurs (e.g., network issue, server error)
        console.error('Error occurred:', err);
        this.messageService.add({ severity: 'error', summary: 'Request Failed', detail: 'There was an issue with the OTP verification. Please try again.', life: 3000 });
      }
    })
    

  }
  if(this.isPasswordFilledVisible){
   // console.log(this.token)
    this.loginService.resetPassword({jwtToken:this.token,password:this.updateInfoForm.value.password}).subscribe((res:any)=>{
      if(res.status==200){
        this.visible=false;
        this.messageService.add({ severity: 'info', summary: 'Your password has been updated successfully', life: 3000 });
      }
    })
  }

}
else{
  Object.keys(this.updateInfoForm.controls).forEach(controlName => {
    this.updateInfoForm.get('email')?.markAsTouched();
  });
}



  // this.updateInfoForm.reset();

}
resetForm() {
  this.updateInfoForm.reset({
    email: '',
    password: '',
    otp: ''
  });
  this.formSubmitted = false;
  // Mark the form controls as untouched and pristine to prevent immediate validation
  this.updateInfoForm.markAsUntouched();
  this.updateInfoForm.markAsPristine();
}
}
