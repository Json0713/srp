import { Component, computed, inject, signal } from '@angular/core';
import { MenuStateService, ResearchNode, ResearchTrack } from '../../core/services/menu-state.service';
import { PageHeader } from '../../shared/ui/page-header';
import { InfoPopover } from '../../shared/ui/info-popover';

interface ResearchTab {
  id: ResearchTrack;
  label: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-research',
  imports: [PageHeader, InfoPopover],
  template: `
    <div class="screen-shell">
      <app-page-header
        title="Research Lab"
        subtitle="Biomass Synthesis & Rig Evolution">
        <div class="header-currencies">
          <span class="biomass-pill" aria-label="Available Rare Biomass">
            🧪 {{ biomass() }} BIOMASS
          </span>
          <span class="currency-pill" aria-label="Available Research Parasitic Coins">
            🪙 {{ rpCoins() }} RP
          </span>
        </div>
      </app-page-header>

      <main class="screen-scroll-body">
        <div class="screen-container research-shell">
          <nav class="track-tabs" aria-label="Research Tracks">
            @for (tab of tabs(); track tab.id) {
              <button
                type="button"
                class="track-btn"
                [class.active]="activeTrack() === tab.id"
                [attr.aria-pressed]="activeTrack() === tab.id"
                (click)="selectTrack(tab.id)">
                <span aria-hidden="true">{{ tab.icon }}</span>
                <span>{{ tab.label }} ({{ tab.count }})</span>
              </button>
            }
          </nav>

          <div class="research-layout">
            <!-- Left Column: Research & Cosmetic Nodes -->
            <section class="node-list" aria-label="Research Nodes">
              @for (node of filteredNodes(); track node.id) {
                <div
                  role="button"
                  tabindex="0"
                  class="node-card"
                  [class.selected]="selectedNode().id === node.id"
                  (click)="selectNode(node.id)"
                  (keydown.enter)="selectNode(node.id)">
                  <div class="node-icon" aria-hidden="true">{{ node.icon }}</div>
                  <div class="node-meta">
                    <div class="node-top">
                      <span class="node-code">{{ node.code }}</span>
                      <span class="tag-rank">RNK {{ node.currentRank }}/{{ node.maxRank }}</span>
                      <app-info-popover
                        [title]="node.title"
                        [tag]="node.code"
                        [text]="node.description"
                        [hint]="node.effectSummary" />
                    </div>
                    <h2 class="node-title">{{ node.title }}</h2>
                    <p class="node-effect">{{ node.effectSummary }}</p>
                  </div>
                  <div class="node-costs">
                    @if (node.biomassCost) {
                      <span class="biomass-pill">🧪 {{ node.biomassCost }}</span>
                    }
                    <span class="currency-pill">🪙 {{ node.cost }} RP</span>
                  </div>
                </div>
              }
            </section>

            <!-- Right Column: Blueprint & Synthesis Inspector (Concise + ! Popover) -->
            @if (selectedNode(); as node) {
              <aside class="inspector-card" aria-label="Research Blueprint Inspector">
                <header class="inspector-head">
                  <div class="node-icon" aria-hidden="true">{{ node.icon }}</div>
                  <div class="node-meta">
                    <div class="node-top">
                      <span class="node-code">{{ node.code }}</span>
                      <span class="tag-rank">{{ node.category }}</span>
                      <span class="currency-pill">{{ node.phaseTag }}</span>
                    </div>
                    <div class="effect-row">
                      <h3 class="inspector-name">{{ node.title }}</h3>
                      <app-info-popover
                        [title]="node.title"
                        [tag]="node.phaseTag"
                        [text]="node.description"
                        [hint]="node.effectSummary" />
                    </div>
                  </div>
                </header>

                <div class="effect-box">
                  <div class="effect-row">
                    <span>EFFECT</span>
                    <strong>{{ node.effectSummary }}</strong>
                  </div>
                  <div class="effect-row">
                    <span>TIER</span>
                    <div class="rank-pips" [attr.aria-label]="'Rank ' + node.currentRank + ' of ' + node.maxRank">
                      @for (pip of getRankPips(node.maxRank); track pip) {
                        <span class="pip" [class.filled]="pip <= node.currentRank"></span>
                      }
                      <strong>{{ node.currentRank }} / {{ node.maxRank }}</strong>
                    </div>
                  </div>
                </div>

                <footer class="synthesis-footer">
                  <div class="effect-row">
                    <span>REAGENTS</span>
                    <strong class="cost-val">
                      🧪 {{ node.biomassCost ?? 1 }} Biomass + 🪙 {{ node.cost }} RP
                    </strong>
                  </div>
                  <button type="button" class="synth-btn" disabled>
                    🔒 LOCKED ({{ node.phaseTag }})
                  </button>
                </footer>
              </aside>
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .research-shell, .node-list, .effect-box, .synthesis-footer { display: flex; flex-direction: column; gap: var(--spacing-sm); }
    .track-tabs, .node-top, .rank-pips, .header-currencies, .node-costs { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-xs); }
    .track-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.9rem; border-radius: var(--radius-sm); background: var(--color-bg-panel); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-family: var(--font-display); font-size: 0.82rem; font-weight: 700; text-transform: uppercase; cursor: pointer; }
    .track-btn.active, .tag-rank, .biomass-pill { color: var(--color-primary-light); border: 1px solid var(--color-primary-light); background: var(--color-primary-surface); }
    .currency-pill, .biomass-pill, .synth-btn { padding: 0.2rem 0.55rem; border-radius: var(--radius-xs); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; }
    .currency-pill, .synth-btn { color: var(--color-accent-light); background: var(--color-accent-surface); border: 1px solid rgba(245, 158, 11, 0.35); }
    .tag-rank { padding: 0.1rem 0.4rem; border-radius: var(--radius-xs); font-family: var(--font-mono); font-size: 0.64rem; font-weight: 700; }
    .research-layout { display: grid; grid-template-columns: 1fr; gap: var(--spacing-lg); align-items: start; }
    .node-card { display: flex; align-items: center; gap: var(--spacing-md); width: 100%; text-align: left; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-md); background: var(--color-bg-panel); border: 1px solid var(--color-border); color: var(--color-text-primary); cursor: pointer; }
    .node-card.selected { border-color: var(--color-primary-light); background: rgba(34, 197, 94, 0.12); }
    .node-icon { display: flex; align-items: center; justify-content: center; width: 46px; height: 46px; flex-shrink: 0; font-size: 1.45rem; border-radius: var(--radius-sm); background: rgba(5, 7, 11, 0.65); border: 1px solid var(--color-border); }
    .node-meta { flex: 1; min-width: 0; }
    .node-code { font-family: var(--font-mono); font-size: 0.64rem; color: var(--color-text-secondary); }
    .node-title, .inspector-name { margin: 0.1rem 0; font-family: var(--font-display); font-size: 1.05rem; }
    .inspector-name { font-size: 1.25rem; }
    .node-effect { margin: 0.1rem 0 0; font-size: 0.78rem; color: var(--color-text-secondary); }
    .inspector-card { background: var(--color-bg-panel); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md); padding: var(--spacing-lg); }
    .inspector-head { display: flex; align-items: center; gap: var(--spacing-md); padding-bottom: var(--spacing-sm); margin-bottom: var(--spacing-sm); border-bottom: 1px solid var(--color-border); }
    .effect-box { margin: var(--spacing-sm) 0; padding: var(--spacing-sm) var(--spacing-md); border-radius: var(--radius-sm); background: rgba(5, 7, 11, 0.6); border: 1px solid var(--color-border); }
    .effect-row { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.74rem; color: var(--color-text-secondary); }
    .effect-row strong { color: var(--color-primary-light); }
    .cost-val { color: var(--color-accent-light) !important; }
    .pip { width: 12px; height: 6px; border-radius: 3px; background: rgba(148, 163, 184, 0.25); }
    .pip.filled { background: var(--color-primary-light); }
    .synth-btn { padding: 0.6rem; width: 100%; cursor: not-allowed; }
    @media (min-width: 768px), ((orientation: landscape) and (min-width: 640px)) {
      .research-layout { grid-template-columns: 1.15fr 1fr; }
    }
  `]
})
export class Research {
  private readonly menuState = inject(MenuStateService);

  readonly rpCoins = this.menuState.rpCoins;
  readonly biomass = this.menuState.biomass;
  readonly activeTrack = signal<ResearchTrack>('upgrades');
  readonly selectedNodeId = signal<string>('chitin-plating');

  readonly tabs = computed<ResearchTab[]>(() => [
    {
      id: 'upgrades',
      label: 'Bio-Research',
      icon: '🧬',
      count: this.menuState.getResearchByTrack('upgrades').length
    },
    {
      id: 'cosmetics',
      label: 'Rig Cosmetics',
      icon: '🎨',
      count: this.menuState.getResearchByTrack('cosmetics').length
    }
  ]);

  readonly filteredNodes = computed<ResearchNode[]>(() =>
    this.menuState.getResearchByTrack(this.activeTrack())
  );

  readonly selectedNode = computed<ResearchNode>(() => {
    const list = this.filteredNodes();
    return list.find((n) => n.id === this.selectedNodeId()) ?? list[0];
  });

  selectTrack(track: ResearchTrack): void {
    this.activeTrack.set(track);
    const first = this.menuState.getResearchByTrack(track)[0];
    if (first) {
      this.selectedNodeId.set(first.id);
    }
  }

  selectNode(id: string): void {
    this.selectedNodeId.set(id);
  }

  getRankPips(maxRank: number): number[] {
    return Array.from({ length: maxRank }, (_, index) => index + 1);
  }
}
