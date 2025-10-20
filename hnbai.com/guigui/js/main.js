
const AUTOPLAY = 5000; // 5 seconds

// Elements
const sliderImage = document.getElementById('slider-image');
const leftArea    = document.querySelector('.hit-area.left');
const rightArea   = document.querySelector('.hit-area.right');
const container   = document.querySelector('.slider-container');

// Image list
const images = [
  './img/guigui0.jpg',
  './img/guigui1.jpg',
  './img/guigui2.jpg',
  // add more...
];

// Prefetch
images.forEach(src => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as  = 'image';
  link.href = src;
  document.head.appendChild(link);
});

let currentIndex = 0;
let isAnimating  = false;
let autoplayId = null;

function showSlide(direction) {
  if (isAnimating) return;
  isAnimating = true;

  // Start fade-out
  sliderImage.classList.remove('fade-in');
  sliderImage.classList.add('fade-out');

  sliderImage.addEventListener('transitionend', () => {
    // Update index
    currentIndex = direction === 'left'
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;

    // Swap src, then fade in
    sliderImage.src = images[currentIndex];

    // Force a reflow so the next class change triggers transition
    void sliderImage.offsetWidth;

    sliderImage.classList.remove('fade-out');
    sliderImage.classList.add('fade-in');

    // Wait for fade-in to finish before allowing next click
    sliderImage.addEventListener('transitionend', () => {
      isAnimating = false;
      restartAutoplay();
    }, { once: true });

  }, { once: true });
}

function startAutoplay(){
    if (autoplayId) return; // Already running
    autoplayId = setInterval(() => {
        showSlide('right');
    }, AUTOPLAY);
}

function stopAutoplay() {
    if (!autoplayId) return; // Not running
    clearInterval(autoplayId);
    autoplayId = null;
}

function restartAutoplay() {
    if (!autoplayId) return; // Not running
    stopAutoplay();
    startAutoplay();
}

// Click handlers
leftArea.addEventListener('click',  () => showSlide('left'));
rightArea.addEventListener('click', () => showSlide('right'));

// Pause when hovered
container.addEventListener('mouseenter', stopAutoplay);
container.addEventListener('mouseleave', startAutoplay);

// Optional: keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  showSlide('left');
  if (e.key === 'ArrowRight') showSlide('right');
});

// Optional: pause when tab not visible
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopAutoplay();
  else startAutoplay();
});

startAutoplay();