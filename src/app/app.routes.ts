import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path:'mapping',
        loadChildren:()=> import('../app/mapping/mapping.module').then(m=>m.MappingModule)
    }
];
