import { Component, computed, inject, signal } from '@angular/core';
import { MenuStateService, ResearchNode, ResearchTrack } from '../../core/services/menu-state.service';
import { PageHeader } from '../../shared/ui/page-header';

interface ResearchTab {
  id: ResearchTrack;
  label: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-research',
  imports: [PageHeader],
  template: `
    <div class="screen-shell">
      <app-page-header
        title="Research Lab"
        subtitle="Biomass Synthesis & Rig Evolution">
        <span class="currency-pill" aria-label="Available SRP Coins">
          🪙 {{ srpCoins() }} SRP
        </span>
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
                <button
                  type="button"
                  class="node-card"
                  [class.selected]="selectedNode().id === node.id"
                  (click)="selectNode(node.id)">
                  <div class="node-icon" aria-hidden="true">{{ node.icon }}</div>
                  <div class="node-meta">
                    <div class="node-top">
                      <span class="node-code">{{ node.code }}</span>
                      <span class="tag-rank">RANK {{ node.currentRank }}/{{ node.maxRank }}</span>
                    </div>
                    <h2 class="node-title">{{ node.title }}</h2>
                    <p class="node-effect">{{ node.effectSummary }}</p>
                  </div>
                  <span class="currency-pill">🪙 {{ node.cost }}</span>
                </button>
              }
            </section>

            <!-- Right Column: Blueprint & Synthesis Inspector -->
            @if (selectedNode(); as node) {
              <aside class="inspector-card" aria-label="Research Blueprint Inspector">
                <header class="inspector-head">
                  <div class="node-icon" aria-hidden="true">{{ node.icon }}</div>
                  <div>
                    <div class="node-top">
                      <span class="node-code">{{ node.code }}</span>
                      <span class="tag-rank">{{ node.category }}</span>
                      <span class="currency-pill">{{ node.phaseTag }}</span>
                    </div>
                    <h3 class="inspector-name">{{ node.title }}</h3>
                  </div>
                </header>

                <p class="inspector-desc">{{ node.description }}</p>

                <div class="effect-box">
                  <div class="effect-row">
                    <span>SYNTHESIS EFFECT</span>
                    <strong>{{ node.effectSummary }}</strong>
                  </div>
                  <div class="effect-row">
                    <span>PROGRESSION TIER</span>
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
                    <span>REQUIRED REAGENT</span>
                    <strong class="cost-val">🪙 {{ node.cost }} SRP Coins</strong>
                  </div>
                  <button type="button" class="synth-btn" disabled>
                    🔒 SYNTHESIS LOCKED ({{ node.phaseTag }})
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
    .research-shell, .node-list, .effect-box, .synthesis-footer {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    .track-tabs, .node-top, .rank-pips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-xs);
    }
    .track-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 0.9rem;
      border-radius: var(--radius-sm);
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      font-family: var(--font-display);
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      cursor: pointer;
    }
    .track-btn.active, .tag-rank {
      color: var(--color-primary-light);
      border-color: var(--color-primary-light);
      background: var(--color-primary-surface);
    }
    .currency-pill, .synth-btn {
      padding: 0.2rem 0.55rem;
      border-radius: var(--radius-xs);
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--color-accent-light);
      background: var(--color-accent-surface);
      border: 1px solid rgba(245, 158, 11, 0.35);
    }
    .tag-rank {
      padding: 0.1rem 0.4rem;
      border-radius: var(--radius-xs);
      font-family: var(--font-mono);
      font-size: 0.64rem;
      font-weight: 700;
    }
    .research-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
      align-items: start;
    }
    .node-card {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      width: 100%;
      text-align: left;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-md);
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      cursor: pointer;
    }
    .node-card.selected {
      border-color: var(--color-primary-light);
      background: rgba(34, 197, 94, 0.12);
    }
    .node-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      flex-shrink: 0;
      font-size: 1.45rem;
      border-radius: var(--radius-sm);
      background: rgba(5, 7, 11, 0.65);
      border: 1px solid var(--color-border);
    }
    .node-meta { flex: 1; min-width: 0; }
    .node-code { font-family: var(--font-mono); font-size: 0.64rem; color: var(--color-text-secondary); }
    .node-title, .inspector-name { margin: 0.1rem 0; font-family: var(--font-display); font-size: 1.05rem; }
    .inspector-name { font-size: 1.3rem; }
    .node-effect, .inspector-desc { margin: 0.15rem 0 0; font-size: 0.84rem; color: var(--color-text-secondary); }
    .inspector-card {
      background: var(--color-bg-panel);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
    }
    .inspector-head {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }
    .effect-box {
      margin: var(--spacing-md) 0;
      padding: var(--spacing-sm) var(--spacing-md);
      border-radius: var(--radius-sm);
      background: rgba(5, 7, 11, 0.6);
      border: 1px solid var(--color-border);
    }
    .effect-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-mono);
      font-size: 0.74rem;
      color: var(--color-text-secondary);
    }
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

  readonly srpCoins = this.menuState.srpCoins;
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

