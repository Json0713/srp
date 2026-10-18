import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Shop } from './shop';

describe('Shop', () => {
  let component: Shop;
  let fixture: ComponentFixture<Shop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Shop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the shop component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page header', () => {
    const header = fixture.debugElement.query(By.css('app-page-header'));
    expect(header).toBeTruthy();
    expect(header.nativeElement.textContent).toContain('Black Market');
  });

  it('should render the placeholder message', () => {
    const message = fixture.debugElement.query(By.css('.placeholder-message'));
    expect(message).toBeTruthy();
    expect(message.nativeElement.textContent).toContain('Access Denied');
  });
});

