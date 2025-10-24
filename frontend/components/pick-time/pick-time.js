// Biến toàn cục để lưu instance
let rentalFormInstance = null;
// Biến toàn cục cho lịch
let currentCalendarDate = new Date(); // Dùng cho state của calendar
let year1 = currentCalendarDate.getFullYear();
let month1 = currentCalendarDate.getMonth();
let year2 = month1 === 11 ? year1 + 1 : year1;
let month2 = (month1 + 1) % 12;

class RentalForm {
    constructor() {
        this.currentTab = 'day';
        this.monthDuration = 1;
        this.currentPickerType = null; // Loại picker đang mở ('pickup-date', 'return-date', etc.)
        this.currentDate = new Date(); // Ngày hiện tại thực tế
        
        // Ngày giờ đã chọn (lưu trữ dưới dạng đối tượng Date)
        this.selectedStartDate = null;
        this.selectedEndDate = null;
        this.selectedPickupTime = "10:00"; // Giờ mặc định
        this.selectedReturnTime = "10:00"; // Giờ mặc định

        this.init();
    }

    init() {
        this.initializeDates();
        this.setActiveTab('day'); // Đặt tab mặc định là 'day'
        this.bindEvents();
        renderCalendars(); // Render lịch lần đầu sau khi init xong
    }

    initializeDates() {
        // Set default pickup date to today
        this.selectedStartDate = new Date(this.currentDate);
        this.selectedStartDate.setHours(0, 0, 0, 0); // Chuẩn hóa về đầu ngày
        
        // Set default return date to tomorrow
        this.selectedEndDate = new Date(this.currentDate);
        this.selectedEndDate.setDate(this.selectedEndDate.getDate() + 1);
        this.selectedEndDate.setHours(0, 0, 0, 0); // Chuẩn hóa về đầu ngày
        
        // Update display spans
        document.getElementById('pickup-date').textContent = this.formatDate(this.selectedStartDate);
        document.getElementById('return-date').textContent = this.formatDate(this.selectedEndDate);
        
        // Set default times (lấy từ thuộc tính)
        document.getElementById('pickup-time').textContent = this.selectedPickupTime;
        document.getElementById('return-time').textContent = this.selectedReturnTime;
    }

    setActiveTab(tab) {
        if (this.currentTab === 'month') {
            this.monthDuration = parseInt(document.getElementById('duration-input').value) || 1;
        }

        this.currentTab = tab;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        const durationInput = document.querySelector('.duration-input');
        const durationInputField = document.getElementById('duration-input');
        
        if (tab === 'month') {
            durationInput.classList.remove('hidden');
            durationInput.classList.add('show');
            durationInputField.value = this.monthDuration;
            this.updateReturnDate(); // Cập nhật ngày trả theo tháng
        } else { // 'day' tab
            durationInput.classList.add('hidden');
            durationInput.classList.remove('show');
            // Cần cập nhật lại ngày trả nếu đang từ tháng -> ngày
             if (!this.selectedEndDate || this.selectedEndDate <= this.selectedStartDate) {
                this.selectedEndDate = getNextDay(this.selectedStartDate);
             }
             document.getElementById('return-date').textContent = this.formatDate(this.selectedEndDate);
             this.validateDateRange(); // Kiểm tra lại khoảng ngày
        }
        this.updateReturnControls(); // Cập nhật trạng thái disable/enable
        renderCalendars(); // Render lại lịch khi đổi tab
    }

    validateDateRange() {
        if (this.currentTab === 'day' && this.selectedStartDate && this.selectedEndDate) {
            // Tính lại số ngày thực tế
            const daysDiff = Math.ceil((this.selectedEndDate - this.selectedStartDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 0) { // Ngày trả <= ngày nhận -> Lỗi logic, đặt lại ngày trả
                 console.warn("Validation: Return date <= Pickup date. Resetting return date.");
                 this.selectedEndDate = getNextDay(this.selectedStartDate);
                 document.getElementById('return-date').textContent = this.formatDate(this.selectedEndDate);
                 renderCalendars(); // Update calendar display
            } else if (daysDiff > 30) {
                 // Limit to 30 days
                 const maxReturnDate = new Date(this.selectedStartDate);
                 maxReturnDate.setDate(maxReturnDate.getDate() + 30);
                 this.selectedEndDate = maxReturnDate;
                 document.getElementById('return-date').textContent = this.formatDate(this.selectedEndDate);
                 alert("Thuê ngày chỉ hỗ trợ tối đa 30 ngày.");
                 renderCalendars(); // Update calendar display
            }
        }
    }

    parseDate(dateStr) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            // Month is 0-indexed in JS Date
            const dt = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            if (!isNaN(dt.getTime())) { // Check if date is valid
                dt.setHours(0, 0, 0, 0); // Chuẩn hóa
                return dt;
            }
        }
        console.error("Could not parse date:", dateStr);
        return null;
    }


    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setActiveTab(e.target.dataset.tab));
        });

        // Date pickers
        document.querySelectorAll('.date-picker').forEach(picker => {
            picker.addEventListener('click', (e) => {
                 if (!e.currentTarget.classList.contains('disabled')) {
                     this.openDatePicker(e.currentTarget.dataset.picker);
                 }
            });
        });
        
         // Time pickers
        document.querySelectorAll('.time-picker').forEach(picker => {
            picker.addEventListener('click', (e) => {
                 if (!e.currentTarget.classList.contains('disabled')) {
                    this.openTimePicker(e.currentTarget.dataset.picker);
                 }
            });
        });


        // Lịch: đóng khi click ra ngoài modal
        document.getElementById('calendar-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeDatePicker();
        });
        
         // Lịch: nút chuyển tháng
         document.getElementById("prev-month-btn").addEventListener("click", () => this.changeMonth(-1));
         document.getElementById("next-month-btn").addEventListener("click", () => this.changeMonth(1));

         // Lịch: Click vào ngày (delegated) - Đảm bảo gán sau khi tbody tồn tại
         document.getElementById('calendar-body-1').addEventListener('click', handleDayClick);
         document.getElementById('calendar-body-2').addEventListener('click', handleDayClick);


        // Form submission
        document.getElementById('rental-booking-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Nút Hủy
        document.getElementById('cancel-pick-time').addEventListener('click', () => this.handleCancel());

        // Đóng khi click ra ngoài form
        document.getElementById('pick-time-wrapper').addEventListener('click', () => this.handleCancel());

        // Duration input
        document.getElementById('duration-input').addEventListener('input', (e) => {
            this.validateDurationInput(e.target);
            this.updateReturnDate();
        });
        document.getElementById('duration-input').addEventListener('keydown', (e) => {
             // Allow only numbers and control keys
            if (!((e.keyCode >= 48 && e.keyCode <= 57) || // 0-9
                  (e.keyCode >= 96 && e.keyCode <= 105) || // Numpad 0-9
                  [8, 9, 13, 27, 37, 39, 46].includes(e.keyCode) || // Backspace, Tab, Enter, Esc, Arrows, Delete
                  (e.ctrlKey === true && [65, 67, 86, 88].includes(e.keyCode)) // Ctrl+A/C/V/X
                 )) {
                e.preventDefault();
            }
        });
    }


    updateReturnControls() {
        const returnDatePicker = document.getElementById('return-date-picker');
        const returnTimePicker = document.getElementById('return-time-picker');
        const isDisabled = (this.currentTab === 'month');

        returnDatePicker.classList.toggle('disabled', isDisabled);
        returnTimePicker.classList.toggle('disabled', isDisabled);
    }

    openTimePicker(pickerType) {
        // --- GIẢ LẬP VÌ CHƯA CÓ UI ---
        const currentSpanId = pickerType.replace('-picker', '');
        const currentTime = document.getElementById(currentSpanId).textContent;
        // Lấy giờ phút hiện tại từ currentTime
        const [currentHour, currentMinute] = currentTime.split(':');

        const newTime = prompt(`Nhập giờ mới (HH:MM) cho ${pickerType}:`, currentTime);

        if (newTime && /^([01]\d|2[0-3]):([0-5]\d)$/.test(newTime)) { // Validate HH:MM format chặt hơn
             document.getElementById(currentSpanId).textContent = newTime;
             // Cập nhật giá trị nội bộ
             if (pickerType === 'pickup-time') {
                 this.selectedPickupTime = newTime;
             } else if (pickerType === 'return-time') {
                 this.selectedReturnTime = newTime;
             }
        } else if (newTime !== null) { // Chỉ báo lỗi nếu người dùng nhập gì đó và không hợp lệ
            alert("Định dạng giờ không hợp lệ. Vui lòng nhập HH:MM (ví dụ: 14:30).");
        }
    }


    openDatePicker(pickerType) {
        this.currentPickerType = pickerType; // Lưu lại loại picker đang mở
        document.getElementById('calendar-modal').classList.remove('hidden');
    }

    closeDatePicker() {
        document.getElementById('calendar-modal').classList.add('hidden');
        this.currentPickerType = null;
    }

    // --- Cập nhật ngày tháng cho lịch ---
    changeMonth(direction) {
        const now = new Date();
        now.setHours(0,0,0,0);
        const currentFirstMonth = new Date(year1, month1, 1);

        // Không cho lùi về trước tháng hiện tại
        if (direction === -1 && currentFirstMonth <= now) {
            console.log("Cannot go to previous month.");
            return;
        }

        month1 += direction;
        if (month1 < 0) {
            month1 = 11;
            year1--;
        } else if (month1 > 11) {
            month1 = 0;
            year1++;
        }

        // Tháng thứ 2 luôn đi theo tháng 1
        year2 = month1 === 11 ? year1 + 1 : year1;
        month2 = (month1 + 1) % 12;

        console.log("Changing month to:", year1, month1, "|", year2, month2);
        renderCalendars(); // Render lại cả hai lịch
    }


    updateReturnDate() {
        if (this.currentTab !== 'month' || !this.selectedStartDate) return;

        const duration = parseInt(document.getElementById('duration-input').value) || 1;
        let returnDate = new Date(this.selectedStartDate);
        
        // Add months correctly
        returnDate.setMonth(returnDate.getMonth() + duration);
        // Ensure day doesn't overflow (e.g., Jan 31 + 1 month -> Feb 28/29)
        // Check if the day changed after setting the month
        if (returnDate.getDate() < this.selectedStartDate.getDate()) {
            // If it did, it means the target month has fewer days.
            // Go back to the last day of the *previous* month.
             returnDate.setDate(0);
        }
        
        returnDate.setHours(0,0,0,0); // Chuẩn hóa

        this.selectedEndDate = returnDate;
        document.getElementById('return-date').textContent = this.formatDate(returnDate);
        renderCalendars(); // Cập nhật lịch
    }

    formatDate(date) {
        if (!date || isNaN(date.getTime())) return "Invalid Date"; // Check for invalid date
        try {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error("Error formatting date:", date, e);
            return "Error";
        }
    }


    validateDurationInput(input) {
        let value = parseInt(input.value);
        const max = parseInt(input.max) || 12; // Mặc định max 12 tháng
        const min = parseInt(input.min) || 1;   // Mặc định min 1 tháng

        // Allow empty input temporarily, but default to min on blur/submit if needed
        if (input.value === "") {
             if (this.currentTab === 'month') this.monthDuration = min; // Default if empty
             return;
        }

        if (isNaN(value)) {
             value = min; // Default if not a number
        } else if (value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }
        
        // Update input visually only if value had to be corrected or was NaN
        if (parseInt(input.value) !== value || isNaN(parseInt(input.value)) ) {
            input.value = value;
        }

        if (this.currentTab === 'month') {
            this.monthDuration = value;
        }
    }


    // Gửi lệnh đóng
    handleCancel() {
        window.parent.postMessage({ type: 'closePickTime' }, '*');
    }

    // Gửi dữ liệu về parent
    handleSubmit() {
         // Final validation before submit
         this.validateDurationInput(document.getElementById('duration-input')); // Ensure duration is valid

        const formData = {
            rentalType: this.currentTab,
            pickupDate: this.formatDate(this.selectedStartDate),
            pickupTime: this.selectedPickupTime,
            returnDate: this.formatDate(this.selectedEndDate),
            returnTime: this.selectedReturnTime
        };

        if (this.currentTab === 'month') {
            formData.duration = this.monthDuration; // Use validated duration
        }
        
        // Check if dates are valid before sending
        if(formData.pickupDate === "Invalid Date" || formData.returnDate === "Invalid Date") {
             alert("Ngày chọn không hợp lệ. Vui lòng kiểm tra lại.");
             return;
        }


        console.log("Submitting data:", formData);
        window.parent.postMessage({
            type: 'updateRentalTime',
            data: formData
        }, '*');
    }
}

// --- CODE LỊCH (BẮT ĐẦU TỪ ĐÂY) ---

const MONTHS = [
    "Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"
];

function getDaysInMonth(year, month) {
    // Month is 0-indexed
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
    // Month is 0-indexed
    let day = new Date(year, month, 1).getDay();
    return (day === 0) ? 6 : day - 1; // 0 = Monday, 6 = Sunday
}

// Hàm render lịch chính (Cập nhật để highlight range)
function renderCalendar(year, month, tbodyId, captionId) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const tbody = document.getElementById(tbodyId);
    const caption = document.getElementById(captionId);

    // Validate elements exist
    if (!tbody || !caption) {
        console.error("Calendar elements not found:", tbodyId, captionId);
        return;
    }

    caption.textContent = `${MONTHS[month]} ${year}`;
    tbody.innerHTML = ""; // Clear previous content

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lấy ngày bắt đầu và kết thúc từ instance, đảm bảo chúng là Date hợp lệ
    const startDate = (rentalFormInstance && rentalFormInstance.selectedStartDate instanceof Date)
                       ? rentalFormInstance.selectedStartDate : null;
    const endDate = (rentalFormInstance && rentalFormInstance.selectedEndDate instanceof Date)
                     ? rentalFormInstance.selectedEndDate : null;

    console.log(`Rendering Calendar ${captionId}:`, { year, month, startDate, endDate });


    let day = 1;
    for (let row = 0; row < 6; row++) {
        const tr = document.createElement("tr");
        tr.className = "flex w-full mt-2 justify-center";
        for (let col = 0; col < 7; col++) {
            const td = document.createElement("td");
            // Base TD styling, specific range styles will be added if needed
            td.className = "size-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20";
            td.setAttribute("role", "presentation");

            if ((row === 0 && col < firstDay) || day > daysInMonth) {
                td.innerHTML = '<div role="gridcell" class="size-10"></div>'; // Empty cell, ensure size
            } else {
                const currentDate = new Date(year, month, day);
                currentDate.setHours(0, 0, 0, 0);
                const isPast = currentDate < today;

                const btn = document.createElement("button");
                btn.name = "day";
                btn.type = "button";
                btn.setAttribute("role", "gridcell");
                 // Store date info for click handler
                 const localDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                 btn.dataset.date = localDateStr; // YYYY-MM-DD local
                btn.tabIndex = -1;
                let btnClasses = [
                    "rdp-button_reset", "rdp-button",
                    "inline-flex", "items-center", "justify-center",
                    "text-center", "font-[Mulish]", "text-[14px]", "leading-[21px]",
                    "transition-colors", "focus-visible:outline-none", "focus-visible:ring-1", "focus-visible:ring-ring",
                    "size-10", "p-0", "font-normal", "rounded-[6px]" // Default full rounding
                ];

                if (isPast) {
                    btnClasses.push("disabled:pointer-events-none", "disabled:opacity-50", "text-gray-400", "cursor-not-allowed");
                    btn.disabled = true;
                } else {
                     // Add hover state only for non-past, non-selected dates
                     btnClasses.push("hover:bg-[#E0F5E0]", "hover:text-[#374151]", "text-[#020617]"); // Lighter green hover
                }

                btn.textContent = day;

                // --- Range Highlighting Logic ---
                let isRangeStart = false;
                let isRangeEnd = false;
                let isInRange = false;
                let isSingleDaySelection = false; // Add this flag

                // Check only if startDate and endDate are valid Date objects
                if (startDate && endDate) {
                     // Handle single day selection (start and end are the same)
                     if (startDate.getTime() === endDate.getTime() && currentDate.getTime() === startDate.getTime()) {
                         isSingleDaySelection = true;
                     } else {
                          if (currentDate.getTime() === startDate.getTime()) {
                               isRangeStart = true;
                          }
                          if (currentDate.getTime() === endDate.getTime()) {
                               isRangeEnd = true;
                          }
                          if (currentDate > startDate && currentDate < endDate) {
                               isInRange = true;
                          }
                     }
                } else if (startDate && !endDate) { // Only start date selected
                     if (currentDate.getTime() === startDate.getTime()) {
                          isRangeStart = true; // Still mark the start date
                     }
                }


                // --- Apply Classes ---
                let tdBgClass = ""; // For TD background continuity

                if (isSingleDaySelection || (isRangeStart && isRangeEnd)) { // Start and end are the same day
                    btnClasses = btnClasses.filter(c => !c.startsWith("hover:")); // Remove hover effect
                    btnClasses.push("bg-[#00d287]", "text-[#f8fafc]", "hover:!bg-[#00a86b]", "hover:!text-white"); // Selected style
                    btn.setAttribute("aria-selected", "true");
                    // TD gets standard selected background
                    tdBgClass = "bg-bg-datepicker";

                } else if (isRangeStart) {
                    btnClasses = btnClasses.filter(c => !c.startsWith("hover:") && c !== "rounded-[6px]"); // Remove hover & full rounding
                    btnClasses.push("bg-[#00d287]", "text-[#f8fafc]", "hover:!bg-[#00a86b]", "hover:!text-white", "rounded-l-[6px]", "rounded-r-none"); // Start style
                    btn.setAttribute("aria-selected", "true");
                    tdBgClass = "bg-bg-datepicker rounded-l-md"; // TD background starts here

                } else if (isRangeEnd) {
                     btnClasses = btnClasses.filter(c => !c.startsWith("hover:") && c !== "rounded-[6px]");
                     btnClasses.push("bg-[#00d287]", "text-[#f8fafc]", "hover:!bg-[#00a86b]", "hover:!text-white", "rounded-r-[6px]", "rounded-l-none"); // End style
                     btn.setAttribute("aria-selected", "true");
                     tdBgClass = "bg-bg-datepicker rounded-r-md"; // TD background ends here

                } else if (isInRange) {
                    btnClasses = btnClasses.filter(c => !c.startsWith("hover:") && c !== "rounded-[6px]"); // Remove hover & rounding
                    btnClasses.push("bg-[#E0F5E0]", "text-[#1f2937]"); // In-range style (no rounding needed on button)
                    btn.setAttribute("aria-selected", "true"); // Still selected
                    tdBgClass = "bg-bg-datepicker"; // TD gets background only
                }
                // Else (normal day): No additional classes needed beyond base + hover/disabled


                btn.className = btnClasses.join(" ");
                // Apply background class to TD if needed AFTER button classes are set
                if (tdBgClass) {
                   td.classList.add(...tdBgClass.split(" "));
                }

                td.appendChild(btn);
                day++;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
        if (day > daysInMonth) break; // Stop if days exceed month length
    }
}


// Function to render both calendars
function renderCalendars() {
     // Ensure instance is ready before rendering
     if (!rentalFormInstance) return;
    renderCalendar(year1, month1, "calendar-body-1", "month-caption-1");
    renderCalendar(year2, month2, "calendar-body-2", "month-caption-2");
}

// Function called when a date button is clicked (Refined)
function handleDateSelection(date) {
    // Ensure instance exists and we are in 'day' tab
    if (!rentalFormInstance || rentalFormInstance.currentTab !== 'day') {
        console.error("Cannot select date: Not in 'day' tab or instance not ready.");
        return;
    }

    const pickerType = rentalFormInstance.currentPickerType;
    console.log("handleDateSelection - pickerType:", pickerType, "Selected Date:", date.toLocaleDateString());
    console.log("Current Start:", rentalFormInstance.selectedStartDate?.toLocaleDateString(), "Current End:", rentalFormInstance.selectedEndDate?.toLocaleDateString());


    if (pickerType === 'pickup-date') {
        // --- Selecting Pickup Date ---
        rentalFormInstance.selectedStartDate = date;
        document.getElementById('pickup-date').textContent = rentalFormInstance.formatDate(date);

        // Auto-update return date ONLY if it's now invalid (same day or before)
        if (!rentalFormInstance.selectedEndDate || rentalFormInstance.selectedEndDate <= date) {
            const newReturnDate = getNextDay(date); // Get day after new start date
            rentalFormInstance.selectedEndDate = newReturnDate;
            document.getElementById('return-date').textContent = rentalFormInstance.formatDate(newReturnDate);
            console.log("Auto-updated return date to:", newReturnDate.toLocaleDateString());
        }

    } else if (pickerType === 'return-date') {
        // --- Selecting Return Date ---
        // Ensure return date is strictly after pickup date
        if (!rentalFormInstance.selectedStartDate) {
             console.error("Cannot select return date before pickup date.");
             // Optionally select start date first? Or just do nothing.
             // For now, reset start date to today if not selected
             rentalFormInstance.initializeDates(); // Reset both dates
             alert("Vui lòng chọn ngày nhận trước.");
             rentalFormInstance.currentPickerType = 'pickup-date'; // Switch picker
             renderCalendars();
             return; // Don't close calendar yet
        }
        else if (date <= rentalFormInstance.selectedStartDate) {
            alert("Ngày trả phải sau ngày nhận.");
            console.warn("Invalid return date selected:", date.toLocaleDateString());
            return; // Do not update, do not close calendar
        }
        rentalFormInstance.selectedEndDate = date;
        document.getElementById('return-date').textContent = rentalFormInstance.formatDate(date);

    } else {
        console.error("Unknown pickerType:", pickerType);
        // If no picker type is set (e.g., first click), assume pickup
        if(!pickerType && rentalFormInstance.currentTab === 'day') {
             console.log("No picker type set, assuming pickup-date");
             rentalFormInstance.selectedStartDate = date;
             document.getElementById('pickup-date').textContent = rentalFormInstance.formatDate(date);
             // Also reset end date if needed
            if (!rentalFormInstance.selectedEndDate || rentalFormInstance.selectedEndDate <= date) {
                const newReturnDate = getNextDay(date);
                rentalFormInstance.selectedEndDate = newReturnDate;
                document.getElementById('return-date').textContent = rentalFormInstance.formatDate(newReturnDate);
            }
             rentalFormInstance.currentPickerType = 'return-date'; // Prompt user to select end date next
             renderCalendars();
             return; // Don't close yet
        } else {
          return; // Don't proceed if picker type is unknown
        }
    }

    // Always validate the range after any change
    rentalFormInstance.validateDateRange(); // This might modify selectedEndDate again

    // Update calendar UI *after* all state changes
    console.log("Rendering calendars after selection. New Start:", rentalFormInstance.selectedStartDate?.toLocaleDateString(), "New End:", rentalFormInstance.selectedEndDate?.toLocaleDateString());
    renderCalendars();

    // Close calendar ONLY if a valid selection was made for the intended picker
    if (pickerType === 'pickup-date' || pickerType === 'return-date') {
        rentalFormInstance.closeDatePicker();
    } else if (!pickerType && rentalFormInstance.currentTab === 'day') {
        // Don't close if we just set pickup and are waiting for return
    } else {
         rentalFormInstance.closeDatePicker(); // Close otherwise
    }
}


// Add click event to calendar days (delegated to tbody)
function handleDayClick(e) {
     if (e.target && e.target.name === 'day' && !e.target.disabled) {
        const dateString = e.target.dataset.date; // Get YYYY-MM-DD
        if (dateString) {
            // Parse YYYY-MM-DD safely
            const parts = dateString.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // JS month is 0-indexed
            const day = parseInt(parts[2], 10);
            
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                let selectedDate = new Date(year, month, day);
                selectedDate.setHours(0,0,0,0); // Standardize
                
                // Check if date is valid after creation (e.g., Feb 30 invalid)
                 if (selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day) {
                      handleDateSelection(selectedDate);
                 } else {
                      console.error("Invalid date created from button data:", dateString);
                 }
            } else {
                 console.error("Could not parse date from button data:", dateString);
            }
        } else {
             console.error("Button clicked has no date data:", e.target);
        }
    }
}

// Helper function to get the next day
function getNextDay(date) {
    if(!date || isNaN(date.getTime())) return null; // Check if date is valid
    let next = new Date(date);
    next.setDate(date.getDate() + 1);
    next.setHours(0,0,0,0);
    return next;
}


// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if instance already exists (e.g., due to HMR)
    if (!rentalFormInstance) {
        rentalFormInstance = new RentalForm();
    } else {
        // Optional: Re-initialize or just re-render if needed
        rentalFormInstance.init(); // Re-run init to bind events and set defaults
    }
});