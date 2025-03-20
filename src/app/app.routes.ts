import { Routes } from '@angular/router';
import { LoginComponent } from './core/login/login.component';

export const routes: Routes = [

    {
        path:'mapping',
        loadChildren:()=> import('../app/mapping/mapping.module').then(m=>m.MappingModule)
    },

    {
        path:'upload',
        loadChildren:()=> import('../app/stock-upload-by-spm/stock-upload-by-spm.module').then(m=>m.StockUploadBySpmModule)
    },

    {
        path:'stock-upload',
        loadChildren:()=> import('../app/stock-upload-by-scs-user/stock-upload-by-scs-user.module').then(m=>m.StockUploadByScsUserModule)
    },
    // {
    //     path:'login',
    //     component:LoginComponent,
    // },
    {
        path: '**', redirectTo:'mapping/stock-upload',
        pathMatch:'full'
    },
    




];
