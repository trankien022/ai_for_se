document.addEventListener("DOMContentLoaded", function () {
  // Listen for login success
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "loginSuccess") {
      const userName = event.data.userName || "User";
      const loginSection = document.getElementById("login-section");
      if (loginSection) {
        loginSection.innerHTML = `
          <div class="relative inline-block text-left py-1 px-3">
            <button class="items-center justify-center whitespace-nowrap text-[16px] font-[500] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-[#CECECD] px-[40px] py-[12px] flex bg-[#090806] rounded-full border-[#07F668] border-[1px] h-[48px] w-[155px] sm:w-[152px] max-w-[200px] hover:bg-[#07F668]">
              <div class="flex items-center gap-x-2 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round text-white">
                  <circle cx="12" cy="8" r="5"></circle>
                  <path d="M20 21a8 8 0 0 0-16 0"></path>
                </svg>
                <span class="font-[60px] text-[16px] text-[#FFF] truncate max-w-[90px]" title="${userName}">${userName}</span>
              </div>
            </button>
          </div>
        `;
      }
    }
  });

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
