import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarPageComponent } from './pages/calendar-page/calendar-page.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CalendarPageComponent],
  imports: [CommonModule, CalendarRoutingModule, SharedModule],
})
export class CalendarModule {}
