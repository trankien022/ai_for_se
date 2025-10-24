const MONTHS = [
    "Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
    "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"
];

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
    // Trả về 0: Thứ Hai, 6: Chủ Nhật (theo lịch VN)
    let day = new Date(year, month, 1).getDay();
    return (day === 0) ? 6 : day - 1;
}

function renderCalendar(year, month, tbodyId, captionId, selectedDates = []) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const tbody = document.getElementById(tbodyId);
    const caption = document.getElementById(captionId);

    caption.textContent = `${MONTHS[month]} ${year}`;

    tbody.innerHTML = "";

    let day = 1;
    for (let row = 0; row < 6; row++) {
        const tr = document.createElement("tr");
        tr.className = "flex w-full mt-2 justify-center";
        for (let col = 0; col < 7; col++) {
            const td = document.createElement("td");
            td.className = "size-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([aria-selected])]:bg-bg-datepicker first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20";
            td.setAttribute("role", "presentation");

            if (row === 0 && col < firstDay) {
                td.innerHTML = '<div role="gridcell"></div>';
            } else if (day > daysInMonth) {
                td.innerHTML = '<div role="gridcell"></div>';
            } else {
                const btn = document.createElement("button");
                btn.name = "day";
                btn.type = "button";
                btn.setAttribute("role", "gridcell");
                btn.tabIndex = -1;
                btn.className = [
                    "rdp-button_reset rdp-button",
                    "inline-flex items-center justify-center",
                    "rounded-[6px]",
                    "text-center",
                    "font-[Mulish] text-[14px] leading-[21px]",
                    "transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    "disabled:pointer-events-none disabled:opacity-50 size-10 p-0 font-normal aria-selected:opacity-100",
                    "hover:bg-[#D0F8CF] hover:text-[#374151]",
                    "text-[#020617]"
                ].join(" ");
                btn.textContent = day;

                // Kiểm tra ngày được chọn
                let selectedIdx = selectedDates.findIndex(d =>
                    d.getFullYear() === year && d.getMonth() === month && d.getDate() === day
                );
                if (selectedIdx !== -1) {
                    btn.setAttribute("aria-selected", "true");
                    btn.tabIndex = selectedIdx === 0 ? 0 : -1;
                    btn.className += selectedIdx === 0
                        ? " bg-[#00d287] text-[#f8fafc] day-range-start hover:!bg-brand-primary hover:!text-white rounded-l-[6px] rounded-r-none"
                        : " bg-[#00d287] text-[#f8fafc] day-range-end hover:!bg-brand-primary hover:!text-white rounded-r-[6px] rounded-l-none";
                }

                // Nếu ngày đã qua thì disabled
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                let btnDate = new Date(year, month, day);
                btnDate.setHours(0, 0, 0, 0);
                if (btnDate < today) {
                    btn.disabled = true;
                    btn.className += " opacity-50 cursor-not-allowed !leading-[21px]";
                }

                td.appendChild(btn);
                day++;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
        if (day > daysInMonth) break;
    }
}

function getNextDay(date) {
    let next = new Date(date);
    next.setDate(date.getDate() + 1);
    return next;
}

// Khởi tạo lịch với tháng hiện tại và tháng tiếp theo
let currentDate = new Date();
let year1 = currentDate.getFullYear();
let month1 = currentDate.getMonth();
let year2 = month1 === 11 ? year1 + 1 : year1;
let month2 = (month1 + 1) % 12;

function renderCalendars() {
    let selectedDates = [currentDate, getNextDay(currentDate)];
    renderCalendar(year1, month1, "calendar-body-1", "month-caption-1", selectedDates.filter(d => d.getMonth() === month1 && d.getFullYear() === year1));
    renderCalendar(year2, month2, "calendar-body-2", "month-caption-2", selectedDates.filter(d => d.getMonth() === month2 && d.getFullYear() === year2));
}

document.getElementById("prev-month-btn").addEventListener("click", function () {
    // Chỉ cho phép lùi tháng nếu tháng1/năm1 sau hoặc bằng tháng/năm hiện tại
    const now = new Date();
    if (year1 < now.getFullYear() || (year1 === now.getFullYear() && month1 <= now.getMonth())) {
        // Không cho lùi về trước tháng hiện tại
        return;
    }
    if (month1 === 0) {
        year1--;
        month1 = 11;
    } else {
        month1--;
    }
    if (month2 === 0) {
        year2--;
        month2 = 11;
    } else {
        month2--;
    }
    renderCalendars();
});

document.getElementById("next-month-btn").addEventListener("click", function () {
    if (month1 === 11) {
        year1++;
        month1 = 0;
    } else {
        month1++;
    }
    if (month2 === 11) {
        year2++;
        month2 = 0;
    } else {
        month2++;
    }
    renderCalendars();
});

function sendDateToParent(date, pickerType) {
    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    window.parent.postMessage({
        type: 'calendar-date-selected',
        date: dateStr,
        pickerType: pickerType
    }, '*');
    window.parent.postMessage({ type: 'calendar-close' }, '*');
}

// Listen for calendar-open message from parent
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'calendar-open') {
        window.currentPickerType = event.data.pickerType;
        // Optionally, set selected date in calendar UI
        // ...existing code...
    }
});

// Add click event to calendar days to send date to parent
document.addEventListener('click', function(e) {
    if (e.target && e.target.name === 'day' && !e.target.disabled) {
        const td = e.target.closest('td');
        if (td) {
            // Find year/month/day from context
            let table = td.closest('table');
            let captionId = table.getAttribute('aria-labelledby');
            let caption = document.getElementById(captionId);
            let [monthName, year] = caption.textContent.split(' ');
            let month = MONTHS.indexOf(monthName);
            let day = parseInt(e.target.textContent, 10);
            let date = new Date(parseInt(year), month, day);
            sendDateToParent(date, window.currentPickerType || 'pickup-date');
        }
    }
});

renderCalendars();
