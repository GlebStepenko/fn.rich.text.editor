import {Component, OnInit} from '@angular/core';
// import {TextRichEditorComponent} from '../../../../dist/library';
import {TextRichEditorComponent} from '../../../library/src/lib/text.rich.editor/text.rich.editor.component';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatButton} from '@angular/material/button';

interface IControlForm {
  text: FormControl<string | {html: string, text: string} | null>;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TextRichEditorComponent,
    ReactiveFormsModule,
    MatButton
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  title = 'test.application';
  formData: FormGroup<IControlForm>;
  readOnly = false;

  
  constructor() {
    this.formData = new FormGroup<IControlForm>({
      text: new FormControl({value: {html: '<p>werq<span style="color: rgb(242, 145, 48);">werqwere</span>wrwer</p>', text: 'werqwerqwerewrwer\n'}, disabled: false}, {nonNullable: true}),
    });
    
    
    this.formData.valueChanges.subscribe({
      next: res => {
        console.log(res.text);
      }
    })
  }
  
  onChange() {
  }
  
  setText() {
    this.formData.patchValue({
      text: 'green'
    })
  }
  
  setHtml() {
    this.formData.patchValue({
      text: '<p>1111</p><p><span style="color: rgb(119, 165, 84);">222</span></p><p><span style="background-color: rgb(49, 76, 182);">33</span></p><p>4</p>'
    })
  }
  
  changeReadOnlyInput() {
    this.readOnly = !this.readOnly;
  }
  
  changeReadOnlyReactive() {
    const readOnly = !this.readOnly;
    if (readOnly) {
      this.formData.controls.text.disable()
    } else {
      this.formData.controls.text.enable()
    }
    
  }
  
  ngOnInit(): void {


  }
  
}

