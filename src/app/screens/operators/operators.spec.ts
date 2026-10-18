import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Operators } from './operators';
import { MenuStateService } from '../../core/services/menu-state.service';

describe('Operators', () => {
  let component: Operators;
  let fixture: ComponentFixture<Operators>;
  let menuStateService: MenuStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Operators],
      providers: [provideRouter([]), MenuStateService]
    }).compileComponents();

    fixture = TestBed.createComponent(Operators);
    component = fixture.componentInstance;
    menuStateService = TestBed.inject(MenuStateService);
    fixture.detectChanges();
  });

  it('should create the operators component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page header', () => {
    const header = fixture.debugElement.query(By.css('app-page-header'));
    expect(header).toBeTruthy();
    expect(header.nativeElement.textContent).toContain('Operators');
  });

  it('should list operators from menu state', () => {
    const cards = fixture.debugElement.queryAll(By.css('app-selection-card'));
    expect(cards.length).toBe(menuStateService.operators.length);
    expect(cards[0].nativeElement.textContent).toContain('Survivor');
  });
});

