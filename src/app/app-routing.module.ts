import { NgModule } from '@angular/core';
import { RouterModule, Routes, TitleStrategy } from '@angular/router';
import { AppTitleStrategy } from './app.title-strategy';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'arisu-news',
    loadChildren: () => import('./news/news.module').then((m) => m.NewsModule),
  },
  {
    path: 'n',
    loadChildren: () => import('./news/news.module').then((m) => m.NewsModule),
  },
  {
    path: 'arisu-calendar',
    loadChildren: () =>
      import('./calendar/calendar.module').then((m) => m.CalendarModule),
  },
  {
    path: 'arisu-goods-list',
    loadChildren: () =>
      import('./goods-list/goods-list.module').then((m) => m.GoodsListModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy,
    },
  ],
})
export class AppRoutingModule {}
