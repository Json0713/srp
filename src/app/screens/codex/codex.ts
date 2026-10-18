import { Component, computed, inject, signal } from '@angular/core';
import { PageHeader } from '../../shared/ui/page-header';
import { InfoPopover } from '../../shared/ui/info-popover';
import { CodexService } from '../../core/services/codex.service';
import { CodexCategory, CodexEntry } from '../../core/models/game-data.model';

type FilterTab = 'all' | CodexCategory;

@Component({
  selector: 'app-codex',
  imports: [PageHeader, InfoPopover],
  template: `
    <div class="screen-shell">
      <app-page-header title="Field Codex" subtitle="Containment Encyclopedia">
        <span class="codex-progress-pill" aria-label="Discovered Records">
          📘 {{ codex.discoveredCount() }}/{{ codex.discoverableTotal() }} GRANTED
        </span>
      </app-page-header>

      <main class="screen-scroll-body">
        <div class="screen-container codex-shell">
          <!-- Category Filter Bar -->
          <nav class="codex-tabs" aria-label="Codex Categories">
            @for (tab of tabs; track tab.id) {
              <button
                type="button"
                class="codex-tab-btn"
                [class.active]="activeTab() === tab.id"
                (click)="selectTab(tab.id)">
                <span aria-hidden="true">{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
              </button>
            }
          </nav>

          <div class="codex-layout">
            <!-- Left Column: Encyclopedia Entries (Concise with ! Popover) -->
            <section class="codex-list" aria-label="Codex Entries">
              @for (entry of filteredEntries(); track entry.id) {
                <div
                  role="button"
                  tabindex="0"
                  class="codex-item-btn"
                  [class.selected]="selectedEntry()?.id === entry.id"
                  [class.undiscovered]="entry.status === 'undiscovered'"
                  [class.development]="entry.status === 'development'"
                  (click)="selectEntry(entry.id)"
                  (keydown.enter)="selectEntry(entry.id)">
                  <div class="item-icon" aria-hidden="true">
                    {{ entry.status === 'undiscovered' ? '🔒' : entry.icon }}
                  </div>
                  <div class="item-info">
                    <div class="item-top">
                      <span class="item-code">{{ entry.code }}</span>
                      @if (entry.status === 'discovered') {
                        <span class="status-tag tag-granted">GRANTED</span>
                      } @else if (entry.status === 'undiscovered') {
                        <span class="status-tag tag-locked">LOCKED</span>
                      } @else {
                        <span class="status-tag tag-dev">{{ entry.phaseTag }}</span>
                      }
                      <app-info-popover
                        [title]="entry.status === 'undiscovered' ? 'Encrypted Record' : entry.title"
                        [tag]="entry.code"
                        [text]="entry.status === 'undiscovered' ? entry.unlockHint : entry.description"
                        [hint]="entry.classification" />
                    </div>
                    <h3 class="item-title">
                      {{ entry.status === 'undiscovered' ? 'Encrypted Record' : entry.title }}
                    </h3>
                  </div>
                </div>
              }
            </section>

            <!-- Right Column: Concise Dossier Reader -->
            @if (selectedEntry(); as detail) {
              <aside class="codex-reader" aria-label="Selected Record Details">
                <div class="reader-header">
                  <div class="reader-icon" aria-hidden="true">
                    {{ detail.status === 'undiscovered' ? '🔒' : detail.icon }}
                  </div>
                  <div class="item-info">
                    <span class="reader-code">{{ detail.code }} // {{ detail.phaseTag }}</span>
                    <div class="stat-line">
                      <h2 class="reader-title">
                        {{ detail.status === 'undiscovered' ? 'Encrypted Record' : detail.title }}
                      </h2>
                      <app-info-popover
                        [title]="detail.status === 'undiscovered' ? 'Encrypted Record' : detail.title"
                        [tag]="detail.code"
                        [text]="detail.status === 'undiscovered' ? detail.unlockHint : detail.description"
                        [hint]="detail.unlockHint" />
                    </div>
                    <span class="reader-class">
                      {{ detail.status === 'undiscovered' ? 'REDACTED' : detail.classification }}
                    </span>
                  </div>
                </div>

                @if (detail.status === 'undiscovered') {
                  <div class="locked-notice">
                    <strong>LOCKED RECORD</strong>
                    <p>{{ detail.unlockHint }}</p>
                  </div>
                } @else {
                  <p class="reader-desc">{{ detail.summary }}</p>

                  <div class="reader-stats">
                    @for (stat of detail.stats; track stat.label) {
                      <div class="stat-line">
                        <span>{{ stat.label }}</span>
                        <strong>{{ stat.value }}</strong>
                      </div>
                    }
                  </div>
                }
              </aside>
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .codex-progress-pill { font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-primary-light); background: var(--color-primary-surface); border: 1px solid rgba(74, 222, 128, 0.35); padding: 0.2rem 0.52rem; border-radius: var(--radius-xs); }
    .codex-shell, .codex-list, .reader-stats { display: flex; flex-direction: column; gap: clamp(0.35rem, 1vw, 0.55rem); min-width: 0; }
    .codex-tabs, .item-top { display: flex; flex-wrap: wrap; align-items: center; gap: 0.32rem; min-width: 0; }
    .codex-tab-btn { display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.36rem 0.68rem; border-radius: var(--radius-sm); background: var(--color-bg-panel); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-family: var(--font-display); font-size: clamp(0.72rem, 1.3vw, 0.8rem); font-weight: 700; text-transform: uppercase; cursor: pointer; }
    .codex-tab-btn.active, .tag-granted { color: var(--color-primary-light); border-color: var(--color-primary-light); background: var(--color-primary-surface); }
    .codex-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(0.6rem, 1.6vw, 1rem); align-items: start; min-width: 0; }
    .codex-item-btn { display: flex; align-items: center; gap: clamp(0.45rem, 1.2vw, 0.7rem); width: 100%; min-width: 0; text-align: left; padding: clamp(0.42rem, 1vw, 0.62rem) clamp(0.5rem, 1.3vw, 0.75rem); border-radius: var(--radius-md); background: var(--color-bg-panel); border: 1px solid var(--color-border); color: var(--color-text-primary); cursor: pointer; }
    .codex-item-btn:hover { background: var(--color-bg-panel-hover); }
    .codex-item-btn.selected { border-color: var(--color-primary-light); background: rgba(34, 197, 94, 0.12); }
    .codex-item-btn.undiscovered { opacity: 0.72; }
    .item-icon, .reader-icon { display: flex; align-items: center; justify-content: center; width: clamp(36px, 4.2vw, 42px); height: clamp(36px, 4.2vw, 42px); flex-shrink: 0; font-size: clamp(1.1rem, 2vw, 1.35rem); border-radius: var(--radius-sm); background: rgba(5, 7, 11, 0.65); border: 1px solid var(--color-border); }
    .item-info { flex: 1; min-width: 0; }
    .item-code, .reader-code, .status-tag { font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-text-secondary); }
    .status-tag { padding: 0.05rem 0.32rem; border-radius: var(--radius-xs); font-weight: 700; }
    .tag-locked, .locked-notice { color: var(--color-danger-light); background: var(--color-danger-surface); border: 1px solid rgba(239, 68, 68, 0.35); }
    .tag-dev { color: var(--color-accent-light); background: var(--color-accent-surface); border: 1px solid rgba(245, 158, 11, 0.35); }
    .item-title, .reader-title { margin: 0.06rem 0; font-family: var(--font-display); font-size: clamp(0.86rem, 1.5vw, 0.96rem); }
    .reader-title { font-size: clamp(1rem, 1.9vw, 1.2rem); }
    .reader-desc { margin: 0.12rem 0 0; font-size: clamp(0.72rem, 1.2vw, 0.8rem); color: var(--color-text-secondary); }
    .codex-reader { background: var(--color-bg-panel); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md); padding: clamp(0.65rem, 1.6vw, 1.1rem); min-width: 0; }
    .reader-header { display: flex; align-items: center; gap: clamp(0.45rem, 1.2vw, 0.75rem); padding-bottom: 0.45rem; margin-bottom: 0.45rem; border-bottom: 1px solid var(--color-border); min-width: 0; }
    .reader-class { font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-info); }
    .locked-notice { padding: 0.45rem 0.6rem; border-radius: var(--radius-sm); font-size: 0.74rem; }
    .locked-notice p { margin: 0.15rem 0 0; color: var(--color-text-primary); }
    .reader-stats { margin-top: 0.45rem; padding-top: 0.45rem; border-top: 1px solid var(--color-border); }
    .stat-line { display: flex; justify-content: space-between; align-items: center; gap: 0.35rem; font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-text-secondary); min-width: 0; }
    .stat-line strong { color: var(--color-text-primary); text-align: right; }
    @media (min-width: 768px), ((orientation: landscape) and (min-width: 560px)) {
      .codex-layout { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.95fr); }
    }
  `]
})
export class Codex {
  readonly codex = inject(CodexService);

  readonly tabs: { id: FilterTab; label: string; icon: string }[] = [
    { id: 'all', label: 'All Records', icon: '📘' },
    { id: 'items', label: 'Items & Biomass', icon: '🧪' },
    { id: 'parasites', label: 'Parasites', icon: '🕷️' },
    { id: 'powers', label: 'Powers', icon: '⚡' },
    { id: 'archive', label: 'Archive', icon: '🛡️' }
  ];

  readonly activeTab = signal<FilterTab>('all');
  readonly selectedId = signal<string>('raw-biomass');

  readonly filteredEntries = computed<CodexEntry[]>(() =>
    this.codex.getEntriesByCategory(this.activeTab())
  );

  readonly selectedEntry = computed<CodexEntry | undefined>(() => {
    const list = this.filteredEntries();
    return list.find((e) => e.id === this.selectedId()) ?? list[0];
  });

  selectTab(tab: FilterTab): void {
    this.activeTab.set(tab);
    const list = this.codex.getEntriesByCategory(tab);
    if (list.length > 0 && !list.some((e) => e.id === this.selectedId())) {
      this.selectedId.set(list[0].id);
    }
  }

  selectEntry(id: string): void {
    this.selectedId.set(id);
  }
}
