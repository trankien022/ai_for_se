// API Configuration - Chỉ khai báo nếu chưa tồn tại
if (typeof window.API_CONFIG === 'undefined') {
  window.API_CONFIG = {
    BACKEND_URL: 'http://localhost:3000',
    // Hoặc sử dụng giá trị động dựa trên environment
    // BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000',
  };
  console.log('✅ API_CONFIG initialized:', window.API_CONFIG);
} else {
  console.log('ℹ️ API_CONFIG already exists, skipping initialization');
}
