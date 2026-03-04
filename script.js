const canvas = document.getElementById("scroll-sequence");
const context = canvas.getContext("2d");

// Configuration
const frameCount = 192;
const currentFrame = index => `Images/${index.toString().padStart(5, '0')}.png`;

// Preload images
const images = [];
let loadedImages = 0;

for (let i = 1; i <= frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => {
        loadedImages++;
        if (loadedImages === 1) { // Draw first frame when available
            renderFrame(1);
        }
    };
    images[i] = img;
}

// Canvas resize and render logic
let frameIndex = 1;
let targetFrameIndex = 1;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(Math.round(frameIndex));
}

window.addEventListener('resize', resizeCanvas);

function renderFrame(index) {
    if (!images[index] || !images[index].complete) return;
    
    // Calculate aspect ratio cover
    const img = images[index];
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Scroll Handling
window.addEventListener('scroll', () => {
    const html = document.documentElement;
    const maxScrollTop = html.scrollHeight - window.innerHeight;
    
    if(maxScrollTop <= 0) return;
    
    const scrollFraction = window.scrollY / maxScrollTop;
    
    // Constrain to positive values and not above max frame
    const scrollBounded = Math.max(0, Math.min(1, scrollFraction));
    
    targetFrameIndex = Math.floor(scrollBounded * (frameCount - 1)) + 1;
});

// Smooth Animation Loop
function update() {
    // Interpolate towards target frame
    const diff = targetFrameIndex - frameIndex;
    
    // Smoothness factor: 0.08
    if (Math.abs(diff) > 0.1) {
        frameIndex += diff * 0.08; 
    } else {
        frameIndex = targetFrameIndex;
    }
    
    renderFrame(Math.round(frameIndex));
    requestAnimationFrame(update);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    requestAnimationFrame(update);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Optional: reset so it animates again when scrolling back
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.glass-panel').forEach(panel => {
        observer.observe(panel);
    });

    // Lightbox Functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-image');

    // Open lightbox
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.getAttribute('data-src');
            if (imgSrc) {
                lightboxImg.src = imgSrc;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when open
            }
        });
    });

    // Close lightbox functions
    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        setTimeout(() => { lightboxImg.src = ''; }, 400); // clear src after animation
    };

    // Close on click close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    // Close on clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
});
