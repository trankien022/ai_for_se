document.addEventListener('DOMContentLoaded', function() {
    const timeTrigger = document.getElementById('time-trigger');
    const timeDropdown = document.getElementById('time-dropdown');
    const selectedTimeSpan = document.getElementById('selected-time');
    const hoursColumn = document.getElementById('hours-column');
    const minutesColumn = document.getElementById('minutes-column');

    // Get current system time and set initial values
    function getInitialTime() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        let initialHour, initialMinute;
        
        // If current time is after 21:00 or before 7:00, set to 7:00
        if (currentHour > 21 || currentHour < 7) {
            initialHour = '07';
            initialMinute = '00';
        } else {
            // Round up to nearest available time slot
            initialHour = currentHour.toString().padStart(2, '0');
            
            if (currentHour === 21) {
                // For 21h, only 00 minutes allowed
                initialMinute = '00';
            } else {
                // Round up to next 5-minute interval
                const roundedMinute = Math.ceil(currentMinute / 5) * 5;
                if (roundedMinute >= 60) {
                    // If rounded minute >= 60, move to next hour
                    const nextHour = currentHour + 1;
                    if (nextHour > 21) {
                        // If next hour > 21, set to 7:00 next day
                        initialHour = '07';
                        initialMinute = '00';
                    } else {
                        initialHour = nextHour.toString().padStart(2, '0');
                        initialMinute = '00';
                    }
                } else {
                    initialMinute = roundedMinute.toString().padStart(2, '0');
                }
            }
        }
        
        return { hour: initialHour, minute: initialMinute };
    }

    const initialTime = getInitialTime();
    let selectedHour = initialTime.hour;
    let selectedMinute = initialTime.minute;
    
    // Scroll positions for each column
    let hoursScrollY = 25; // Initial transform value
    let minutesScrollY = 25; // Initial transform value
    
    const itemHeight = 50;
    const containerHeight = 300;
    const selectionZoneTop = (containerHeight / 2) - (itemHeight / 2);
    const selectionZoneBottom = (containerHeight / 2) + (itemHeight / 2);

    // Toggle dropdown visibility
    timeTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        const isHidden = timeDropdown.classList.contains('hidden');
        
        if (isHidden) {
            timeDropdown.classList.remove('hidden');
            timeTrigger.setAttribute('aria-expanded', 'true');
            timeTrigger.setAttribute('data-state', 'open');
        } else {
            timeDropdown.classList.add('hidden');
            timeTrigger.setAttribute('aria-expanded', 'false');
            timeTrigger.setAttribute('data-state', 'closed');
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!timeDropdown.contains(e.target) && !timeTrigger.contains(e.target)) {
            timeDropdown.classList.add('hidden');
            timeTrigger.setAttribute('aria-expanded', 'false');
            timeTrigger.setAttribute('data-state', 'closed');
        }
    });

    // Generate hours and minutes dynamically
    function generateTimeOptions() {
        // Generate hours (7-21)
        const hoursHTML = [];
        for (let hour = 7; hour <= 21; hour++) {
            const hourStr = hour.toString().padStart(2, '0');
            const isSelected = hourStr === selectedHour;
            const className = isSelected ? 'cursor-pointer text-brand-primary font-bold' : 'cursor-pointer text-heading-secondary';
            hoursHTML.push(`
                <div style="height: 50px; display: flex; justify-content: center; align-items: center;">
                    <div class="${className}">${hourStr}</div>
                </div>
            `);
        }
        hoursColumn.innerHTML = hoursHTML.join('');

        // Set initial scroll position for hours column
        const hourIndex = parseInt(selectedHour) - 7; // Get index (12 - 7 = 5)
        hoursScrollY = 25 - (hourIndex - 2) * itemHeight;
        hoursColumn.style.transform = `translate3d(0px, ${hoursScrollY}px, 0px)`;

        // Generate minutes based on selected hour
        generateMinutes();
    }

    function generateMinutes() {
        const minutesHTML = [];
        const maxMinute = selectedHour === '21' ? 0 : 55;
        
        for (let minute = 0; minute <= maxMinute; minute += 5) {
            const minuteStr = minute.toString().padStart(2, '0');
            const isSelected = minuteStr === selectedMinute;
            const className = isSelected ? 'cursor-pointer text-brand-primary font-bold' : 'cursor-pointer text-heading-secondary';
            minutesHTML.push(`
                <div style="height: 50px; display: flex; justify-content: center; align-items: center;">
                    <div class="${className}">${minuteStr}</div>
                </div>
            `);
        }
        minutesColumn.innerHTML = minutesHTML.join('');
        
        // Handle minute selection based on hour
        if (selectedHour === '21') {
            // For 21h, only 00 minutes allowed
            selectedMinute = '00';
            minutesScrollY = 25 - (0 - 2) * itemHeight;
        } else {
            // For other hours, find the correct minute index
            const minuteIndex = parseInt(selectedMinute) / 5;
            // If current minute is not available (e.g., coming from 21:00), default to 00
            if (minuteIndex * 5 > maxMinute) {
                selectedMinute = '00';
                minutesScrollY = 25 - (0 - 2) * itemHeight;
            } else {
                minutesScrollY = 25 - (minuteIndex - 2) * itemHeight;
            }
        }
        
        minutesColumn.style.transform = `translate3d(0px, ${minutesScrollY}px, 0px)`;
        updateTimeDisplay();
        // Update the styling for the selected minute
        updateSelection('minute', selectedMinute);
    }

    // Initialize time options
    generateTimeOptions();

    // Handle hour selection by click
    hoursColumn.addEventListener('click', function(e) {
        const hourDiv = e.target.closest('div[style*="height: 50px"]');
        if (hourDiv && hourDiv.firstElementChild) {
            const hour = hourDiv.firstElementChild.textContent;
            
            // Find the index of clicked item
            const items = Array.from(hoursColumn.children);
            const clickedIndex = items.indexOf(hourDiv);
            
            if (clickedIndex !== -1) {
                // Calculate scroll position to center the clicked item
                hoursScrollY = 25 - (clickedIndex - 2) * itemHeight;
                
                // Apply transform with smooth transition
                hoursColumn.style.transform = `translate3d(0px, ${hoursScrollY}px, 0px)`;
                
                // Update selection
                const oldHour = selectedHour;
                selectedHour = hour;
                updateSelection('hour', hour);
                
                // Always regenerate minutes when hour changes
                if (oldHour !== selectedHour) {
                    generateMinutes();
                } else {
                    updateTimeDisplay();
                }
            }
        }
    });

    // Handle minute selection by click
    minutesColumn.addEventListener('click', function(e) {
        const minuteDiv = e.target.closest('div[style*="height: 50px"]');
        if (minuteDiv && minuteDiv.firstElementChild) {
            const minute = minuteDiv.firstElementChild.textContent;
            
            // Find the index of clicked item
            const items = Array.from(minutesColumn.children);
            const clickedIndex = items.indexOf(minuteDiv);
            
            if (clickedIndex !== -1) {
                // Calculate scroll position to center the clicked item
                minutesScrollY = 25 - (clickedIndex - 2) * itemHeight;
                
                // Apply transform with smooth transition
                minutesColumn.style.transform = `translate3d(0px, ${minutesScrollY}px, 0px)`;
                
                // Update selection
                selectedMinute = minute;
                updateTimeDisplay();
                updateSelection('minute', minute);
            }
        }
    });

    // Add scroll functionality for hours column
    hoursColumn.addEventListener('wheel', function(e) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        const items = hoursColumn.children;
        
        const currentIndex = Math.round((25 - hoursScrollY) / itemHeight) + 2;
        let newIndex = currentIndex + direction;
        
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
        
        hoursScrollY = 25 - (newIndex - 2) * itemHeight;
        
        hoursColumn.style.transform = `translate3d(0px, ${hoursScrollY}px, 0px)`;
        
        const selectedItem = items[newIndex];
        if (selectedItem && selectedItem.firstElementChild) {
            const oldHour = selectedHour;
            selectedHour = selectedItem.firstElementChild.textContent;
            updateSelection('hour', selectedHour);
            
            // Always regenerate minutes when hour changes
            if (oldHour !== selectedHour) {
                generateMinutes();
            } else {
                updateTimeDisplay();
            }
        }
    });

    // Add scroll functionality for minutes column
    minutesColumn.addEventListener('wheel', function(e) {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1; // 1 for down, -1 for up
        const items = minutesColumn.children;
        
        // Calculate current item index based on scroll position
        const currentIndex = Math.round((25 - minutesScrollY) / itemHeight) + 2;
        let newIndex = currentIndex + direction;
        
        // Constrain to valid range
        newIndex = Math.max(0, Math.min(items.length - 1, newIndex));
        
        // Calculate new scroll position
        minutesScrollY = 25 - (newIndex - 2) * itemHeight;
        
        // Apply transform
        minutesColumn.style.transform = `translate3d(0px, ${minutesScrollY}px, 0px)`;
        
        // Update selection immediately
        const selectedItem = items[newIndex];
        if (selectedItem && selectedItem.firstElementChild) {
            selectedMinute = selectedItem.firstElementChild.textContent;
            updateTimeDisplay();
            updateSelection('minute', selectedMinute);
        }
    });

    function updateSelectionFromScroll(type) {
        const column = type === 'hours' ? hoursColumn : minutesColumn;
        const scrollY = type === 'hours' ? hoursScrollY : minutesScrollY;
        const items = column.children;
        
        // Calculate which item is in the selection zone
        for (let i = 0; i < items.length; i++) {
            const itemTop = scrollY + (i * itemHeight);
            const itemBottom = itemTop + itemHeight;
            const itemCenter = itemTop + (itemHeight / 2);
            
            // Check if item center is in selection zone
            if (itemCenter >= selectionZoneTop && itemCenter <= selectionZoneBottom) {
                const value = items[i].firstElementChild.textContent;
                
                if (type === 'hours') {
                    selectedHour = value;
                } else {
                    selectedMinute = value;
                }
                
                updateTimeDisplay();
                updateSelection(type === 'hours' ? 'hour' : 'minute', value);
                break;
            }
        }
    }

    function updateTimeDisplay() {
        selectedTimeSpan.textContent = `${selectedHour}:${selectedMinute}`;
    }

    function updateSelection(type, value) {
        const column = type === 'hour' ? hoursColumn : minutesColumn;
        const items = column.querySelectorAll('div[style*="height: 50px"] > div');
        
        items.forEach(item => {
            if (item.textContent === value) {
                item.className = 'cursor-pointer text-brand-primary font-bold';
            } else {
                item.className = 'cursor-pointer text-heading-secondary';
            }
        });
    }
});
