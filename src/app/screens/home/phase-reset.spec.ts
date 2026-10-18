import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { CodexService } from '../../core/services/codex.service';
import { MenuStateService } from '../../core/services/menu-state.service';
import { Home } from './home';

describe('Outbreak Phase Registry & Phase 1: The Fallout Alignment', () => {
  let fixture: ComponentFixture<Home>;
  let menuState: MenuStateService;
  let codexService: CodexService;

  beforeEach(async () => {
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    menuState = TestBed.inject(MenuStateService);
    codexService = TestBed.inject(CodexService);
    fixture.detectChanges();
  });

  it('registers all 3 canonical Outbreak Phases with Phase 1: The Fallout active', () => {
    expect(menuState.gamePhases.length).toBe(3);
    expect(menuState.currentPhase.id).toBe('phase-1-fallout');
    expect(menuState.currentPhase.title).toBe('Phase 1: The Fallout');
    expect(menuState.currentPhase.badge).toBe('PHASE 1 // THE FALLOUT');
    expect(menuState.gamePhases[1].title).toBe('Phase 2: The Assimilation');
    expect(menuState.gamePhases[2].title).toBe('Phase 3: The Synthesis');
  });

  it('renders Phase 1: The Fallout badge and subtitle on the Home screen', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('PHASE 1 // THE FALLOUT');
    expect(compiled.textContent).toContain(
      'Phase 1: The Fallout — Initial Containment Collapse & Biomass Extraction'
    );
  });

  it('synchronizes CodexService archive entries with Outbreak Phase dossiers and Phase 1-3 tags', () => {
    const archiveEntries = codexService.getEntriesByCategory('archive');
    const phase1 = archiveEntries.find((e) => e.id === 'phase-1-fallout');
    const phase2 = archiveEntries.find((e) => e.id === 'phase-2-assimilation');
    const phase3 = archiveEntries.find((e) => e.id === 'phase-3-synthesis');

    expect(phase1?.status).toBe('discovered');
    expect(phase1?.phaseTag).toBe('PHASE 1 // THE FALLOUT');
    expect(phase2?.status).toBe('development');
    expect(phase3?.status).toBe('development');
  });
});

