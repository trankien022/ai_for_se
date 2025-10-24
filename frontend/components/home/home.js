// Cars data array for dynamic generation
const carsData = [
  {
    id: "vf3",
    name: "VinFast VF 3",
    img: "/frontend/assets/images/vf3_mb.webp",
    type: "Minicar",
    seats: "4 chỗ",
    range: "210km (NEDC)",
    trunk: "Dung tích cốp 285L",
  },
  {
    id: "vf6",
    name: "VinFast VF 6",
    img: "/frontend/assets/images/vf6_mb.webp",
    type: "B-SUV",
    seats: "5 chỗ",
    range: "~480km (NEDC)",
    trunk: "Dung tích cốp 423L",
  },
  {
    id: "vf7",
    name: "VinFast VF 7",
    img: "/frontend/assets/images/vf7_mb.webp",
    type: "C-SUV",
    seats: "5 chỗ",
    range: "~498km (NEDC)",
    trunk: "Dung tích cốp 537L",
  },
  {
    id: "vf8",
    name: "VinFast VF 8",
    img: "/frontend/assets/images/vf8.webp",
    type: "D-SUV",
    seats: "5 chỗ",
    range: "~562km (NEDC)",
    trunk: "Dung tích cốp 350L",
  },
  {
    id: "vf9",
    name: "VinFast VF 9",
    img: "/frontend/assets/images/vf9_mb.webp",
    type: "E-SUV",
    seats: "6-7 chỗ",
    range: "~626km (WLTP)",
    trunk: "Dung tích cốp 212L",
  },
];

// Function to generate slides dynamically
function generateSlides(data, carouselId, prefix) {
  const carousel = document.getElementById(carouselId);
  const iconType = prefix === "cars" ? "car" : "motorcycle";
  data.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = `${prefix}-slide`;
    slide.setAttribute(`data-${prefix.slice(0, -1)}`, item.id);
    slide.innerHTML = `
            <a class="${prefix}-card-link" href="/rental/rental.jsp">
                <div class="${prefix}-card">
                    <div class="${prefix}-badge">
                        <img alt="" loading="lazy" width="17px" height="16px" src="/frontend/assets/images/battery_dk.svg">
                        <p class="${prefix}-badge-text">Miễn phí sạc</p>
                    </div>
                    <p class="${prefix}-name">${item.name}</p>
                    <img alt="${item.name}" loading="lazy" class="${prefix}-img" src="${item.img}">
                    <div class="${prefix}-specs">
                        <div class="${prefix}-spec-group1">
                            <div class="${prefix}-spec-item">
                                <img alt="" loading="lazy" width="20px" height="20px" src="/frontend/assets/images/${iconType}_dk.svg">
                                <p class="${prefix}-spec-text">${item.type}</p>
                            </div>
                            <div class="${prefix}-spec-item">
                                <img alt="" loading="lazy" width="20px" height="20px" src="/frontend/assets/images/2user_dk.svg">
                                <p class="${prefix}-spec-text">${item.seats}</p>
                            </div>
                        </div>
                        <div class="${prefix}-spec-group2">
                            <div class="${prefix}-spec-item">
                                <img alt="" loading="lazy" width="20px" height="20px" src="/frontend/assets/images/battery_footer.svg">
                                <p class="${prefix}-spec-text">${item.range}</p>
                            </div>
                            <div class="${prefix}-spec-item">
                                <img alt="" loading="lazy" width="20px" height="20px" src="/frontend/assets/images/box_dk.svg">
                                <p class="${prefix}-spec-text">${item.trunk}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        `;
    carousel.appendChild(slide);
  });
}

// Cars Carousel functionality
class Carousel {
  constructor(prefix, arrangements) {
    this.prefix = prefix;
    this.arrangements = arrangements;
    this.carousel = document.querySelector(`.${this.prefix}-carousel`);
    this.slides = document.querySelectorAll(`.${this.prefix}-slide`);
    this.dots = document.querySelectorAll(`.${this.prefix}-dot`);
    this.activeDotClass = `${this.prefix}-dot--active`;
    this.cardLinkSelector = `.${this.prefix}-card-link`;
    this.currentIndex = 0;
    this.isDragging = false;
    this.wasDragging = false;
    this.startX = 0;
    this.currentX = 0;
    this.dragThreshold = 50;

    this.init();
  }

  init() {
    this.updateCarousel();
    this.addEventListeners();
  }

  addEventListeners() {
    // Mouse events
    this.carousel.addEventListener("mousedown", this.handleStart.bind(this));
    this.carousel.addEventListener("mousemove", this.handleMove.bind(this));
    this.carousel.addEventListener("mouseup", this.handleEnd.bind(this));
    this.carousel.addEventListener("mouseleave", this.handleEnd.bind(this));

    // Touch events
    this.carousel.addEventListener("touchstart", this.handleStart.bind(this));
    this.carousel.addEventListener("touchmove", this.handleMove.bind(this));
    this.carousel.addEventListener("touchend", this.handleEnd.bind(this));

    // Dot clicks
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        this.goToSlide(index);
      });
    });

    // Prevent card links from being clicked during drag
    const cardLinks = this.carousel.querySelectorAll(this.cardLinkSelector);
    cardLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (this.isDragging || this.wasDragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      });
    });

    // Prevent context menu on drag
    this.carousel.addEventListener("contextmenu", (e) => {
      if (this.isDragging) {
        e.preventDefault();
      }
    });
  }

  handleStart(e) {
    this.isDragging = true;
    this.wasDragging = false;
    this.startX = e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
    this.carousel.style.cursor = "grabbing";
    e.preventDefault();
  }

  handleMove(e) {
    if (!this.isDragging) return;

    this.currentX = e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
    const diffX = this.currentX - this.startX;

    // Mark as dragging if moved more than a few pixels
    if (Math.abs(diffX) > 5) {
      this.wasDragging = true;
    }

    // Visual feedback during drag
    this.carousel.style.transform = `translateX(${diffX * 0.3}px)`;
  }

  handleEnd(e) {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.carousel.style.cursor = "grab";
    this.carousel.style.transform = "";

    const diffX = this.currentX - this.startX;

    // Only change slide if user actually dragged
    if (this.wasDragging && Math.abs(diffX) > this.dragThreshold) {
      if (diffX > 0) {
        // Dragged right - go to previous
        this.previousSlide();
      } else {
        // Dragged left - go to next
        this.nextSlide();
      }
    }

    // Reset drag state after a short delay to prevent accidental clicks
    setTimeout(() => {
      this.wasDragging = false;
    }, 100);
  }

  updateCarousel() {
    const arrangement = this.arrangements[this.currentIndex];

    // Reset all slides
    this.slides.forEach((slide, index) => {
      slide.className = `${this.prefix}-slide`;

      if (index === arrangement.center) {
        slide.classList.add("center");
      } else if (index === arrangement.left) {
        slide.classList.add("left");
      } else if (index === arrangement.right) {
        slide.classList.add("right");
      } else {
        slide.classList.add("hidden");
      }
    });

    // Update dots
    this.dots.forEach((dot, index) => {
      dot.classList.toggle(this.activeDotClass, index === this.currentIndex);
    });
  }

  goToSlide(targetIndex) {
    if (targetIndex === this.currentIndex) return;

    // Calculate the shortest path (considering circular nature)
    const totalSlides = this.arrangements.length;
    const forward =
      (targetIndex - this.currentIndex + totalSlides) % totalSlides;
    const backward =
      (this.currentIndex - targetIndex + totalSlides) % totalSlides;

    // Choose the shorter path
    const useForward = forward <= backward;
    const steps = useForward ? forward : backward;

    // Animate through each step
    let currentStep = 0;
    const animateStep = () => {
      if (currentStep >= steps) return;

      if (useForward) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }

      currentStep++;
      if (currentStep < steps) {
        setTimeout(animateStep, 300); // 300ms delay between each step
      }
    };

    animateStep();
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.arrangements.length;
    this.updateCarousel();
  }

  previousSlide() {
    this.currentIndex =
      (this.currentIndex - 1 + this.arrangements.length) %
      this.arrangements.length;
    this.updateCarousel();
  }
}

// Common arrangements for carousels
const carouselArrangements = [
  { center: 0, left: 4, right: 1 },
  { center: 1, left: 0, right: 2 },
  { center: 2, left: 1, right: 3 },
  { center: 3, left: 2, right: 4 },
  { center: 4, left: 3, right: 0 },
];

// Motorcycles data array for dynamic generation
const motorcyclesData = [
  {
    id: "ventos",
    name: "VinFast Vento S",
    img: "/frontend/assets/images/ventos.webp",
    type: "Scooter",
    seats: "2 chỗ",
    range: "~160km (NEDC)",
    trunk: "Dung tích cốp 25L",
  },
  {
    id: "theons",
    name: "VinFast Theon S",
    img: "/frontend/assets/images/theons.png",
    type: "Sport",
    seats: "2 chỗ",
    range: "~150km (NEDC)",
    trunk: "Dung tích cốp 24L",
  },
  {
    id: "verox",
    name: "VinFast Vero X",
    img: "/frontend/assets/images/verox.png",
    type: "Scooter",
    seats: "2 chỗ",
    range: "~262km (NEDC)",
    trunk: "Dung tích cốp 35L",
  },
  {
    id: "ventoneo",
    name: "VinFast Vento Neo",
    img: "/frontend/assets/images/ventoneo.webp",
    type: "Scooter",
    seats: "2 chỗ",
    range: "~194km (NEDC)",
    trunk: "Dung tích cốp 27L",
  },
  {
    id: "feliz2025",
    name: "VinFast Feliz",
    img: "/frontend/assets/images/feliz2025.png",
    type: "Scooter",
    seats: "2 chỗ",
    range: "~262km (NEDC)",
    trunk: "Dung tích cốp 34L",
  },
];

// Initialize both carousels when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  generateSlides(carsData, "cars-carousel", "cars");
  generateSlides(motorcyclesData, "motorcycles-carousel", "motorcycles");
  new Carousel("cars", carouselArrangements);
  new Carousel("motorcycles", carouselArrangements);
});

// Message handlers
window.addEventListener("message", function (event) {
  if (event.data && event.data.type === "headerHeight") {
    var homeContent = document.querySelector(".font-svn-poppins");
    if (homeContent) {
      homeContent.style.paddingTop = event.data.height + "px";
      homeContent.style.visibility = "visible";
        homeContent.style.opacity = 1;
    }
  } else if (event.data && event.data.type === "openLoginModal") {
    var popup = document.getElementById("popup-login");
    var content = document.getElementById("popup-login-content");
    if (popup && content) {
      popup.classList.remove("hidden");
      fetch("../login/login.html")
        .then((res) => res.text())
        .then((html) => {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const loginBox = temp.querySelector(".flex.bg-white.shadow-md");
          content.innerHTML = "";
          if (loginBox) {
            content.appendChild(loginBox);
            initEyeToggle(loginBox);
          }
          setTimeout(() => {
            content.querySelectorAll("button").forEach((closeBtn) => {
              if (
                closeBtn.classList.contains("absolute") &&
                closeBtn.classList.contains("top-4") &&
                closeBtn.classList.contains("right-4")
              ) {
                closeBtn.onclick = function () {
                  popup.classList.add("hidden");
                };
              }
            });
          }, 0);
        });
    }
  } else if (event.data && event.data.type === "footerHeight") {
    var footerIframe = document.querySelector(".footer-iframe");
    if (footerIframe) {
      footerIframe.style.height = event.data.height + "px";
    }
  } else if (event.data && event.data.type === "openRegisterModal") {
    var popup = document.getElementById("popup-login");
    var content = document.getElementById("popup-login-content");
    if (popup && content) {
      popup.classList.remove("hidden");
      fetch("../register/register.html")
        .then((res) => res.text())
        .then((html) => {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const modalBox = temp.querySelector(".flex.bg-white.shadow-md");
          content.innerHTML = "";
          if (modalBox) {
            content.appendChild(modalBox);
            initEyeToggle(modalBox);
          }
          setTimeout(() => {
            content.querySelectorAll("button").forEach((closeBtn) => {
              if (
                closeBtn.classList.contains("absolute") &&
                closeBtn.classList.contains("top-4") &&
                closeBtn.classList.contains("right-4")
              ) {
                closeBtn.onclick = function () {
                  popup.classList.add("hidden");
                };
              }
            });
          }, 0);
        });
    }
  } else if (event.data && event.data.type === "openPasswordModal") {
    var popup = document.getElementById("popup-login");
    var content = document.getElementById("popup-login-content");
    if (popup && content) {
      popup.classList.remove("hidden");
      fetch("../password/password.html")
        .then((res) => res.text())
        .then((html) => {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const modalBox = temp.querySelector(".flex.bg-white.shadow-md");
          content.innerHTML = "";
          if (modalBox) {
            content.appendChild(modalBox);
          }
          setTimeout(() => {
            content.querySelectorAll("button").forEach((closeBtn) => {
              if (
                closeBtn.classList.contains("absolute") &&
                closeBtn.classList.contains("top-4") &&
                closeBtn.classList.contains("right-4")
              ) {
                closeBtn.onclick = function () {
                  popup.classList.add("hidden");
                };
              }
            });
          }, 0);
        });
    }
  } else if (event.data && event.data.type === "openOtpModal") {
    var popup = document.getElementById("popup-login");
    var content = document.getElementById("popup-login-content");
    if (popup && content) {
      popup.classList.remove("hidden");
      fetch("../password/otp/otp.html")
        .then((res) => res.text())
        .then((html) => {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const modalBox = temp.querySelector(".flex.bg-white.shadow-md");
          content.innerHTML = "";
          if (modalBox) {
            content.appendChild(modalBox);
          }
          setTimeout(() => {
            content.querySelectorAll("button").forEach((closeBtn) => {
              if (
                closeBtn.classList.contains("absolute") &&
                closeBtn.classList.contains("top-4") &&
                closeBtn.classList.contains("right-4")
              ) {
                closeBtn.onclick = function () {
                  popup.classList.add("hidden");
                };
              }
            });
          }, 0);
        });
    }
  } else if (event.data && event.data.type === "openChangeModal") {
    var popup = document.getElementById("popup-login");
    var content = document.getElementById("popup-login-content");
    if (popup && content) {
      popup.classList.remove("hidden");
      fetch("../password/otp/change-pass/change.html")
        .then((res) => res.text())
        .then((html) => {
          const temp = document.createElement("div");
          temp.innerHTML = html;
          const modalBox = temp.querySelector(".flex.bg-white.shadow-md");
          content.innerHTML = "";
          if (modalBox) {
            content.appendChild(modalBox);
            initEyeToggle(modalBox);
          }
          setTimeout(() => {
            content.querySelectorAll("button").forEach((closeBtn) => {
              if (
                closeBtn.classList.contains("absolute") &&
                closeBtn.classList.contains("top-4") &&
                closeBtn.classList.contains("right-4")
              ) {
                closeBtn.onclick = function () {
                  popup.classList.add("hidden");
                };
              }
            });
          }, 0);
        });
    }
  }
});

// Đóng modal login khi nhấn ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    var popup = document.getElementById("popup-login");
    if (popup) popup.classList.add("hidden");
  }
});

const eyeIcon =
  '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye" class="svg-inline--fa fa-eye text-zinc-400" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path></svg>';

const eyeSlashIcon =
  '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="eye-slash" class="svg-inline--fa fa-eye-slash text-zinc-400" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3-16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z"></path></svg>';

function initEyeToggle(context = document) {
  context.querySelectorAll(".btn-eye").forEach(function (btn) {
    btn.onclick = function () {
      const input = btn.parentElement.querySelector(
        'input[type="password"], input[type="text"]'
      );
      const svg = btn.querySelector("svg");
      if (input) {
        if (input.type === "password") {
          input.type = "text";
          svg.outerHTML = eyeIcon;
        } else {
          input.type = "password";
          svg.outerHTML = eyeSlashIcon;
        }
      }
    };
  });
}
