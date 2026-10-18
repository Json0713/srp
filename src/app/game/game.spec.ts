import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Game } from './game';

describe('Game Component', () => {
  let component: Game;
  let fixture: ComponentFixture<Game>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Game],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the game component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle pause state when Escape is pressed', () => {
    expect(component.isPaused()).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isPaused()).toBe(true);

    const pauseMenu = fixture.debugElement.query(By.css('.pause-menu'));
    expect(pauseMenu).toBeTruthy();
    expect(pauseMenu.nativeElement.textContent).toContain('PAUSED');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(component.isPaused()).toBe(false);
    expect(fixture.debugElement.query(By.css('.pause-menu'))).toBeNull();
  });

  it('should toggle pause when HUD button is clicked', () => {
    const pauseBtn = fixture.debugElement.query(By.css('.pause-toggle-btn'));
    pauseBtn.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.isPaused()).toBe(true);
  });

  it('should allow switching input mode directly from the pause menu', () => {
    component.togglePause();
    fixture.detectChanges();

    const modeButtons = fixture.debugElement.queryAll(By.css('.mode-switch-btn'));
    expect(modeButtons.length).toBe(2);

    modeButtons[1].triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.inputMode()).toBe('mobile');
  });
});
