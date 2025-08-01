// Calendar App Logic
class CalendarApp {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.events = this.loadEvents();
        
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderCalendar();
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Add event button
        document.getElementById('addEvent').addEventListener('click', () => {
            this.addEvent();
        });

        // Enter key in event input
        document.getElementById('eventInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addEvent();
            }
        });

        // Modal events
        document.getElementById('modalAddEvent').addEventListener('click', () => {
            this.addEventFromModal();
        });

        document.getElementById('modalCancel').addEventListener('click', () => {
            this.closeModal();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Enter key in modal input
        document.getElementById('modalEventInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addEventFromModal();
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('eventModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update header
        document.getElementById('monthYear').textContent = 
            `${this.monthNames[month]} ${year}`;

        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Get days from previous month
        const prevMonth = new Date(year, month - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();

        const calendarGrid = document.getElementById('calendar');
        calendarGrid.innerHTML = '';

        let dayCount = 1;
        let nextMonthDayCount = 1;

        // Create calendar grid (6 weeks = 42 days)
        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            let dayNumber, isCurrentMonth, dateKey;

            if (i < startingDayOfWeek) {
                // Previous month days
                dayNumber = daysInPrevMonth - startingDayOfWeek + i + 1;
                dayElement.classList.add('other-month');
                isCurrentMonth = false;
                const prevMonthDate = new Date(year, month - 1, dayNumber);
                dateKey = this.getDateKey(prevMonthDate);
            } else if (dayCount <= daysInMonth) {
                // Current month days
                dayNumber = dayCount;
                isCurrentMonth = true;
                const currentDate = new Date(year, month, dayNumber);
                dateKey = this.getDateKey(currentDate);
                
                // Check if it's today
                const today = new Date();
                if (year === today.getFullYear() && 
                    month === today.getMonth() && 
                    dayNumber === today.getDate()) {
                    dayElement.classList.add('today');
                }
                
                dayCount++;
            } else {
                // Next month days
                dayNumber = nextMonthDayCount;
                dayElement.classList.add('other-month');
                isCurrentMonth = false;
                const nextMonthDate = new Date(year, month + 1, dayNumber);
                dateKey = this.getDateKey(nextMonthDate);
                nextMonthDayCount++;
            }

            // Create day content
            const dayNumberElement = document.createElement('div');
            dayNumberElement.className = 'day-number';
            dayNumberElement.textContent = dayNumber;

            const eventsElement = document.createElement('div');
            eventsElement.className = 'day-events';

            // Add events for this day
            const dayEvents = this.events[dateKey] || [];
            if (dayEvents.length > 0) {
                if (dayEvents.length <= 2) {
                    // Show event text for few events
                    dayEvents.forEach(event => {
                        const eventDiv = document.createElement('div');
                        eventDiv.className = 'event-text';
                        eventDiv.textContent = event.length > 15 ? 
                            event.substring(0, 12) + '...' : event;
                        eventsElement.appendChild(eventDiv);
                    });
                } else {
                    // Show dots for many events
                    const dotsContainer = document.createElement('div');
                    for (let j = 0; j < Math.min(dayEvents.length, 5); j++) {
                        const dot = document.createElement('span');
                        dot.className = 'event-dot';
                        dotsContainer.appendChild(dot);
                    }
                    eventsElement.appendChild(dotsContainer);
                }
            }

            dayElement.appendChild(dayNumberElement);
            dayElement.appendChild(eventsElement);

            // Add click event
            dayElement.addEventListener('click', (e) => {
                this.selectDate(year, month, dayNumber, isCurrentMonth, e.currentTarget);
            });

            calendarGrid.appendChild(dayElement);
        }

        // Update selected date display
        this.updateSelectedDateDisplay();
    }

    selectDate(year, month, day, isCurrentMonth, clickedElement) {
        // Adjust for other month days
        if (!isCurrentMonth) {
            // Navigate to the appropriate month and select the day
            if (day > 15) {
                // Previous month
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            } else {
                // Next month
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            }
            this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
            this.renderCalendar();
            return;
        }

        this.selectedDate = new Date(year, month, day);
        
        // Update visual selection
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        if (clickedElement) {
            clickedElement.classList.add('selected');
        }

        this.updateSelectedDateDisplay();
    }

    updateSelectedDateDisplay() {
        const selectedDateElement = document.getElementById('selectedDate');
        const eventsListElement = document.getElementById('eventsList');
        
        if (this.selectedDate) {
            const dateStr = this.formatDate(this.selectedDate);
            selectedDateElement.textContent = `Events for ${dateStr}`;
            
            // Make sure we highlight the selected date in the calendar
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.classList.remove('selected');
            });
            
            // Find and highlight the correct day
            const targetDay = this.selectedDate.getDate();
            const targetMonth = this.selectedDate.getMonth();
            const targetYear = this.selectedDate.getFullYear();
            const currentMonth = this.currentDate.getMonth();
            const currentYear = this.currentDate.getFullYear();
            
            if (targetMonth === currentMonth && targetYear === currentYear) {
                const dayElements = document.querySelectorAll('.calendar-day');
                dayElements.forEach(dayEl => {
                    const dayNumber = parseInt(dayEl.querySelector('.day-number').textContent);
                    if (dayNumber === targetDay && !dayEl.classList.contains('other-month')) {
                        dayEl.classList.add('selected');
                    }
                });
            }
            
            const dateKey = this.getDateKey(this.selectedDate);
            const dayEvents = this.events[dateKey] || [];
            
            eventsListElement.innerHTML = '';
            
            if (dayEvents.length === 0) {
                eventsListElement.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No events for this day</p>';
            } else {
                dayEvents.forEach((event, index) => {
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event-item';
                    
                    const eventText = document.createElement('span');
                    eventText.textContent = event;
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-event';
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.addEventListener('click', () => {
                        this.deleteEvent(dateKey, index);
                    });
                    
                    eventDiv.appendChild(eventText);
                    eventDiv.appendChild(deleteBtn);
                    eventsListElement.appendChild(eventDiv);
                });
            }
        } else {
            selectedDateElement.textContent = 'Select a date to view events';
            eventsListElement.innerHTML = '';
        }
    }

    addEvent() {
        if (!this.selectedDate) {
            alert('Please select a date first');
            return;
        }

        const eventInput = document.getElementById('eventInput');
        const eventText = eventInput.value.trim();
        
        if (!eventText) {
            alert('Please enter an event description');
            return;
        }

        const dateKey = this.getDateKey(this.selectedDate);
        
        if (!this.events[dateKey]) {
            this.events[dateKey] = [];
        }
        
        this.events[dateKey].push(eventText);
        this.saveEvents();
        
        eventInput.value = '';
        this.renderCalendar();
        this.updateSelectedDateDisplay();
    }

    openModal(date) {
        const modal = document.getElementById('eventModal');
        const modalDate = document.getElementById('modalDate');
        const modalInput = document.getElementById('modalEventInput');
        
        modalDate.textContent = `Add event for ${this.formatDate(date)}`;
        modalInput.value = '';
        modal.style.display = 'block';
        modalInput.focus();
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        modal.style.display = 'none';
    }

    addEventFromModal() {
        const eventText = document.getElementById('modalEventInput').value.trim();
        
        if (!eventText) {
            alert('Please enter an event description');
            return;
        }

        const dateKey = this.getDateKey(this.selectedDate);
        
        if (!this.events[dateKey]) {
            this.events[dateKey] = [];
        }
        
        this.events[dateKey].push(eventText);
        this.saveEvents();
        
        this.closeModal();
        this.renderCalendar();
        this.updateSelectedDateDisplay();
    }

    deleteEvent(dateKey, eventIndex) {
        if (confirm('Are you sure you want to delete this event?')) {
            this.events[dateKey].splice(eventIndex, 1);
            
            if (this.events[dateKey].length === 0) {
                delete this.events[dateKey];
            }
            
            this.saveEvents();
            this.renderCalendar();
            this.updateSelectedDateDisplay();
        }
    }

    getDateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    saveEvents() {
        try {
            localStorage.setItem('calendarEvents', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error saving events:', error);
            alert('Error saving events. Your events may not be preserved.');
        }
    }

    loadEvents() {
        try {
            const saved = localStorage.getItem('calendarEvents');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading events:', error);
            return {};
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalendarApp();
});