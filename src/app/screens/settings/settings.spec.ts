import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Settings } from './settings';
import { SettingsService } from '../../core/services/settings.service';

describe('Settings', () => {
  let component: Settings;
  let fixture: ComponentFixture<Settings>;

  beforeEach(async () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }

    await TestBed.configureTestingModule({
      imports: [Settings],
      providers: [provideRouter([]), SettingsService]
    }).compileComponents();

    fixture = TestBed.createComponent(Settings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the settings component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page header', () => {
    const header = fixture.debugElement.query(By.css('app-page-header'));
    expect(header).toBeTruthy();
    expect(header.nativeElement.textContent).toContain('Settings');
  });

  it('should toggle input mode between pc and mobile', () => {
    const mobileRadio = fixture.nativeElement.querySelector('input[value="mobile"]') as HTMLInputElement;
    expect(mobileRadio).toBeTruthy();

    mobileRadio.checked = true;
    mobileRadio.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.inputMode()).toBe('mobile');
    expect(fixture.nativeElement.querySelector('.controls-list').textContent).toContain('Joystick');

    const pcRadio = fixture.nativeElement.querySelector('input[value="pc"]') as HTMLInputElement;
    pcRadio.checked = true;
    pcRadio.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.inputMode()).toBe('pc');
    expect(fixture.nativeElement.querySelector('.controls-list').textContent).toContain('W, A, S, D');
  });
});

