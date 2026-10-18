import { TestBed } from '@angular/core/testing';
import { MenuStateService } from './menu-state.service';

describe('MenuStateService', () => {
  let service: MenuStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuStateService);
  });

  it('should initialize with survivor and sector7 selected by default', () => {
    expect(service.selectedOperatorId()).toBe('survivor');
    expect(service.selectedZoneId()).toBe('sector7');
    expect(service.selectedOperator().title).toBe('Survivor');
    expect(service.selectedZone().title).toBe('Sector 7');
  });

  it('should not allow selecting a locked operator or locked zone', () => {
    service.setOperator('ranger');
    expect(service.selectedOperatorId()).toBe('survivor');

    service.setZone('hive');
    expect(service.selectedZoneId()).toBe('sector7');
  });
});

