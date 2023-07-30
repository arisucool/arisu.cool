import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsListPageComponent } from './news-list-page.component';

describe('NewsListPageComponent', () => {
  let component: NewsListPageComponent;
  let fixture: ComponentFixture<NewsListPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewsListPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
