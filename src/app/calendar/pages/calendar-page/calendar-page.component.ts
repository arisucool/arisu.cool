import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-calendar-page',
  templateUrl: './calendar-page.component.html',
  styleUrls: ['../../../shared/styles.scss', './calendar-page.component.scss'],
})
export class CalendarPageComponent implements OnInit {
  public calendarUrl: SafeResourceUrl | undefined;

  public calendarRegisterUrls = {
    gcal: 'https://calendar.google.com/calendar/u/0/r?cid=e0c54e1ebabb626216ee549eaa286a47dc48405bf013265014b4bb8ba28c4ca1@group.calendar.google.com',
    ical: 'https://calendar.google.com/calendar/ical/e0c54e1ebabb626216ee549eaa286a47dc48405bf013265014b4bb8ba28c4ca1%40group.calendar.google.com/public/basic.ics',
  };

  private readonly CALENDAR_URL =
    'https://calendar.google.com/calendar/embed?height=600&wkst=1&mode=__MODE__&bgcolor=%23ffffff&ctz=Asia%2FTokyo&showTitle=0&src=ZTBjNTRlMWViYWJiNjI2MjE2ZWU1NDllYWEyODZhNDdkYzQ4NDA1YmYwMTMyNjUwMTRiNGJiOGJhMjhjNGNhMUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=amEuamFwYW5lc2UjaG9saWRheUBncm91cC52LmNhbGVuZGFyLmdvb2dsZS5jb20&color=%234b7abd&color=%230B8043';

  constructor(
    private domSanitizer: DomSanitizer,
    public deviceDetectorService: DeviceDetectorService
  ) {}

  ngOnInit() {
    let calendarMode = this.deviceDetectorService.isMobile()
      ? 'AGENDA'
      : 'MONTH';

    const calendarUrl = this.CALENDAR_URL.replace(/__MODE__/g, calendarMode);
    this.calendarUrl =
      this.domSanitizer.bypassSecurityTrustResourceUrl(calendarUrl);
  }
}
