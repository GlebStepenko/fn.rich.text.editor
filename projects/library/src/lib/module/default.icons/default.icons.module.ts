import {Inject, NgModule, PLATFORM_ID} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material/icon';
import {isPlatformServer} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {defaultIcons}  from './default.icons'

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule
  ]
})
export class DefaultIconsModule {
  constructor(private domSanitizer: DomSanitizer, private matIconRegistry: MatIconRegistry, @Inject(PLATFORM_ID) private platformId: string) {
    for (const [name, path] of Object.entries(defaultIcons)) {
      const iconText: string = isPlatformServer(this.platformId) ? '' : `<svg viewBox="0 0 24 24">${path}</svg>`;
      this.matIconRegistry.addSvgIconLiteral(name, this.domSanitizer.bypassSecurityTrustHtml(iconText))
    }
  }
}
