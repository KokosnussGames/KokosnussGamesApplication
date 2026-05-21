import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <main
      class="menu-shell"
      [class.game-shell]="!!activeGame"
      aria-label="Coconut Games main menu"
    >
      <section
        class="menu-stage"
        [class.settings-view]="isSettingsView"
      >
        <div class="scene-bg" aria-hidden="true"></div>
        <div class="intro-clouds" aria-hidden="true"></div>
        <div class="seagull flock-one" aria-hidden="true"></div>
        <div class="seagull flock-two" aria-hidden="true"></div>
        <div class="seagull flock-three" aria-hidden="true"></div>

        @if (!activeGame) {
          <div class="menu-copy">
          <p>{{ isSettingsView ? 'Audio & Anzeige' : 'Spielauswahl' }}</p>
          <h1>{{ isSettingsView ? 'Einstellungen' : 'Kokosnuss Games' }}</h1>
          <span>
            {{
              isSettingsView
                ? 'Stell die Insel so ein, wie sie sich gut anfühlt.'
                : 'Wähle ein Spiel und starte die Runde.'
            }}
          </span>
          </div>
        }

        @if (!isSettingsView && !activeGame) {
          <div class="dock-menu">
            <div class="post post-left" aria-hidden="true"></div>
            <div class="post post-right" aria-hidden="true"></div>
            <nav class="sign-board" aria-label="Minigames">
              @for (game of games; track game.title) {
                <a
                  class="game-sign {{ game.className }}"
                  [class.is-selected]="$index === selectedGameIndex"
                  [href]="game.href"
                  (click)="handleGameClick($event, game.href)"
                  (mouseenter)="selectGame($index, true)"
                  (focus)="selectGame($index, true)"
                >
                  <span class="game-icon" aria-hidden="true">{{ game.icon }}</span>
                  <span>
                    <span class="game-title">{{ game.title }}</span>
                    <span class="game-meta">{{ game.meta }}</span>
                  </span>
                </a>
              }
            </nav>
          </div>
        }

        @if (isSettingsView) {
          <section class="settings-dock" aria-label="Einstellungen">
            <div class="settings-sign">
              <h2>Einstellungen</h2>
              <label class="setting-row">
                <span>
                  <strong>Hintergrundmusik</strong>
                  <small>{{ musicEnabled ? 'läuft' : 'pausiert' }}</small>
                </span>
                <button
                  class="wood-button"
                  [class.is-on]="musicEnabled"
                  type="button"
                  (click)="toggleMusic()"
                  (mouseenter)="playHoverSound()"
                >
                  {{ musicEnabled ? 'An' : 'Aus' }}
                </button>
              </label>
              <label class="setting-row volume-row">
                <span>
                  <strong>Lautstärke</strong>
                  <small>{{ musicVolume }}%</small>
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  [value]="musicVolume"
                  (input)="setMusicVolume($any($event.target).value)"
                  (pointerdown)="playClickSound()"
                />
              </label>
              <button
                class="back-sign"
                type="button"
                (click)="goHome()"
                (mouseenter)="playHoverSound()"
              >
                Zurück zum Menü
              </button>
            </div>
          </section>
        }

        <div class="shore-shadow" aria-hidden="true"></div>
        <div class="ambient-particles" aria-hidden="true"></div>
      </section>

      @if (activeGame) {
        <section class="game-dock" aria-label="Spielansicht">
          <div class="game-dock-inner" (animationend)="resetDocumentScroll()">
            <h2>{{ activeGame.title }}</h2>
            <div class="game-frame-sign">
              <iframe
                title="Spielplatz"
                src="https://www.google.com/webhp?igu=1"
                referrerpolicy="no-referrer"
                tabindex="-1"
                (load)="resetDocumentScroll()"
              ></iframe>
            </div>
            <button
              class="back-sign game-back-sign"
              type="button"
              (click)="goHome()"
              (mouseenter)="playHoverSound()"
            >
              Zurück zum Menü
            </button>
          </div>
        </section>
      }
    </main>
  `,
})
export class App {
  protected selectedGameIndex = 0;
  protected isSettingsView = false;
  protected activeGame?: { title: string; href: string };
  protected musicVolume = Number(localStorage.getItem('coconutMusicVolume') ?? 42);
  protected musicEnabled = localStorage.getItem('coconutMusicEnabled') !== 'false';

  private musicAudio?: HTMLAudioElement;
  private uiAudioContext?: AudioContext;
  private lastHoverSoundAt = 0;
  private musicPrimedMuted = false;

  constructor(private readonly router: Router) {
    this.createMusicAudio();
    this.primeMusicPlayback();
    this.updateViewFromPath(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateViewFromPath(event.urlAfterRedirects);
      }
    });
  }

  protected readonly games = [
    {
      title: 'Sudoku',
      meta: 'logic lagoon',
      href: '/sudoku',
      icon: '9',
      className: 'sign-sudoku',
    },
    {
      title: 'Minesweeper',
      meta: 'volcano field',
      href: '/minesweeper',
      icon: '!',
      className: 'sign-minesweeper',
    },
    {
      title: 'Nonogramm',
      meta: 'reef pixels',
      href: '/nonogramm',
      icon: '#',
      className: 'sign-nonogramm',
    },
    {
      title: 'Settings',
      meta: 'sound & controls',
      href: '/settings',
      icon: '+',
      className: 'sign-settings',
    },
  ];

  @HostListener('window:keydown', ['$event'])
  protected handleKeyboard(event: KeyboardEvent): void {
    this.ensureMusicStarted();
    const key = event.key.toLowerCase();

    if (this.isSettingsView || this.activeGame) {
      if (key === 'escape' || key === 'backspace') {
        event.preventDefault();
        this.playClickSound();
        this.goHome();
      }
      return;
    }

    if (key === 'arrowdown' || key === 's' || key === 'arrowright' || key === 'd') {
      event.preventDefault();
      this.selectGame((this.selectedGameIndex + 1) % this.games.length, true);
      return;
    }

    if (key === 'arrowup' || key === 'w' || key === 'arrowleft' || key === 'a') {
      event.preventDefault();
      this.selectGame((this.selectedGameIndex - 1 + this.games.length) % this.games.length, true);
      return;
    }

    if (key === 'enter' || key === ' ') {
      event.preventDefault();
      this.playClickSound();
      this.openSelectedGameWithSoundDelay();
    }
  }

  @HostListener('window:pointerdown')
  protected handlePointer(): void {
    this.ensureMusicStarted();
  }

  @HostListener('window:pointermove')
  protected handlePointerMove(): void {
    this.ensureMusicStarted();
  }

  @HostListener('window:popstate')
  protected handlePopState(): void {
    this.updateViewFromPath(window.location.pathname);
  }

  protected handleGameClick(event: MouseEvent, href: string): void {
    event.preventDefault();
    this.ensureMusicStarted();
    this.playClickSound();
    this.openHrefWithSoundDelay(href);
  }

  protected toggleMusic(): void {
    this.playClickSound();
    this.musicEnabled = !this.musicEnabled;
    localStorage.setItem('coconutMusicEnabled', String(this.musicEnabled));

    if (!this.musicEnabled) {
      this.musicAudio?.pause();
    } else {
      this.ensureMusicStarted();
    }

    this.applyMusicVolume();
  }

  protected setMusicVolume(value: string): void {
    this.musicVolume = Number(value);
    localStorage.setItem('coconutMusicVolume', String(this.musicVolume));
    this.ensureMusicStarted();
    this.applyMusicVolume();
  }

  protected goHome(): void {
    this.playClickSound();
    void this.router.navigateByUrl('/');
  }

  protected selectGame(index: number, withSound = false): void {
    this.ensureMusicStarted();

    if (index === this.selectedGameIndex) {
      return;
    }

    this.selectedGameIndex = index;

    if (withSound) {
      this.playHoverSound();
    }
  }

  protected playHoverSound(): void {
    const now = performance.now();

    if (now - this.lastHoverSoundAt < 55) {
      return;
    }

    this.lastHoverSoundAt = now;
    this.playUiTone(660, 1040, 0.07, 0.12, 'sine');
  }

  protected playClickSound(): void {
    this.playUiTone(310, 240, 0.12, 0.14, 'sine');
    window.setTimeout(() => this.playUiTone(430, 360, 0.09, 0.06, 'triangle'), 22);
  }

  private openSelectedGameWithSoundDelay(): void {
    const href = this.games[this.selectedGameIndex].href;
    this.openHrefWithSoundDelay(href);
  }

  private openHrefWithSoundDelay(href: string): void {
    if (href === '/settings') {
      window.setTimeout(() => this.openSettings(), 95);
      return;
    }

    window.setTimeout(() => void this.router.navigateByUrl(href), 115);
  }

  private openSettings(): void {
    void this.router.navigateByUrl('/settings');
  }

  private updateViewFromPath(path: string): void {
    const normalizedPath = path.split('?')[0].split('#')[0];

    this.isSettingsView = normalizedPath === '/settings';
    this.activeGame = this.games.find((game) => game.href === normalizedPath && game.href !== '/settings');
    this.resetDocumentScroll();
  }

  protected resetDocumentScroll(): void {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  }

  private ensureMusicStarted(): void {
    if (!this.musicEnabled) {
      return;
    }

    this.createMusicAudio();

    if (this.musicAudio) {
      this.musicAudio.muted = false;
      this.musicPrimedMuted = false;
      this.applyMusicVolume();
    }

    void this.musicAudio?.play().catch(() => {
      // Browsers can block audible autoplay; the pointer/keyboard listeners retry after interaction.
    });
  }

  private primeMusicPlayback(): void {
    if (!this.musicEnabled) {
      return;
    }

    this.createMusicAudio();

    if (!this.musicAudio) {
      return;
    }

    this.musicAudio.muted = true;
    this.musicPrimedMuted = true;

    void this.musicAudio.play().catch(() => {
      this.musicPrimedMuted = false;
      this.musicAudio!.muted = false;
    });
  }

  private applyMusicVolume(): void {
    if (!this.musicAudio) {
      return;
    }

    this.musicAudio.muted = this.musicPrimedMuted;
    this.musicAudio.volume = this.musicEnabled ? Math.min(this.musicVolume / 100, 1) : 0;
  }

  private createMusicAudio(): void {
    if (this.musicAudio) {
      return;
    }

    this.musicAudio = new Audio('/background-music-loop.mp3');
    this.musicAudio.loop = true;
    this.musicAudio.preload = 'auto';
    this.applyMusicVolume();
  }

  private playUiTone(
    startFrequency: number,
    endFrequency: number,
    duration: number,
    volume: number,
    type: OscillatorType,
  ): void {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    this.uiAudioContext ??= new AudioContextClass();
    void this.uiAudioContext.resume();

    const time = this.uiAudioContext.currentTime;
    const oscillator = this.uiAudioContext.createOscillator();
    const gain = this.uiAudioContext.createGain();
    const filter = this.uiAudioContext.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, time);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(volume, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.uiAudioContext.destination);
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
  }
}
