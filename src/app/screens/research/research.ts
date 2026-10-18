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
    .research-shell, .node-list, .effect-box, .synthesis-footer { display: flex; flex-direction: column; gap: clamp(0.35rem, 1vw, 0.55rem); min-width: 0; }
    .track-tabs, .node-top, .rank-pips, .header-currencies, .node-costs { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem; min-width: 0; }
    .track-btn { display: inline-flex; align-items: center; gap: 0.32rem; padding: 0.38rem 0.72rem; border-radius: var(--radius-sm); background: var(--color-bg-panel); border: 1px solid var(--color-border); color: var(--color-text-secondary); font-family: var(--font-display); font-size: clamp(0.72rem, 1.3vw, 0.8rem); font-weight: 700; text-transform: uppercase; cursor: pointer; }
    .track-btn.active, .tag-rank, .biomass-pill { color: var(--color-primary-light); border: 1px solid var(--color-primary-light); background: var(--color-primary-surface); }
    .currency-pill, .biomass-pill, .synth-btn { padding: 0.16rem 0.45rem; border-radius: var(--radius-xs); font-family: var(--font-mono); font-size: 0.64rem; font-weight: 700; }
    .currency-pill, .synth-btn { color: var(--color-accent-light); background: var(--color-accent-surface); border: 1px solid rgba(245, 158, 11, 0.35); }
    .tag-rank { padding: 0.06rem 0.32rem; border-radius: var(--radius-xs); font-family: var(--font-mono); font-size: 0.58rem; font-weight: 700; }
    .research-layout { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(0.6rem, 1.6vw, 1rem); align-items: start; min-width: 0; }
    .node-card { display: flex; align-items: center; gap: clamp(0.45rem, 1.2vw, 0.7rem); width: 100%; min-width: 0; text-align: left; padding: clamp(0.42rem, 1vw, 0.62rem) clamp(0.5rem, 1.3vw, 0.75rem); border-radius: var(--radius-md); background: var(--color-bg-panel); border: 1px solid var(--color-border); color: var(--color-text-primary); cursor: pointer; }
    .node-card.selected { border-color: var(--color-primary-light); background: rgba(34, 197, 94, 0.12); }
    .node-icon { display: flex; align-items: center; justify-content: center; width: clamp(36px, 4.2vw, 42px); height: clamp(36px, 4.2vw, 42px); flex-shrink: 0; font-size: clamp(1.1rem, 2vw, 1.35rem); border-radius: var(--radius-sm); background: rgba(5, 7, 11, 0.65); border: 1px solid var(--color-border); }
    .node-meta { flex: 1; min-width: 0; }
    .node-code { font-family: var(--font-mono); font-size: 0.6rem; color: var(--color-text-secondary); }
    .node-title, .inspector-name { margin: 0.06rem 0; font-family: var(--font-display); font-size: clamp(0.88rem, 1.6vw, 1rem); }
    .inspector-name { font-size: clamp(1rem, 1.9vw, 1.2rem); }
    .node-effect { margin: 0.06rem 0 0; font-size: clamp(0.68rem, 1.2vw, 0.75rem); color: var(--color-text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .inspector-card { background: var(--color-bg-panel); border: 1px solid var(--color-border-strong); border-radius: var(--radius-md); padding: clamp(0.65rem, 1.6vw, 1.1rem); min-width: 0; }
    .inspector-head { display: flex; align-items: center; gap: clamp(0.45rem, 1.2vw, 0.75rem); padding-bottom: 0.45rem; margin-bottom: 0.45rem; border-bottom: 1px solid var(--color-border); min-width: 0; }
    .effect-box { margin: 0.4rem 0; padding: 0.45rem 0.6rem; border-radius: var(--radius-sm); background: rgba(5, 7, 11, 0.6); border: 1px solid var(--color-border); min-width: 0; }
    .effect-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.35rem; font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-text-secondary); min-width: 0; }
    .effect-row strong { color: var(--color-primary-light); text-align: right; }
    .cost-val { color: var(--color-accent-light) !important; }
    .pip { width: 10px; height: 5px; border-radius: 3px; background: rgba(148, 163, 184, 0.25); }
    .pip.filled { background: var(--color-primary-light); }
    .synth-btn { padding: 0.5rem; width: 100%; cursor: not-allowed; }
    @media (min-width: 768px), ((orientation: landscape) and (min-width: 560px)) {
      .research-layout { grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.95fr); }
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
