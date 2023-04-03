import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(route: RouterStateSnapshot) {
    const title = this.buildTitle(route);
    if (title === undefined) {
      // 共通のタイトルを設定
      this.title.setTitle(`arisu.cool`);
      return;
    }

    // ページ別のタイトルを設定
    this.title.setTitle(`${title} | arisu.cool`);
  }
}
