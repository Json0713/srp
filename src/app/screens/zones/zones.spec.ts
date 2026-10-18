import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Zones } from './zones';
import { MenuStateService } from '../../core/services/menu-state.service';

describe('Zones', () => {
  let component: Zones;
  let fixture: ComponentFixture<Zones>;
  let menuStateService: MenuStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Zones],
      providers: [provideRouter([]), MenuStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(Zones);
    component = fixture.componentInstance;
    menuStateService = TestBed.inject(MenuStateService);
    fixture.detectChanges();
  });

  it('should create the zones component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page header', () => {
    const header = fixture.debugElement.query(By.css('app-page-header'));
    expect(header).toBeTruthy();
    expect(header.nativeElement.textContent).toContain('Deployment Zones');
  });

  it('should list zones from menu state', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-selection-card'));
    expect(cards.length).toBe(menuStateService.zones.length);
    expect(cards[0].nativeElement.textContent).toContain('Sector 7');
  });
});

