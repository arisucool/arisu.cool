import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'arisucool';

  isBirthday = false;

  ngOnInit() {
    const date = new Date();
    // 7月31日の場合
    if (date.getMonth() === 6 && date.getDate() === 31) {
      this.isBirthday = true;
    }
  }
}
