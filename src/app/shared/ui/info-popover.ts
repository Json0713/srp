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
          [class.align-right]="alignRight()"
          [class.open-above]="openAbove()"
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
    .info-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      flex-shrink: 0;
    }
    .info-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-family: var(--font-mono);
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--color-info);
      background: rgba(56, 189, 248, 0.14);
      border: 1px solid rgba(56, 189, 248, 0.45);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: all var(--transition-fast);
    }
    .info-trigger:hover,
    .info-trigger.active {
      color: #05070b;
      background: var(--color-info);
      border-color: var(--color-info);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
    }
  `]
})
export class InfoPopover {
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly title = input.required<string>();
  readonly text = input.required<string>();
  readonly tag = input<string | undefined>('');
  readonly hint = input<string | undefined>('');
  readonly align = input<'auto' | 'left' | 'right'>('auto');

  readonly isOpen = signal(false);
  readonly alignRight = signal(false);
  readonly openAbove = signal(false);

  toggle(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const nextState = !this.isOpen();
    if (nextState) {
      this.calculatePlacement();
    }
    this.isOpen.set(nextState);
  }

  private calculatePlacement(): void {
    if (typeof window === 'undefined') return;
    const manualAlign = this.align();
    if (manualAlign === 'right') {
      this.alignRight.set(true);
    } else if (manualAlign === 'left') {
      this.alignRight.set(false);
    } else {
      const rect = this.hostEl.nativeElement.getBoundingClientRect();
      this.alignRight.set(rect.left > window.innerWidth / 2);
    }

    const rect = this.hostEl.nativeElement.getBoundingClientRect();
    this.openAbove.set(rect.bottom + 220 > window.innerHeight && rect.top > 220);
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

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  }
}
