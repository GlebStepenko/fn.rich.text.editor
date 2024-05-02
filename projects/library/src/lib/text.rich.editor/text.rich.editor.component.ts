import {booleanAttribute, ChangeDetectorRef, Component, effect, ElementRef, forwardRef, input, numberAttribute, OnInit, output, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {NumberToPxPipe} from '../pipe/number.to.px/number.to.px.pipe';
import Quill from 'quill';
import {EToolBarItems} from '../editor.enum';
import {DefaultToolBar} from '../editor.const';
import {MatIcon} from '@angular/material/icon';
import {Range} from 'quill/core/selection';
import {DefaultIconsModule} from '../module/default.icons/default.icons.module';
import {MatRipple} from '@angular/material/core';
import {ColorPickerIconComponent} from '@gleb216/fn.color.picker';
import {TEditorChange} from '../editor.type';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import DOMPurify from 'dompurify';

export type ModelChangeFunction = (value: {html: string; text: string}) => void;
export type ModelTouchedFunction = () => void;

type EditFormat = {
  background?: string,
  color?: string,
  bold?: boolean,
  italic?: boolean,
  underline?: boolean,
  strike?: boolean,
  [format: string]: unknown
}

@Component({
  selector: 'fn-text-rich-editor',
  standalone: true,
  imports: [
    MatIconButton,
    NumberToPxPipe,
    MatIcon,
    DefaultIconsModule,
    MatRipple,
    ColorPickerIconComponent,
  ],
  templateUrl: './text.rich.editor.component.html',
  styleUrl: './text.rich.editor.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextRichEditorComponent),
    multi: true
  }],
})
export class TextRichEditorComponent implements ControlValueAccessor, OnInit {
  @ViewChild('editor', {static: true}) editorElem!: ElementRef;
  @ViewChild('toolbar', {static: true}) toolbarElem!: ElementRef;
  toolbarClass = input<string>('');
  containerClass = input<string>('');
  hideToolbar = input(false, {transform: booleanAttribute});
  readonly = input(false, {transform: booleanAttribute});
  minHeightPx = input(undefined, {transform: numberAttribute});
  placeholder = input<string>('');
  toolbarItems = input<Array<EToolBarItems>>(DefaultToolBar);
  toolbarPopup = input(false, {transform: booleanAttribute});
  onChange= output<TEditorChange>();
  eToolBarItems = EToolBarItems;
  format: EditFormat = {};
  quillEditor?: Quill;
  disable: boolean = false;
  onModelChange: ModelChangeFunction = () => {};
  onModelTouched: ModelTouchedFunction = () => {};

  constructor(private readonly _ref: ChangeDetectorRef ) {
    effect(() => {
      this._setEnable(this.readonly() ?? false)
    });
  }

  formatRemove(): void {
    const selection: Range | null = this.quillEditor!.getSelection();
    if (selection !== null) {
      const index   = selection.length === 0 ? 0 : selection.index;
      const length = selection.length === 0 ? this.quillEditor!.getLength() : selection.length;
      this.quillEditor!.removeFormat(index, length, 'user');
    }
  }

  formatChange(format: string, value: any): void {
    this.quillEditor!.format(format, value, 'user');
  }

  registerOnChange(fn: ModelChangeFunction): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: ModelTouchedFunction): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._setEnable(isDisabled);
  }

  writeValue(value: string): void {
    if (!!this.quillEditor) {
      const clean = DOMPurify.sanitize(value ?? '', { USE_PROFILES: { html: true } });
      let content = this.quillEditor.clipboard.convert({html: clean})
      this.quillEditor.setContents(content)
    }
  }

  private _setEnable(readOnly: boolean): void {
    this.disable = readOnly;
    if (!!this.quillEditor) {
      this.quillEditor.enable(!readOnly);
    }
  }
  
  ngOnInit(): void {
    const toolbar = this.hideToolbar() ? false : this.toolbarElem.nativeElement;
    this.quillEditor = new Quill(this.editorElem.nativeElement, {
      modules: {
        toolbar: toolbar
      },
      placeholder: this.placeholder(),
      readOnly: this.readonly(),
      theme: this.toolbarPopup() ? 'bubble' : 'snow'// 'snow',   bubble
    });

    this.quillEditor.on('selection-change', range => {
      if (!range) {
        return
      }
      this.format = this.quillEditor!.getFormat();
      this._ref.detectChanges();
      this.onModelTouched();
    });
    
    this.quillEditor.on('text-change', (_0: any, _1: any, source: any) => {
      if (this.quillEditor?.root.isConnected) {
        this.format = this.quillEditor!.getFormat();
      }

      let html = this.quillEditor!.getSemanticHTML();
      const text = this.quillEditor!.getText();
      
      if (html === '<p></p>') {
        html = '';
      }
      
      if (source === 'user') {
        this.onModelChange({html: html, text});
        this.onChange.emit({html, text});
      }
    });
  }
}

