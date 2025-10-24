// Function to transform vehicle data from DB to detail format
function transformVehicleDetail(vehicle) {
    const imageMap = {
        'md01': ['../../assets/images/vf301.webp', '../../assets/images/vf302.webp', '../../assets/images/vf303.webp', '../../assets/images/vf304.webp', '../../assets/images/vf305.webp', '../../assets/images/vf306.webp', '../../assets/images/vf307.webp', '../../assets/images/vf308.webp'],
        'md02': ['../../assets/images/vf6s001.webp', '../../assets/images/vf6s002.webp', '../../assets/images/vf6s003.webp', '../../assets/images/vf6s004.webp', '../../assets/images/vf6s005.webp', '../../assets/images/vf6s006.webp', '../../assets/images/vf6s007.webp', '../../assets/images/vf6s008.webp', '../../assets/images/vf6s009.webp', '../../assets/images/vf6s010.webp', '../../assets/images/vf6s011.webp', '../../assets/images/vf6s012.webp', '../../assets/images/vf6s013.webp', '../../assets/images/vf6s014.webp', '../../assets/images/vf6s015.webp', '../../assets/images/vf6s016.webp'],
        'md03': ['../../assets/images/vf6plus001.webp', '../../assets/images/vf6plus002.webp', '../../assets/images/vf6plus003.webp', '../../assets/images/vf6plus004.webp', '../../assets/images/vf6plus005.webp', '../../assets/images/vf6plus006.webp', '../../assets/images/vf6plus007.webp', '../../assets/images/vf6plus008.webp', '../../assets/images/vf6plus009.webp'],
        'md04': ['../../assets/images/vf7s001.webp', '../../assets/images/vf7s002.webp', '../../assets/images/vf7s003.webp', '../../assets/images/vf7s004.webp', '../../assets/images/vf7s005.webp', '../../assets/images/vf7s006.webp', '../../assets/images/vf7s007.webp'],
        'md05': ['../../assets/images/vf7plus001.webp', '../../assets/images/vf7plus002.webp', '../../assets/images/vf7plus003.webp', '../../assets/images/vf7plus004.webp', '../../assets/images/vf7plus005.webp', '../../assets/images/vf7plus006.webp', '../../assets/images/vf7plus007.webp', '../../assets/images/vf7plus007.webp'],
        'md06': ['../../assets/images/vf8eco01.webp', '../../assets/images/vf8eco02.webp', '../../assets/images/vf8eco03.webp', '../../assets/images/vf8eco04.webp', '../../assets/images/vf8eco05.webp', '../../assets/images/vf8eco06.webp', '../../assets/images/vf8eco07.webp', '../../assets/images/vf8eco08.webp'],
        'md07': ['../../assets/images/vf8plus01.webp', '../../assets/images/vf8plus02.webp', '../../assets/images/vf8plus03.webp', '../../assets/images/vf8plus04.webp', '../../assets/images/vf8plus05.webp', '../../assets/images/vf8plus06.webp', '../../assets/images/vf8plus07.webp', '../../assets/images/vf8plus08.webp'],
        'md08': ['../../assets/images/vf9-eco-09.webp', '../../assets/images/vf9eco02.webp', '../../assets/images/vf9eco03.webp', '../../assets/images/vf9eco04.webp', '../../assets/images/vf9eco05.webp', '../../assets/images/vf9eco06.webp', '../../assets/images/vf9eco07.webp', '../../assets/images/vf9eco08.webp'],
        'md09': ['../../assets/images/vf9-plus-10.webp', '../../assets/images/vf9plus02.webp', '../../assets/images/vf9plus03.webp', '../../assets/images/vf9plus04.webp', '../../assets/images/vf9plus05.webp', '../../assets/images/vf9plus06.webp', '../../assets/images/vf9plus07.webp', '../../assets/images/vf9plus08.webp', '../../assets/images/vf9plus09.webp'],
        'ms01': ['../../assets/images/vffeliz2025.jpg', '../../assets/images/vffeliz01.webp', '../../assets/images/vffeliz02.webp',],
        'ms02': ['../../assets/images/vento-s001.webp'],
        'ms03': ['../../assets/images/theon-s001.webp'],
        'ms04': ['../../assets/images/vero-x001.webp'],
        'ms05': ['../../assets/images/vento-neo001.webp']
    };

    const mainSpecs = [
        { icon: '../../assets/images/no_of_seat.svg', text: `${vehicle.seats} chỗ` },
        { icon: '../../assets/images/range_per_charge.svg', text: vehicle.range },
        ...(vehicle.vehicleType !== 'Xe Máy Điện' ? [
            { icon: '../../assets/images/transmission.svg', text: 'Số tự động' },
            { icon: '../../assets/images/airbag.svg', text: vehicle.features.find(f => f.includes('túi khí')) || '1 túi khí' },
            { icon: '../../assets/images/max_power.svg', text: vehicle.features.find(f => f.includes('HP')) || '43 HP' }
        ] : []),
        { icon: '../../assets/images/car_model.svg', text: vehicle.vehicleType },
        { icon: '../../assets/images/trunk_capacity.svg', text: vehicle.features.find(f => f.includes('Dung tích cốp')) || '285L' }
    ];

    return {
        title: vehicle.model,
        price: vehicle.rentalPricePerDay.toLocaleString('vi-VN'),
        hint: 'Miễn phí sạc tới 31/12/2027',
        images: imageMap[vehicle._id] || ['../../assets/images/default.webp'],
        depositPerDay: vehicle.depositPerDay,
        depositPerMonth: vehicle.depositPerMonth,
        mainSpecs: mainSpecs,
        otherSpecs: vehicle.features.filter(f => !mainSpecs.some(spec => spec.text.includes(f))).map(f => ({ icon: '../../assets/images/screen_entertainment.svg', text: f }))
    };
}

document.addEventListener("DOMContentLoaded", async function () {
  // --- BƯỚC 1: LẤY DATA VÀ BƠM VÀO TRANG ---

  // Lấy ID xe từ URL (ví dụ: .../car-detail.html?id=vf3)
  const urlParams = new URLSearchParams(window.location.search);
  const carId = urlParams.get("id");

  if (!carId) {
    console.error('No car ID in URL');
    return;
  }

  // Fetch dữ liệu xe từ API
  try {
    const response = await fetch(`http://localhost:3000/api/vehicles/${carId}`);
    if (!response.ok) throw new Error('Vehicle not found');
    const vehicle = await response.json();

    // Transform data
    const carData = transformVehicleDetail(vehicle);

    // Bơm dữ liệu cơ bản
    document.title = carData.title; // Cập nhật tiêu đề trang
    document.getElementById("car-title-placeholder").textContent =
      carData.title;
    document.getElementById("car-price-placeholder").textContent =
      carData.price;
    document.getElementById("car-hint-placeholder").textContent = carData.hint;

    const mainGalleryImg = document.getElementById("main-gallery-img");
    mainGalleryImg.src = carData.images[0]; // Ảnh chính đầu tiên
    mainGalleryImg.alt = carData.title;

    // Bơm dữ liệu lặp (danh sách)
    const thumbsContainer = document.getElementById("gallery-thumbs-container");
    const mainSpecsContainer = document.getElementById(
      "main-feature-container"
    );
    const otherSpecsContainer = document.getElementById(
      "another-feature-container"
    );

    // 1. Tạo list ảnh thumbnails
    thumbsContainer.innerHTML = ""; // Xóa trắng
    carData.images.forEach((imgSrc, index) => {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = `thumb${index + 1}`;
      img.className = "thumb";
      thumbsContainer.appendChild(img);
    });

    // 2. Tạo list thông số chính
    mainSpecsContainer.innerHTML = ""; // Xóa trắng
    carData.mainSpecs.forEach((spec) => {
      mainSpecsContainer.innerHTML += `
                <div class="item">
                    <div class="icon"><img src="${spec.icon}" alt="${spec.text}"></div>
                    <div class="content">${spec.text}</div>
                </div>
      `;
    });

    // 3. Tạo list thông số khác
    otherSpecsContainer.innerHTML = ""; // Xóa trắng
    carData.otherSpecs.forEach((spec) => {
      otherSpecsContainer.innerHTML += `
                <div class="item">
                    <div class="icon"><img src="${spec.icon}" alt="${spec.text}"></div>
                    <div class="content">${spec.text}</div>
                </div>
      `;
    });

    // Add event listener for book button
    const bookButton = document.getElementById("btnBookCar");
    bookButton.addEventListener("click", () => {
      const modalIframe = document.getElementById("rental-modal-iframe");
      modalIframe.style.display = "block";
      setTimeout(() => {
        modalIframe.contentWindow.postMessage(
          {
            type: "loadCarData",
            data: carData,
          },
          "*"
        );
      }, 100);
    });

  } catch (error) {
    console.error('Error loading vehicle:', error);
    document.querySelector(".main").innerHTML =
      '<h1 style="margin-left: 152px;">Lỗi: Không tìm thấy thông tin xe.</h1>';
    return;
  }

  // --- BƯỚC 2: CHẠY CODE GALLERY GỐC CỦA BẠN ---
  // (Code này phải chạy SAU KHI đã tạo thumb ở trên)

  const mainImg = document.querySelector(".gallery-main .gallery-img");
  const thumbs = Array.from(
    document.querySelectorAll(".gallery-thumbs .thumb")
  );
  const btnPrev = document.querySelector(".embla__button--prev");
  const btnNext = document.querySelector(".embla__button--next");
  const thumbsContainer = document.querySelector(".gallery-thumbs"); // Đã có ở trên nhưng khai báo lại cho rõ

  let currentIndex = 0;

  function updateGallery(index) {
    if (index < 0 || index >= thumbs.length) return;
    currentIndex = index;
    mainImg.src = thumbs[index].src;
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("selected", i === index);
    });
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === thumbs.length - 1;
  }

  // --- Drag to scroll for thumbs with click/drag separation ---
  let isDown = false;
  let startX;
  let scrollLeft;
  let dragging = false;

  // --- Physics variables for inertia ---
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let momentumFrame;

  // Prevent default drag image behavior on thumbs
  thumbs.forEach((thumb) => {
    thumb.addEventListener("dragstart", (e) => e.preventDefault());
  });

  function stopMomentumScroll() {
    if (momentumFrame) {
      cancelAnimationFrame(momentumFrame);
      momentumFrame = null;
    }
    velocity = 0;
  }

  function momentumScroll() {
    if (Math.abs(velocity) < 0.03) return;
    thumbsContainer.scrollLeft -= velocity;
    velocity *= 0.965;
    momentumFrame = requestAnimationFrame(momentumScroll);
  }

  thumbsContainer.addEventListener("mousedown", (e) => {
    stopMomentumScroll();
    isDown = true;
    dragging = false;
    thumbsContainer.classList.add("dragging");
    startX = e.pageX - thumbsContainer.offsetLeft;
    scrollLeft = thumbsContainer.scrollLeft;
    lastX = e.pageX;
    lastTime = Date.now();
    velocity = 0;
  });

  thumbsContainer.addEventListener("mouseleave", () => {
    isDown = false;
    dragging = false;
    thumbsContainer.classList.remove("dragging");
    stopMomentumScroll();
  });

  thumbsContainer.addEventListener("mouseup", (e) => {
    isDown = false;
    thumbsContainer.classList.remove("dragging");
    const now = Date.now();
    const dx = e.pageX - lastX;
    const dt = now - lastTime;
    velocity = (dx / (dt || 1)) * 18;
    momentumScroll();
    setTimeout(() => {
      dragging = false;
    }, 0);
  });

  thumbsContainer.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - thumbsContainer.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) dragging = true;
    thumbsContainer.scrollLeft = scrollLeft - walk;

    const now = Date.now();
    if (now - lastTime > 10) {
      velocity = ((e.pageX - lastX) / (now - lastTime)) * 10;
      lastX = e.pageX;
      lastTime = now;
    }
  });

  // Touch events
  thumbsContainer.addEventListener("touchstart", (e) => {
    stopMomentumScroll();
    isDown = true;
    dragging = false;
    thumbsContainer.classList.add("dragging");
    startX = e.touches[0].pageX - thumbsContainer.offsetLeft;
    scrollLeft = thumbsContainer.scrollLeft;
    lastX = e.touches[0].pageX;
    lastTime = Date.now();
    velocity = 0;
  });

  thumbsContainer.addEventListener("touchend", (e) => {
    isDown = false;
    thumbsContainer.classList.remove("dragging");
    const now = Date.now();
    const touch = (e.changedTouches && e.changedTouches[0]) || { pageX: lastX };
    const dx = touch.pageX - lastX;
    const dt = now - lastTime;
    velocity = (dx / (dt || 1)) * 18;
    momentumScroll();
    setTimeout(() => {
      dragging = false;
    }, 0);
  });

  thumbsContainer.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - thumbsContainer.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(walk) > 5) dragging = true;
    thumbsContainer.scrollLeft = scrollLeft - walk;

    const now = Date.now();
    if (now - lastTime > 10) {
      velocity = ((e.touches[0].pageX - lastX) / (now - lastTime)) * 10;
      lastX = e.touches[0].pageX;
      lastTime = now;
    }
  });

  // Click thumbnail: chỉ khi không kéo
  thumbs.forEach((thumb, idx) => {
    thumb.addEventListener("click", (e) => {
      if (dragging) {
        e.preventDefault();
        return;
      }
      updateGallery(idx);
    });
  });

  btnPrev.addEventListener("click", () => {
    if (currentIndex > 0) updateGallery(currentIndex - 1);
  });

  btnNext.addEventListener("click", () => {
    if (currentIndex < thumbs.length - 1) updateGallery(currentIndex + 1);
  });

  // ... (toàn bộ code gallery của bạn) ...

  // Khởi tạo trạng thái ban đầu
  updateGallery(0);
});
