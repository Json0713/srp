import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-info-popover',
  template: `
    <span class="info-wrap">
      <button
        type="button"
        class="info-trigger"
        [class.active]="isOpen()"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-label]="'More info: ' + title()"
        (click)="toggle($event)">
        !
      </button>

      @if (isOpen()) {
        <div
          class="info-popover-card"
          role="dialog"
          [attr.aria-label]="title()"
          (click)="$event.stopPropagation()">
          <div class="info-popover-head">
            @if (tag()) {
              <span class="info-popover-tag">{{ tag() }}</span>
            }
            <strong class="info-popover-title">{{ title() }}</strong>
            <button
              type="button"
              class="info-close-btn"
              aria-label="Close details"
              (click)="close($event)">
              ✕
            </button>
          </div>
          <p class="info-popover-body">{{ text() }}</p>
          @if (hint()) {
            <div class="info-popover-hint">{{ hint() }}</div>
          }
        </div>
      }
    </span>
  `,
  styles: [`
    .info-wrap { position: relative; display: inline-flex; align-items: center; vertical-align: middle; }
    .info-trigger {
      display: inline-flex; align-items: center; justify-content: center;
      width: 20px; height: 20px; border-radius: 50%;
      font-family: var(--font-mono); font-size: 0.72rem; font-weight: 800;
      color: var(--color-info); background: rgba(56, 189, 248, 0.14);
      border: 1px solid rgba(56, 189, 248, 0.45); cursor: pointer;
      padding: 0; line-height: 1; flex-shrink: 0;
    }
    .info-trigger:hover, .info-trigger.active {
      color: #05070b; background: var(--color-info); border-color: var(--color-info);
    }
    .info-popover-card {
      position: fixed; inset-inline: 50%; top: 50%; transform: translate(-50%, -50%);
      width: min(90dvw, 340px); padding: 0.75rem 0.9rem;
      background: #0c121c; border: 1px solid var(--color-info);
      border-radius: var(--radius-sm); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.85);
      z-index: 250; text-align: left; font-weight: 400;
    }
    .info-popover-head {
      display: flex; align-items: center; gap: 0.4rem;
      margin-bottom: 0.35rem; padding-bottom: 0.3rem;
      border-bottom: 1px solid var(--color-border);
    }
    .info-popover-tag {
      font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
      color: var(--color-accent-light); background: var(--color-accent-surface);
      padding: 0.1rem 0.35rem; border-radius: var(--radius-xs);
    }
    .info-popover-title {
      flex: 1; font-family: var(--font-display); font-size: 0.95rem;
      color: var(--color-text-primary); letter-spacing: 0.04em;
    }
    .info-close-btn {
      background: transparent; border: none; color: var(--color-text-secondary);
      font-size: 0.8rem; cursor: pointer; padding: 0.1rem 0.25rem;
    }
    .info-popover-body {
      margin: 0; font-size: 0.78rem; line-height: 1.45; color: var(--color-text-secondary);
    }
    .info-popover-hint {
      margin-top: 0.4rem; padding-top: 0.35rem; border-top: 1px solid var(--color-border);
      font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-primary-light);
    }
  `]
})
export class InfoPopover {
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly tag = input<string | undefined>('');
  readonly hint = input<string | undefined>('');

  readonly isOpen = signal(false);

  toggle(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.isOpen.update((v) => !v);
  }

  close(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node | null;
    if (target && !this.hostEl.nativeElement.contains(target)) {
      this.isOpen.set(false);
    }
  }
}
