// Function to attach profile button listener (GLOBAL SCOPE)
function attachProfileButtonListener() {
  const profileBtn = document.getElementById("profile-btn");
  if (profileBtn) {
    profileBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Profile button clicked! Opening profile page...");
      
      // Redirect to profile page (đơn giản hơn là dùng modal)
      window.top.location.href = "/frontend/components/home/profile.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Khôi phục trạng thái đăng nhập nếu có
  checkAndRestoreLoginState();
  
  // Listen for login success
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "loginSuccess") {
      const userName = event.data.userName || "User";
      const loginSection = document.getElementById("login-section");
      if (loginSection) {
        loginSection.innerHTML = `
          <div class="relative inline-block text-left py-1 px-3">
            <button id="profile-btn" class="items-center justify-center whitespace-nowrap text-[16px] font-[500] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-[#CECECD] px-[40px] py-[12px] flex bg-[#090806] rounded-full border-[#07F668] border-[1px] h-[48px] w-[155px] sm:w-[152px] max-w-[200px] hover:bg-[#07F668]">
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
        
        // Thêm event listener cho profile button
        attachProfileButtonListener();
      }
    } else if (event.data && event.data.type === "logout") {
      // Xử lý đăng xuất - reset về trạng thái ban đầu
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
                <span class="font-[60px] text-[16px] text-[#FFF]">Đăng nhập</span>
              </div>
            </button>
          </div>
        `;
        
        // Gắn lại event listener cho nút đăng nhập
        document.querySelectorAll("button").forEach((btn) => {
          if (btn.textContent.includes("Đăng nhập")) {
            btn.addEventListener("click", function (e) {
              e.preventDefault();
              if (window.parent && window.parent !== window) {
                window.parent.postMessage({ type: "openLoginModal" }, "*");
              }
            });
          }
        });
      }
    }
  });

  // Sự kiện mở login từ header
  document.querySelectorAll("button").forEach((btn) => {
    if (btn.textContent.includes("Đăng nhập")) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Login button clicked!");
        // Nếu đang trong iframe, gửi yêu cầu mở modal lên parent
        if (window.parent && window.parent !== window) {
          console.log("Sending openLoginModal message to parent");
          window.parent.postMessage({ type: "openLoginModal" }, "*");
          return;
        }
      });
    }
  });

  // Mobile menu toggle functionality
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

  // Close mobile menu when clicking outside
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

  // Close mobile menu on escape key
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

// Kiểm tra và khôi phục trạng thái đăng nhập từ localStorage
function checkAndRestoreLoginState() {
  const token = localStorage.getItem('authToken');
  const userDataStr = localStorage.getItem('userData');
  const loginTimestamp = localStorage.getItem('loginTimestamp');
  
  if (!token || !userDataStr || !loginTimestamp) {
    console.log('Header: Không có phiên đăng nhập');
    return;
  }
  
  // Kiểm tra phiên có hết hạn chưa (30 phút)
  const SESSION_DURATION = 30 * 60 * 1000;
  const currentTime = Date.now();
  const loginTime = parseInt(loginTimestamp);
  const elapsedTime = currentTime - loginTime;
  
  if (elapsedTime >= SESSION_DURATION) {
    console.log('Header: Phiên đã hết hạn, xóa dữ liệu');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('loginTimestamp');
    return;
  }
  
  // Phiên còn hiệu lực, khôi phục UI
  try {
    const userData = JSON.parse(userDataStr);
    const userName = userData.name || userData.email || 'User';
    const loginSection = document.getElementById("login-section");
    
    if (loginSection) {
      loginSection.innerHTML = `
        <div class="relative inline-block text-left py-1 px-3">
          <button id="profile-btn" class="items-center justify-center whitespace-nowrap text-[16px] font-[500] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:bg-[#CECECD] px-[40px] py-[12px] flex bg-[#090806] rounded-full border-[#07F668] border-[1px] h-[48px] w-[155px] sm:w-[152px] max-w-[200px] hover:bg-[#07F668]">
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
      
      // Gắn event listener cho profile button
      attachProfileButtonListener();
      
      console.log(`Header: Đã khôi phục trạng thái đăng nhập cho ${userName}`);
    }
  } catch (error) {
    console.error('Header: Lỗi khôi phục trạng thái:', error);
  }
}
