document.addEventListener("DOMContentLoaded", function () {
  // --- TOÀN BỘ LOGIC POPUP ĐÃ BỊ XÓA KHỎI ĐÂY ---

  // Sự kiện mở login từ header (GIỮ LẠI)
  document.querySelectorAll("button").forEach((btn) => {
    if (btn.textContent.includes("Đăng nhập")) {
      btn.addEventListener("click", function (e) {
        // Nếu đang trong iframe, gửi yêu cầu mở modal lên parent
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: "openLoginModal" }, "*");
          e.preventDefault();
          return;
        }
        // Fallback nếu không ở trong iframe (tùy chọn)
        // openLoginPopup(); // Dòng này có thể bị xóa vì file này ko còn openLoginPopup
      });
    }
  });

  // --- TOÀN BỘ CÁC SỰ KIỆN CLICK VÀ KEYDOWN KHÁC CỦA POPUP ĐÃ BỊ XÓA ---

  // Mobile menu toggle functionality (GIỮ LẠI)
  const mobileMenuButton = document.querySelector(".xls\\:hidden .lucide-menu");
  const mobileMenuContainer = document.querySelector(".xls\\:hidden");
  const mobileMenuClose = document.querySelector(".xls\\:hidden .lucide-x");

  if (mobileMenuButton && mobileMenuContainer) {
    mobileMenuButton.addEventListener("click", function () {
      mobileMenuContainer.classList.add("menu-active");
    });
  }

  if (mobileMenuClose && mobileMenuContainer) {
    mobileMenuClose.addEventListener("click", function () {
      mobileMenuContainer.classList.remove("menu-active");
    });
  }

  // Close mobile menu when clicking outside (GIỮ LẠI)
  document.addEventListener("click", function (e) {
    if (
      mobileMenuContainer &&
      mobileMenuContainer.classList.contains("menu-active")
    ) {
      const menuDropdown = mobileMenuContainer.querySelector(".fixed");
      if (
        menuDropdown &&
        !menuDropdown.contains(e.target) &&
        !mobileMenuButton.contains(e.target)
      ) {
        mobileMenuContainer.classList.remove("menu-active");
      }
    }
  });

  // Close mobile menu on escape key (GIỮ LẠI)
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      mobileMenuContainer &&
      mobileMenuContainer.classList.contains("menu-active")
    ) {
      mobileMenuContainer.classList.remove("menu-active");
    }
  });
});
