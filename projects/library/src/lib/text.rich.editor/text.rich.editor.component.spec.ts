import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextRichEditorComponent } from './text.rich.editor.component';

describe('TextEditorComponent', () => {
  let component: TextRichEditorComponent;
  let fixture: ComponentFixture<TextRichEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextRichEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TextRichEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
