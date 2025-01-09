import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HeaderComponent } from './domain/components/header/header.component';
import { TableComponent } from './domain/components/table/table.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, TableComponent],
})
export class AppComponent {}
