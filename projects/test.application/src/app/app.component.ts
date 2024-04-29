import { Component } from '@angular/core';
import {LibraryComponent} from '../../../library/src/lib/library.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LibraryComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'test.application';
}
