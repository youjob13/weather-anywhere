import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableComponent } from '../table/table.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrl: './wrapper.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, TableComponent, HeaderComponent],
})
export class WrapperComponent {
  readonly initialSearchValue =
    inject(ActivatedRoute).snapshot.queryParamMap.get('city') || '';
}
