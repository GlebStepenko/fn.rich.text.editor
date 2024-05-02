import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberToPx',
  standalone: true
})
export class NumberToPxPipe implements PipeTransform {

  transform(value?: number): string {
    if (isNaN(Number(value))) {
      return 'unset'
    } else {
      return `${value}px`;
    }
  }

}
