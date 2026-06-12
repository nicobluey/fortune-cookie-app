import './styles.css';
import frameOne from '../IMG_0205.PNG';
import frameTwo from '../IMG_0206.PNG';
import frameThree from '../IMG_0207.PNG';
import frameFour from '../IMG_0208.PNG';
import frameFortune from '../IMG_0209.PNG';
import { fortunes } from './fortunes.js';

const app = document.querySelector('#app');
const frames = [frameOne, frameTwo, frameThree, frameFour, frameFortune];

let step = 0;
let fortune = pickFortune();
let tutorialOpen = false;

window.addEventListener('resize', () => {
  if (step === frames.length - 1) {
    requestAnimationFrame(fitFortuneText);
  }
});

function pickFortune() {
  const forcedFortune = new URLSearchParams(window.location.search).get('fortune');
  if (forcedFortune) return forcedFortune;

  return fortunes[Math.floor(Math.random() * fortunes.length)];
}

function advance() {
  if (tutorialOpen) return;

  if (step < frames.length - 1) {
    step += 1;
    if (step === frames.length - 1) {
      fortune = pickFortune();
    }
    render();
  }
}

function reset() {
  step = 0;
  fortune = pickFortune();
  tutorialOpen = false;
  render();
}

function openTutorial() {
  tutorialOpen = true;
  render();
}

function closeTutorial() {
  tutorialOpen = false;
  render();
}

function render() {
  app.innerHTML = `
    <section class="phone-frame" aria-live="polite">
      <button class="tap-layer" type="button" aria-label="${step < 4 ? 'Open fortune cookie' : 'Fortune revealed'}">
        <img class="frame-image" src="${frames[step]}" alt="" draggable="false" />
      </button>
      <button class="home-guide-button" type="button" aria-label="How to save to Home Screen">
        <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <path d="M14 30 32 14l18 16v20a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4Z" />
          <path d="M25 54V36h14v18" />
        </svg>
      </button>
      ${
        step === 4
          ? `
            <div class="fortune-paper" role="status">
              <p>${fortune}</p>
            </div>
            <button class="hotspot close-hotspot" type="button" aria-label="Start again"></button>
            <button class="hotspot replay-hotspot" type="button" aria-label="Start again"></button>
          `
          : ''
      }
      ${
        tutorialOpen
          ? `
            <div class="tutorial-backdrop">
              <section class="tutorial-panel" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
                <button class="tutorial-close" type="button" aria-label="Close tutorial">&times;</button>
                <h1 id="tutorial-title">Save to Home Screen</h1>
                <ol>
                  <li>Open this page in Safari.</li>
                  <li>Tap More, then Share.</li>
                  <li>Choose Add to Home Screen.</li>
                  <li>Turn on Open as Web App.</li>
                  <li>Tap Add.</li>
                </ol>
              </section>
            </div>
          `
          : ''
      }
    </section>
  `;

  const tapLayer = app.querySelector('.tap-layer');
  tapLayer.addEventListener('click', advance);
  tapLayer.addEventListener('keydown', handleKeydown);

  app.querySelectorAll('.hotspot').forEach((button) => {
    button.addEventListener('click', reset);
  });

  const guideButton = app.querySelector('.home-guide-button');
  guideButton.addEventListener('click', (event) => {
    event.stopPropagation();
    openTutorial();
  });

  const tutorialClose = app.querySelector('.tutorial-close');
  if (tutorialClose) {
    tutorialClose.addEventListener('click', (event) => {
      event.stopPropagation();
      closeTutorial();
    });
  }

  const tutorialBackdrop = app.querySelector('.tutorial-backdrop');
  if (tutorialBackdrop) {
    tutorialBackdrop.addEventListener('click', closeTutorial);
    app.querySelector('.tutorial-panel').addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (step === frames.length - 1) {
    requestAnimationFrame(fitFortuneText);
  }
}

function handleKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    advance();
  }
}

function fitFortuneText() {
  const paper = app.querySelector('.fortune-paper');
  const text = app.querySelector('.fortune-paper p');
  if (!paper || !text) return;

  const paperRect = paper.getBoundingClientRect();
  const maxWidth = paperRect.width * 0.82;
  const maxHeight = paperRect.height * 0.56;
  let fontSize = Math.min(paperRect.width * 0.105, 42);

  text.style.width = `${maxWidth}px`;
  text.style.fontSize = `${fontSize}px`;

  while (fontSize > 17) {
    const textRect = text.getBoundingClientRect();
    if (textRect.width <= maxWidth && textRect.height <= maxHeight) break;
    fontSize -= 1;
    text.style.fontSize = `${fontSize}px`;
  }
}

render();
