/**
 * SEMANA INGENIOSAS 2026 - PRESENTATION ENGINE
 * Silent, Snappy, Minimalist Controller
 */

class PresentationEngine {
  constructor() {
    this.slides = Array.from(document.querySelectorAll('.slide'));
    this.totalSlides = this.slides.length;
    this.currentIndex = 0;
    
    // UI Elements
    this.boostFill = document.getElementById('boostFill');
    this.lapCounter = document.getElementById('lapCounter');
    this.btnPrev = document.getElementById('btnPrev');
    this.btnNext = document.getElementById('btnNext');
    this.btnFullscreen = document.getElementById('btnFullscreen');
    this.btnGridToggle = document.getElementById('btnGridToggle');
    this.overviewModal = document.getElementById('slideOverviewModal');
    this.overviewGrid = document.getElementById('overviewGrid');
    this.overviewCloseBtn = document.getElementById('overviewCloseBtn');
    this.toast = document.getElementById('toastFeedback');

    this.touchStartX = 0;
    this.touchEndX = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.buildSlideOverview();
    this.goToSlide(0);
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 1500);
  }

  /* ========================================================================
     NAVIGATION
     ======================================================================== */
  goToSlide(index) {
    if (index < 0 || index >= this.totalSlides) return;

    // Pause any playing videos when leaving slide
    const currentSlide = this.slides[this.currentIndex];
    if (currentSlide) {
      const video = currentSlide.querySelector('video');
      if (video) {
        video.pause();
        const playBtn = currentSlide.querySelector('.video-play-overlay-btn');
        if (playBtn) playBtn.style.display = 'flex';
      }
    }

    this.currentIndex = index;

    // Toggle active slide
    this.slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'previous');
      if (idx === this.currentIndex) {
        slide.classList.add('active');
      } else if (idx < this.currentIndex) {
        slide.classList.add('previous');
      }
    });

    // Update progress bar
    const progressPercent = ((this.currentIndex + 1) / this.totalSlides) * 100;
    if (this.boostFill) {
      this.boostFill.style.width = `${progressPercent}%`;
    }

    // Update counter
    if (this.lapCounter) {
      const currentFormatted = String(this.currentIndex + 1).padStart(2, '0');
      const totalFormatted = String(this.totalSlides).padStart(2, '0');
      this.lapCounter.innerHTML = `${currentFormatted} <span>/ ${totalFormatted}</span>`;
    }

    // Button states
    if (this.btnPrev) this.btnPrev.disabled = this.currentIndex === 0;
    if (this.btnNext) this.btnNext.disabled = this.currentIndex === this.totalSlides - 1;

    this.updateOverviewActive();
  }

  next() {
    // If the active slide has an unrevealed interactive card, reveal it first!
    const activeSlide = this.slides[this.currentIndex];
    const unrevealedCard = activeSlide.querySelector('.interactive-reveal-card:not(.revealed)');
    if (unrevealedCard) {
      this.triggerReveal(unrevealedCard);
      return;
    }

    if (this.currentIndex < this.totalSlides - 1) {
      this.goToSlide(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.goToSlide(this.currentIndex - 1);
    }
  }

  triggerReveal(cardElement) {
    if (!cardElement || cardElement.classList.contains('revealed')) return;
    cardElement.classList.add('revealed');
    const btn = cardElement.querySelector('.reveal-btn-simple');
    if (btn) {
      btn.style.display = 'none';
    }
  }

  /* ========================================================================
     OVERVIEW MODAL (GRID SELECTOR)
     ======================================================================== */
  buildSlideOverview() {
    if (!this.overviewGrid) return;
    this.overviewGrid.innerHTML = '';

    this.slides.forEach((slide, index) => {
      const item = document.createElement('div');
      item.className = 'overview-item';
      if (index === this.currentIndex) item.classList.add('current');

      const titleEl = slide.querySelector('.title-large');
      const titleText = titleEl ? titleEl.innerText.replace(/\n/g, ' ') : `Diapositiva ${index + 1}`;
      const ribbonEl = slide.querySelector('.ribbon-tag');
      const ribbonText = ribbonEl ? ribbonEl.innerText : 'MÓDULO';

      item.innerHTML = `
        <div class="overview-num">${String(index + 1).padStart(2, '0')} // ${ribbonText}</div>
        <div class="overview-label">${titleText.substring(0, 45)}</div>
      `;

      item.addEventListener('click', () => {
        this.goToSlide(index);
        this.closeOverview();
      });

      this.overviewGrid.appendChild(item);
    });
  }

  updateOverviewActive() {
    if (!this.overviewGrid) return;
    const items = this.overviewGrid.querySelectorAll('.overview-item');
    items.forEach((item, idx) => {
      if (idx === this.currentIndex) {
        item.classList.add('current');
      } else {
        item.classList.remove('current');
      }
    });
  }

  openOverview() {
    if (this.overviewModal) {
      this.overviewModal.classList.add('open');
    }
  }

  closeOverview() {
    if (this.overviewModal) {
      this.overviewModal.classList.remove('open');
    }
  }

  toggleOverview() {
    if (this.overviewModal && this.overviewModal.classList.contains('open')) {
      this.closeOverview();
    } else {
      this.openOverview();
    }
  }

  /* ========================================================================
     FULLSCREEN
     ======================================================================== */
  toggleFullscreen() {
    const doc = document;
    const docEl = document.documentElement;
    const isFs = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (!isFs) {
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
      if (req) {
        req.call(docEl).then(() => {
          this.showToast("Pantalla Completa Activada");
        }).catch(err => {
          console.warn(err);
          document.body.classList.toggle('is-fullscreen');
        });
      } else {
        document.body.classList.toggle('is-fullscreen');
      }
    } else {
      const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
      if (exit) {
        exit.call(doc).then(() => {
          this.showToast("Pantalla Completa Desactivada");
        }).catch(() => {
          document.body.classList.remove('is-fullscreen');
        });
      } else {
        document.body.classList.remove('is-fullscreen');
      }
    }
  }


  /* ========================================================================
     EVENT LISTENERS
     ======================================================================== */
  setupEventListeners() {
    // Navigation Buttons
    if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.prev());
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.next());

    // Top HUD
    if (this.btnFullscreen) this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    if (this.btnGridToggle) this.btnGridToggle.addEventListener('click', () => this.toggleOverview());
    if (this.overviewCloseBtn) this.overviewCloseBtn.addEventListener('click', () => this.closeOverview());

    // Hero Start Button
    const heroBtn = document.getElementById('heroStartBtn');
    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        this.next();
      });
    }

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
      if (this.overviewModal && this.overviewModal.classList.contains('open')) {
        if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') {
          this.closeOverview();
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ': // Space
        case 'Enter':
          e.preventDefault();
          this.next();
          break;

        case 'ArrowLeft':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          this.prev();
          break;

        case 'f':
        case 'F':
          e.preventDefault();
          this.toggleFullscreen();
          break;

        case 'g':
        case 'G':
          e.preventDefault();
          this.toggleOverview();
          break;
      }
    });

    // Touch Swipe
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      const diff = this.touchStartX - this.touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.next();
        else this.prev();
      }
    }, { passive: true });

    // Interactive Reveal Buttons
    document.querySelectorAll('.reveal-btn-simple').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.interactive-reveal-card');
        this.triggerReveal(card);
      });
    });

    // Video Play Overlay Button
    const video = document.getElementById('motorVideo');
    const videoBtn = document.getElementById('videoOverlayBtn');
    if (video && videoBtn) {
      videoBtn.addEventListener('click', () => {
        video.play();
        videoBtn.style.display = 'none';
      });
      video.addEventListener('click', () => {
        if (video.paused) {
          video.play();
          videoBtn.style.display = 'none';
        } else {
          video.pause();
          videoBtn.style.display = 'flex';
        }
      });
      video.addEventListener('ended', () => {
        videoBtn.style.display = 'flex';
        videoBtn.textContent = '↺ Repetir Video';
      });
    }

    // Fullscreen state sync
    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (isFs) {
        document.body.classList.add('is-fullscreen');
      } else {
        document.body.classList.remove('is-fullscreen', 'hide-cursor');
      }
    };

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
      document.addEventListener(evt, handleFullscreenChange);
    });

    // Auto-hide mouse cursor in fullscreen after 2.5s of inactivity
    let cursorTimer = null;
    document.addEventListener('mousemove', () => {
      if (document.body.classList.contains('is-fullscreen') || document.fullscreenElement) {
        document.body.classList.remove('hide-cursor');
        clearTimeout(cursorTimer);
        cursorTimer = setTimeout(() => {
          if (document.body.classList.contains('is-fullscreen') || document.fullscreenElement) {
            document.body.classList.add('hide-cursor');
          }
        }, 2500);
      }
    });

    // Click on slide background to advance (presentation remote click or mouse click)
    const deckContainer = document.getElementById('deckContainer');
    if (deckContainer) {
      deckContainer.addEventListener('click', (e) => {
        if (e.target.closest('button, video, a, .interactive-reveal-card, .overview-modal')) {
          return;
        }
        this.next();
      });
    }
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  window.presentation = new PresentationEngine();
});
