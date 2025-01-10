import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { appResolver } from './app.resolver';
import { WrapperComponent } from './domain/components/wrapper/wrapper.component';

export const routes: Routes = [
  {
    path: '',
    component: WrapperComponent,
    resolve: { data: appResolver },
  },
];
