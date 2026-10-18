import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  it('should initialize with pc mode by default', () => {
    expect(service.inputMode()).toBe('pc');
  });

  it('should update mode and persist to localStorage', () => {
    service.setInputMode('mobile');
    expect(service.inputMode()).toBe('mobile');
    if (typeof window !== 'undefined' && window.localStorage) {
      expect(window.localStorage.getItem('srp_input_mode')).toBe('mobile');
    }
  });

  it('should toggle between pc and mobile modes', () => {
    expect(service.inputMode()).toBe('pc');
    service.toggleInputMode();
    expect(service.inputMode()).toBe('mobile');
    service.toggleInputMode();
    expect(service.inputMode()).toBe('pc');
  });
});

