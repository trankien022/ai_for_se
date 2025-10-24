document.addEventListener("DOMContentLoaded", function () {
  // Listen for login success
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "loginSuccess") {
      const userName = event.data.userName || "User";
      const loginSection = document.getElementById("login-section");
      if (loginSection) {
        loginSection.innerHTML = `
          <div class="relative inline-block text-left py-1 px-3">
            <button id="user-menu-button" class="items-center justify-center whitespace-nowrap text-[16px] font-[500] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-[#CECECD] px-[40px] py-[12px] flex bg-[#090806] rounded-full border-[#07F668] border-[1px] h-[48px] w-[155px] sm:w-[152px] max-w-[200px] hover:bg-[#07F668]">
              <div class="flex items-center gap-x-2 px-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round text-white">
                  <circle cx="12" cy="8" r="5"></circle>
                  <path d="M20 21a8 8 0 0 0-16 0"></path>
                </svg>
                <span class="font-[60px] text-[16px] text-[#FFF] truncate max-w-[90px]" title="${userName}">${userName}</span>
              </div>
            </button>
            <div id="user-dropdown" class="z-50 origin-top-right absolute right-0 mt-2 min-w-[250px] shadow-lg bg-white ring-1 ring-black ring-opacity-5 border-1 border-[#E6E6E6] rounded-[8px] hidden">
              <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <a class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 btn w-full" role="menuitem" href="#" style="text-align: left;">
                  <div class="flex items-center">
                    <img src="/images/icons/list-order.png" class="w-6 h-6 mr-2">
                    <span class="text-[16px]">Đơn hàng của tôi</span>
                  </div>
                </a>
                <a class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 btn w-full" role="menuitem" href="#" style="text-align: left;">
                  <div class="flex items-center">
                    <img src="/images/icons/account.png" class="w-6 h-6 mr-2">
                    <span class="text-[16px]">Tài khoản</span>
                  </div>
                </a>
                <a id="logout-button" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 btn w-full" role="menuitem" style="text-align: left;">
                  <div class="flex items-center">
                    <img src="/images/icons/log-out.png" class="w-6 h-6 mr-2">
                    <span class="text-[16px]">Đăng xuất</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        `;

        // Add event for dropdown toggle
        const userMenuButton = document.getElementById("user-menu-button");
        const userDropdown = document.getElementById("user-dropdown");
        if (userMenuButton && userDropdown) {
          userMenuButton.addEventListener("click", function () {
            userDropdown.classList.toggle("hidden");
          });
        }

        // Close dropdown when clicking outside
        document.addEventListener("click", function (e) {
          if (userMenuButton && userDropdown && !userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.add("hidden");
          }
        });

        // Add event for logout
        const logoutButton = document.getElementById("logout-button");
        if (logoutButton) {
          logoutButton.addEventListener("click", function () {
            // Reset to login button
            loginSection.innerHTML = `
              <button class="inline-flex items-center justify-center whitespace-nowrap text-[16px] font-[500] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-[#CECECD] h-[48px] py-[12px] rounded-full px-[16px] bg-[#FFF] hover:bg-[#07F668] hover:text-night text-[#000] w-[140px] sm:w-[152px] max-w-[182px]">
                <div class="login-btn-item flex items-center gap-x-2 px-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-round">
                    <circle cx="12" cy="8" r="5"></circle>
                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                  </svg>
                  <span>Đăng nhập</span>
                </div>
              </button>
            `;
            // Re-add click event for login button
            const newLoginBtn = loginSection.querySelector("button");
            if (newLoginBtn) {
              newLoginBtn.addEventListener("click", function (e) {
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: "openLoginModal" }, "*");
                  e.preventDefault();
                }
              });
            }
          });
        }
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
