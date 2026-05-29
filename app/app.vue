<template>
  <div class="arena">
    <!-- CSS Starfield -->
    <div class="starfield" aria-hidden="true">
      <div v-for="i in 130" :key="i" class="star" :style="{
        left: `${(i * 137.508) % 100}%`,
        top: `${(i * 73.611) % 100}%`,
        width: `${0.5 + (i % 3) * 0.8}px`,
        height: `${0.5 + (i % 3) * 0.8}px`,
        animationDelay: `${(i * 0.317) % 5}s`,
        animationDuration: `${1.8 + (i % 7) * 0.6}s`,
      }" />
    </div>

    <!-- Scanline overlay -->
    <div class="scanlines" aria-hidden="true" />

    <!-- ══════════════ PLAYER 1 – DARK SIDE (rotated 180°) ══════════════ -->
    <section class="player-panel dark-side" :class="stateClass(p1hp, startHp1)">
      <div class="panel-inner">
        <div class="faction-name ds-label">
          <span class="pip" />
          DARK SIDE
          <span class="pip" />
        </div>
        <div class="counter-row">
          <button class="btn-counter" @click="change(1, -1)" @contextmenu.prevent="change(1, -5)"
            aria-label="Decrease Dark Side HP">
            <span class="btn-icon">−</span>
          </button>
          <div class="hp-wrap">
            <span class="hp-num" :class="{ flash: p1Flash }">{{ p1hp }}</span>
            <div class="base-label">DAMAGE / {{ startHp1 }}</div>
          </div>
          <button class="btn-counter" @click="change(1, 1)" @contextmenu.prevent="change(1, 5)"
            aria-label="Increase Dark Side HP">
            <span class="btn-icon">+</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ══════════════ CENTER DIVIDER ══════════════ -->
    <div class="divider-bar">
      <div class="saber-track saber-red" />
      <button class="settings-btn" @click="openConfig" aria-label="Configure game" title="Configure">
        ⚙
      </button>
      <button class="reset-orb" @click="reset" aria-label="Reset game" title="Reset game">
        <span class="reset-icon">↺</span>
      </button>
      <div class="saber-track saber-blue" />
    </div>

    <!-- ══════════════ PLAYER 2 – LIGHT SIDE (normal) ══════════════ -->
    <section class="player-panel light-side" :class="stateClass(p2hp, startHp2)">
      <div class="panel-inner">
        <div class="counter-row">
          <button class="btn-counter" @click="change(2, -1)" @contextmenu.prevent="change(2, -5)"
            aria-label="Decrease Light Side HP">
            <span class="btn-icon">−</span>
          </button>
          <div class="hp-wrap">
            <span class="hp-num" :class="{ flash: p2Flash }">{{ p2hp }}</span>
            <div class="base-label">DAMAGE / {{ startHp2 }}</div>
          </div>
          <button class="btn-counter" @click="change(2, 1)" @contextmenu.prevent="change(2, 5)"
            aria-label="Increase Light Side HP">
            <span class="btn-icon">+</span>
          </button>
        </div>
        <div class="faction-name ls-label">
          <span class="pip" />
          LIGHT SIDE
          <span class="pip" />
        </div>
      </div>
    </section>

    <!-- ══════════════ CONFIG MODAL ══════════════ -->
    <Transition name="modal">
      <div v-if="showConfig" class="config-backdrop" @click.self="closeConfig">
        <div class="config-panel" role="dialog" aria-label="Configure Battle">
          <div class="config-title">CONFIGURE BATTLE</div>

          <div class="config-body">
            <!-- Dark Side -->
            <div class="config-side">
              <div class="config-faction-label ds-label">DARK SIDE</div>
              <div class="config-presets">
                <button v-for="p in PRESETS" :key="p" class="preset-btn ds-preset" :class="{ active: draftHp1 === p }"
                  @click="draftHp1 = p">{{ p }}</button>
              </div>
              <input type="number" class="hp-input ds-input" v-model.number="draftHp1" min="1" max="99"
                aria-label="Dark Side starting HP" />
            </div>

            <!-- Light Side -->
            <div class="config-side">
              <div class="config-faction-label ls-label">LIGHT SIDE</div>
              <div class="config-presets">
                <button v-for="p in PRESETS" :key="p" class="preset-btn ls-preset" :class="{ active: draftHp2 === p }"
                  @click="draftHp2 = p">{{ p }}</button>
              </div>
              <input type="number" class="hp-input ls-input" v-model.number="draftHp2" min="1" max="99"
                aria-label="Light Side starting HP" />
            </div>
          </div>

          <div class="config-actions">
            <button class="config-btn cancel-btn" @click="closeConfig">CANCEL</button>
            <button class="config-btn apply-btn" @click="applyConfig">ENGAGE</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══════════════ VICTORY OVERLAY ══════════════ -->
    <Transition name="victory">
      <div v-if="victor" class="victory-overlay" @click="reset">
        <div class="victory-content">
          <div class="victory-crawl">
            <div class="victory-faction-name" :class="victor === 'DARK SIDE' ? 'red' : 'blue'">
              {{ victor }}
            </div>
            <div class="victory-subtitle">DESTROYS THE BASE</div>
            <div class="victory-divider" />
            <div class="victory-cta">Tap anywhere to play again</div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const PRESETS = [20, 25, 30, 35]

const startHp1 = ref(30)
const startHp2 = ref(30)

const p1hp = ref(0)
const p2hp = ref(0)
const p1Flash = ref(false)
const p2Flash = ref(false)
const victor = ref<string | null>(null)

// ── Config modal ──────────────────────────────────────────────
const showConfig = ref(false)
const draftHp1 = ref(startHp1.value)
const draftHp2 = ref(startHp2.value)

function openConfig() {
  draftHp1.value = startHp1.value
  draftHp2.value = startHp2.value
  showConfig.value = true
}

function closeConfig() {
  showConfig.value = false
}

function applyConfig() {
  startHp1.value = Math.max(1, Math.min(99, draftHp1.value || 30))
  startHp2.value = Math.max(1, Math.min(99, draftHp2.value || 30))
  showConfig.value = false
  reset()
}

onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeConfig()
  })
})

// ── Game logic ────────────────────────────────────────────────
function change(player: 1 | 2, delta: number) {
  if (victor.value) return
  if (player === 1) {
    p1hp.value = Math.max(0, Math.min(startHp1.value, p1hp.value + delta))
    triggerFlash(1)
    if (p1hp.value >= startHp1.value) victor.value = 'LIGHT SIDE'
  } else {
    p2hp.value = Math.max(0, Math.min(startHp2.value, p2hp.value + delta))
    triggerFlash(2)
    if (p2hp.value >= startHp2.value) victor.value = 'DARK SIDE'
  }
}

function triggerFlash(player: 1 | 2) {
  if (player === 1) {
    p1Flash.value = true
    setTimeout(() => (p1Flash.value = false), 380)
  } else {
    p2Flash.value = true
    setTimeout(() => (p2Flash.value = false), 380)
  }
}

function reset() {
  p1hp.value = 0
  p2hp.value = 0
  victor.value = null
}

function stateClass(hp: number, max: number) {
  if (hp >= max) return 'defeated'
  if (max > 0 && hp / max >= 0.75) return 'critical'
  return ''
}
</script>

<style>
/* ── Global ─────────────────────────────────────────────────── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  overflow: hidden;
  background: #000;
  touch-action: manipulation;
}

/* ── Design tokens ───────────────────────────────────────────── */
:root {
  --yellow: #FFE81F;
  --yellow-dim: rgba(255, 232, 31, 0.45);
  --red: #CC0022;
  --red-bright: #FF1744;
  --red-glow: rgba(255, 23, 68, 0.55);
  --blue: #0077DD;
  --blue-bright: #40C4FF;
  --blue-glow: rgba(64, 196, 255, 0.55);
  --bg: #020408;
  --divider-h: 58px;
  --font-hud: 'Orbitron', sans-serif;
  --font-lore: 'Cinzel Decorative', serif;
}

/* ── Arena ───────────────────────────────────────────────────── */
.arena {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font-hud);
  user-select: none;
  -webkit-user-select: none;
}

/* ── Starfield ───────────────────────────────────────────────── */
.starfield {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0% {
    opacity: 0.08;
    transform: scale(0.7);
  }

  50% {
    opacity: 0.9;
    transform: scale(1.3);
  }

  100% {
    opacity: 0.08;
    transform: scale(0.7);
  }
}

/* ── Scanlines ───────────────────────────────────────────────── */
.scanlines {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.14) 2px,
      rgba(0, 0, 0, 0.14) 4px);
}

/* ── Player Panels ───────────────────────────────────────────── */
.player-panel {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  overflow: hidden;
  transition: background 0.6s ease;
}

/* faction vignettes */
.dark-side {
  transform: rotate(180deg);
  background: radial-gradient(ellipse at 50% 85%, rgba(180, 0, 20, 0.18) 0%, transparent 65%), var(--bg);
}

.light-side {
  background: radial-gradient(ellipse at 50% 15%, rgba(0, 119, 221, 0.18) 0%, transparent 65%), var(--bg);
}

/* critical warning glow */
.player-panel.critical.dark-side {
  background: radial-gradient(ellipse at 50% 85%, rgba(220, 0, 30, 0.35) 0%, transparent 65%), var(--bg);
  animation: panel-danger 1.2s ease-in-out infinite;
}

.player-panel.critical.light-side {
  background: radial-gradient(ellipse at 50% 15%, rgba(0, 80, 180, 0.35) 0%, transparent 65%), var(--bg);
  animation: panel-danger 1.2s ease-in-out infinite;
}

@keyframes panel-danger {

  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.15);
  }
}

.player-panel.defeated {
  filter: grayscale(0.4) brightness(0.6);
}

/* ── Panel inner ─────────────────────────────────────────────── */
.panel-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 2.5vh, 22px);
  padding: clamp(8px, 2vw, 28px);
  width: 100%;
  max-width: 560px;
}

/* ── Faction name ────────────────────────────────────────────── */
.faction-name {
  font-family: var(--font-lore);
  font-size: clamp(0.7rem, 2.2vw, 1.25rem);
  letter-spacing: 0.35em;
  display: flex;
  align-items: center;
  gap: 14px;
  text-transform: uppercase;
}

.ds-label {
  color: var(--red-bright);
  text-shadow: 0 0 18px var(--red-glow), 0 0 40px rgba(255, 23, 68, 0.25);
}

.ls-label {
  color: var(--blue-bright);
  text-shadow: 0 0 18px var(--blue-glow), 0 0 40px rgba(64, 196, 255, 0.25);
}

.pip {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  animation: pip-blink 2.4s ease-in-out infinite;
}

.ds-label .pip {
  background: var(--red-bright);
  box-shadow: 0 0 8px var(--red-bright);
}

.ls-label .pip {
  background: var(--blue-bright);
  box-shadow: 0 0 8px var(--blue-bright);
}

@keyframes pip-blink {

  0%,
  100% {
    opacity: 0.4;
    transform: scale(0.75);
  }

  50% {
    opacity: 1;
    transform: scale(1.25);
  }
}

/* ── Counter row ─────────────────────────────────────────────── */
.counter-row {
  display: flex;
  align-items: center;
  gap: clamp(14px, 4.5vw, 44px);
}

/* ── Counter buttons ─────────────────────────────────────────── */
.btn-counter {
  width: clamp(60px, 17vw, 92px);
  height: clamp(60px, 17vw, 92px);
  border-radius: 50%;
  border: 2px solid;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease, box-shadow 0.15s ease, background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.dark-side .btn-counter {
  border-color: rgba(255, 23, 68, 0.45);
  color: var(--red-bright);
}

.dark-side .btn-counter:hover,
.dark-side .btn-counter:active {
  background: rgba(255, 23, 68, 0.15);
  border-color: var(--red-bright);
  box-shadow: 0 0 22px var(--red-glow), inset 0 0 16px rgba(255, 23, 68, 0.1);
  transform: scale(1.1);
}

.light-side .btn-counter {
  border-color: rgba(64, 196, 255, 0.45);
  color: var(--blue-bright);
}

.light-side .btn-counter:hover,
.light-side .btn-counter:active {
  background: rgba(64, 196, 255, 0.15);
  border-color: var(--blue-bright);
  box-shadow: 0 0 22px var(--blue-glow), inset 0 0 16px rgba(64, 196, 255, 0.1);
  transform: scale(1.1);
}

.btn-icon {
  font-size: clamp(1.8rem, 5.5vw, 2.8rem);
  font-weight: 700;
  line-height: 1;
}

/* ── HP display ──────────────────────────────────────────────── */
.hp-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: clamp(90px, 22vw, 160px);
}

.hp-num {
  font-size: clamp(6rem, 24vw, 12rem);
  font-weight: 900;
  line-height: 1;
  color: var(--yellow);
  text-shadow:
    0 0 24px rgba(255, 232, 31, 0.6),
    0 0 60px rgba(255, 232, 31, 0.2);
  transition: color 0.2s ease;
}

.hp-num.flash {
  animation: hp-flash 0.38s cubic-bezier(.36, .07, .19, .97);
}

@keyframes hp-flash {
  0% {
    transform: scale(1);
    color: var(--yellow);
  }

  30% {
    transform: scale(1.22);
    color: #fff;
  }

  100% {
    transform: scale(1);
    color: var(--yellow);
  }
}

.critical .hp-num {
  animation: crit-pulse 0.9s ease-in-out infinite;
}

@keyframes crit-pulse {

  0%,
  100% {
    text-shadow: 0 0 24px rgba(255, 232, 31, 0.6);
  }

  50% {
    text-shadow: 0 0 60px #fff, 0 0 100px rgba(255, 232, 31, 0.5);
  }
}

.base-label {
  font-size: clamp(0.42rem, 1.3vw, 0.65rem);
  letter-spacing: 0.45em;
  color: var(--yellow-dim);
  margin-top: 4px;
}

/* ── Centre divider bar ──────────────────────────────────────── */
.divider-bar {
  position: relative;
  z-index: 10;
  height: var(--divider-h);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.saber-track {
  flex: 1;
  height: 3px;
  border-radius: 2px;
}

.saber-red {
  background: linear-gradient(to left, var(--red-bright), transparent);
  box-shadow: 0 0 10px var(--red-bright), 0 0 22px var(--red-glow);
  animation: saber-breathe 2s ease-in-out infinite;
}

.saber-blue {
  background: linear-gradient(to right, var(--blue-bright), transparent);
  box-shadow: 0 0 10px var(--blue-bright), 0 0 22px var(--blue-glow);
  animation: saber-breathe 2s ease-in-out infinite 1s;
}

@keyframes saber-breathe {

  0%,
  100% {
    opacity: 0.65;
  }

  50% {
    opacity: 1;
  }
}

/* ── Reset orb ───────────────────────────────────────────────── */
.reset-orb {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(10, 12, 20, 0.92);
  border: 2px solid rgba(255, 232, 31, 0.28);
  color: rgba(255, 232, 31, 0.65);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.reset-orb:hover,
.reset-orb:active {
  border-color: var(--yellow);
  color: var(--yellow);
  box-shadow: 0 0 20px rgba(255, 232, 31, 0.4);
  transform: scale(1.12) rotate(20deg);
}

.reset-icon {
  font-size: 1.25rem;
}

/* ── Victory overlay ─────────────────────────────────────────── */
.victory-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.88);
  backdrop-filter: blur(6px);
  cursor: pointer;
}

.victory-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  perspective: 600px;
}

.victory-crawl {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(10px, 2.5vh, 20px);
  animation: crawl-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes crawl-in {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.victory-faction-name {
  font-family: var(--font-lore);
  font-size: clamp(2.2rem, 9vw, 4.5rem);
  font-weight: 700;
  letter-spacing: 0.08em;
  animation: victory-pulse 1.8s ease-in-out infinite;
}

.victory-faction-name.red {
  color: var(--red-bright);
  text-shadow: 0 0 40px var(--red-bright), 0 0 80px var(--red-glow);
}

.victory-faction-name.blue {
  color: var(--blue-bright);
  text-shadow: 0 0 40px var(--blue-bright), 0 0 80px var(--blue-glow);
}

@keyframes victory-pulse {

  0%,
  100% {
    filter: brightness(1);
  }

  50% {
    filter: brightness(1.5);
  }
}

.victory-subtitle {
  font-size: clamp(0.9rem, 2.8vw, 1.6rem);
  letter-spacing: 0.45em;
  color: var(--yellow);
  text-shadow: 0 0 20px rgba(255, 232, 31, 0.5);
}

.victory-divider {
  width: 160px;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--yellow-dim), transparent);
  margin: 4px 0;
}

.victory-cta {
  font-size: clamp(0.6rem, 1.8vw, 0.85rem);
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.35);
  animation: blink-cta 1.6s ease-in-out infinite;
}

@keyframes blink-cta {

  0%,
  100% {
    opacity: 0.35;
  }

  50% {
    opacity: 0.9;
  }
}

/* ── Settings button ─────────────────────────────────────────── */
.settings-btn {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(255, 232, 31, 0.2);
  color: rgba(255, 232, 31, 0.45);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.18s ease;
  margin-right: 6px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.settings-btn:hover,
.settings-btn:active {
  border-color: var(--yellow);
  color: var(--yellow);
  box-shadow: 0 0 16px rgba(255, 232, 31, 0.3);
  transform: rotate(60deg) scale(1.1);
}

/* ── Config modal ─────────────────────────────────────────────── */
.config-backdrop {
  position: absolute;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
}

.config-panel {
  background: rgba(4, 7, 16, 0.98);
  border: 1px solid rgba(255, 232, 31, 0.22);
  box-shadow:
    0 0 0 1px rgba(255, 232, 31, 0.06),
    0 0 60px rgba(0, 0, 0, 0.8),
    0 0 30px rgba(255, 232, 31, 0.06);
  border-radius: 4px;
  padding: clamp(20px, 5vw, 36px);
  width: min(88vw, 460px);
  display: flex;
  flex-direction: column;
  gap: clamp(18px, 3vh, 26px);
}

.config-title {
  font-family: var(--font-lore);
  font-size: clamp(0.8rem, 2.5vw, 1.15rem);
  letter-spacing: 0.35em;
  color: var(--yellow);
  text-shadow: 0 0 20px rgba(255, 232, 31, 0.4);
  text-align: center;
}

.config-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(12px, 3vw, 24px);
}

.config-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.config-faction-label {
  font-family: var(--font-lore);
  font-size: clamp(0.55rem, 1.6vw, 0.78rem);
  letter-spacing: 0.3em;
}

.config-presets {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: center;
}

.preset-btn {
  width: 44px;
  height: 32px;
  border-radius: 3px;
  font-family: var(--font-hud);
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.14s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.ds-preset {
  background: transparent;
  border: 1px solid rgba(255, 23, 68, 0.3);
  color: rgba(255, 23, 68, 0.65);
}

.ds-preset:hover,
.ds-preset.active {
  background: rgba(255, 23, 68, 0.18);
  border-color: var(--red-bright);
  color: var(--red-bright);
  box-shadow: 0 0 10px var(--red-glow);
}

.ls-preset {
  background: transparent;
  border: 1px solid rgba(64, 196, 255, 0.3);
  color: rgba(64, 196, 255, 0.65);
}

.ls-preset:hover,
.ls-preset.active {
  background: rgba(64, 196, 255, 0.18);
  border-color: var(--blue-bright);
  color: var(--blue-bright);
  box-shadow: 0 0 10px var(--blue-glow);
}

.hp-input {
  width: 86px;
  height: 46px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 3px;
  color: var(--yellow);
  font-family: var(--font-hud);
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.ds-input {
  border: 1px solid rgba(255, 23, 68, 0.3);
}

.ds-input:focus {
  border-color: var(--red-bright);
  box-shadow: 0 0 14px var(--red-glow);
}

.ls-input {
  border: 1px solid rgba(64, 196, 255, 0.3);
}

.ls-input:focus {
  border-color: var(--blue-bright);
  box-shadow: 0 0 14px var(--blue-glow);
}

/* hide browser number spinners */
.hp-input::-webkit-inner-spin-button,
.hp-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

.hp-input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.config-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.config-btn {
  height: 40px;
  padding: 0 clamp(16px, 4vw, 28px);
  border-radius: 3px;
  font-family: var(--font-hud);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  cursor: pointer;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.cancel-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.38);
}

.cancel-btn:hover,
.cancel-btn:active {
  border-color: rgba(255, 255, 255, 0.32);
  color: rgba(255, 255, 255, 0.65);
}

.apply-btn {
  background: rgba(255, 232, 31, 0.08);
  border: 1px solid rgba(255, 232, 31, 0.45);
  color: var(--yellow);
}

.apply-btn:hover,
.apply-btn:active {
  background: rgba(255, 232, 31, 0.18);
  border-color: var(--yellow);
  box-shadow: 0 0 22px rgba(255, 232, 31, 0.25);
  color: #fff;
}

/* ── Transitions ─────────────────────────────────────────────── */
.victory-enter-active,
.victory-leave-active {
  transition: opacity 0.4s ease;
}

.victory-enter-from,
.victory-leave-to {
  opacity: 0;
}

.modal-enter-active {
  transition: opacity 0.22s ease;
}

.modal-leave-active {
  transition: opacity 0.18s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>