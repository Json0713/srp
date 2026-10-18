import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the home component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the correct title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.game-title')?.textContent).toContain('PROJECT PARASITE');
  });

  it('should display SRP Coin with placeholder value', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const value = compiled.querySelector('.currency-value')?.textContent;
    expect(value).toBe('0');
  });

  it('should show current operator and zone in loadout', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const loadout = compiled.querySelector('.current-loadout');
    expect(loadout?.textContent).toContain('Operator');
    expect(loadout?.textContent).toContain('Survivor');

    expect(loadout?.textContent).toContain('Zone');
    expect(loadout?.textContent).toContain('Sector 7');
  });

  it('should have correct navigation links in nav bar', () => {
    const navTabs = fixture.debugElement.queryAll(By.css('.nav-tab'));
    expect(navTabs.length).toBe(3); // Deploy, Operators, Shop
    expect(navTabs[0].attributes['routerLink']).toBe('/');
    expect(navTabs[1].attributes['routerLink']).toBe('/operators');
    expect(navTabs[2].attributes['routerLink']).toBe('/shop');
  });

  it('should have a settings button pointing to /settings', () => {
    const settingsBtn = fixture.debugElement.query(By.css('app-button[routerLink="/settings"]'));
    expect(settingsBtn).toBeTruthy();
  });

  it('should have a START RUN button pointing to /zones', () => {
    const startBtn = fixture.debugElement.query(By.css('app-button[routerLink="/zones"]'));
    expect(startBtn).toBeTruthy();
    expect(startBtn.nativeElement.textContent).toContain('START RUN');
  });
});

