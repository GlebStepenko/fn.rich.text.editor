import {booleanAttribute, ChangeDetectorRef, Component, effect, ElementRef, forwardRef, inject, input, numberAttribute, OnDestroy, OnInit, output, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatIconButton} from '@angular/material/button';
import {NumberToPxPipe} from '../pipe/number.to.px/number.to.px.pipe';
import Quill from 'quill';
import {EToolBarItems} from '../editor.enum';
import {DefaultToolBar} from '../editor.const';
import {MatIcon} from '@angular/material/icon';
import {Range} from 'quill/core/selection';
import {DefaultIconsModule} from '../module/default.icons/default.icons.module';
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
export class TextRichEditorComponent implements ControlValueAccessor, OnInit, OnDestroy {
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
  updateOn= input<'change' | 'blur'>('change');
  onChange= output<TEditorChange>();
  eToolBarItems = EToolBarItems;
  format: EditFormat = {};
  quillEditor?: Quill;
  disable: boolean = false;
  isUpdated: boolean = false;
  onModelChange: ModelChangeFunction = () => {};
  onModelTouched: ModelTouchedFunction = () => {};
  readonly #ref = inject(ChangeDetectorRef);
  
  constructor( ) {
    effect(() => this._setEnable(this.readonly() ?? false));
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

  writeValue(value: string | {text: string, html: string}): void {
    const initValue = (typeof value === 'object' && value !== null && 'html' in value) ? value.html : value;
    if (!!this.quillEditor) {
      const clean = DOMPurify.sanitize(initValue ?? '', { USE_PROFILES: { html: true } });
      let content = this.quillEditor.clipboard.convert({html: clean});
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
    this.editorElem.nativeElement.addEventListener('focusin', this.#onFocusIn.bind(this));
    this.editorElem.nativeElement.addEventListener('focusout', this.#onFocusOut.bind(this));
    
    
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
      this.#ref.detectChanges();
      this.onModelTouched();
    });
    
    this.quillEditor.on('text-change', (_0: any, _1: any, source: any) => {
      this.isUpdated = true;

      if (this.quillEditor?.root.isConnected && source !== 'api') {
        this.format = this.quillEditor!.getFormat();
      }

      if ( (source === 'user') && (this.updateOn() === 'change') )  {
        this.#updateModel();
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.editorElem) {
      this.editorElem.nativeElement.removeEventListener('focusin', this.#onFocusIn);
      this.editorElem.nativeElement.removeEventListener('focusout', this.#onFocusOut);
    }
  }
  
  #onFocusIn(): void{
    this.isUpdated = false;
  }
  
  #onFocusOut(): void{
    if ( (this.isUpdated) && (this.updateOn() === 'blur') )  {
      this.#updateModel();
    }
  }
  
  
  #updateModel(): void {
    let html = this.quillEditor!.getSemanticHTML();
    const text = this.quillEditor!.getText();
    
    if (html === '<p></p>') {
      html = '';
    }
    this.onModelChange({html: html, text});
    this.onChange.emit({html, text});
  }
}

