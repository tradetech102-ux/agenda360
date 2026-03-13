let currentDate = new Date();
const today = new Date();
const calendarContainer = document.getElementById('calendar-days');
const calendarTitle = document.getElementById('calendar-title');

function generateCalendar() {
  if (!calendarContainer) return;
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  calendarTitle.textContent = `${currentDate.toLocaleString('pt-BR', { month: 'long' }).toUpperCase()} ${year}`;
  calendarContainer.innerHTML = '';

  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    calendarContainer.appendChild(emptyDay);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('day');
    
    const dayNumber = document.createElement('span');
    dayNumber.classList.add('day-number');
    dayNumber.textContent = i;
    dayDiv.appendChild(dayNumber);
    
    const addIcon = document.createElement('span');
    addIcon.classList.add('add-icon');
    addIcon.textContent = '+';
    dayDiv.appendChild(addIcon);
    
    const eventDot = document.createElement('div');
    eventDot.classList.add('event-dot');
    dayDiv.appendChild(eventDot);

    if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
      dayDiv.classList.add('current-day');
    }

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    
    dayDiv.addEventListener('click', () => showDayEvents(new Date(year, month, i)));
    
    addIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      openAddEventModal(new Date(year, month, i));
    });

    const events = JSON.parse(localStorage.getItem('events') || '{}');
    if (events[dateKey] && events[dateKey].length > 0) {
      dayDiv.classList.add('has-events');
    }

    calendarContainer.appendChild(dayDiv);
  }
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  generateCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  generateCalendar();
}

function showDayEvents(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const events = JSON.parse(localStorage.getItem('events') || '{}')[dateKey] || [];

  document.getElementById('modal-date-title').textContent = `Eventos de ${day}/${month + 1}/${year}`;
  const eventList = document.getElementById('event-list');
  eventList.innerHTML = '';

  events.forEach((event, index) => {
    const eventDiv = document.createElement('div');
    eventDiv.classList.add('event-item');
    eventDiv.innerHTML = `
      <span>${event.descricao} (${event.horario})</span>
      <div class="actions">
        <button onclick="editEvent('${dateKey}', ${index})"><i class="fas fa-pencil-alt"></i></button>
        <button onclick="deleteEvent('${dateKey}', ${index})"><i class="fas fa-trash"></i></button>
      </div>
    `;
    eventList.appendChild(eventDiv);
  });

  openModal('task-modal');
}

function openAddEventModal(date = new Date()) {
  document.getElementById('task-desc').value = '';
  document.getElementById('task-time').value = '';
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  document.getElementById('add-event-modal').dataset.date = dateKey;
  delete document.getElementById('add-event-modal').dataset.editIndex;
  openModal('add-event-modal');
}

function saveTarefa() {
  const desc = document.getElementById('task-desc').value;
  const time = document.getElementById('task-time').value;
  if (!desc || !time) {
    alert('Preencha todos os campos!');
    return;
  }
  
  const dateKey = document.getElementById('add-event-modal').dataset.date;
  const editIndex = document.getElementById('add-event-modal').dataset.editIndex;
  
  let events = JSON.parse(localStorage.getItem('events') || '{}');
  if (!events[dateKey]) events[dateKey] = [];
  
  if (editIndex !== undefined) {
    events[dateKey][editIndex] = { descricao: desc, horario: time };
  } else {
    events[dateKey].push({ descricao: desc, horario: time });
  }
  
  localStorage.setItem('events', JSON.stringify(events));
  closeModal('add-event-modal');
  generateCalendar();
  showDayEvents(new Date(dateKey.replace(/-/g, '/')));
}

function editEvent(dateKey, index) {
  const events = JSON.parse(localStorage.getItem('events') || '{}')[dateKey];
  const event = events[index];
  document.getElementById('task-desc').value = event.descricao;
  document.getElementById('task-time').value = event.horario;
  document.getElementById('add-event-modal').dataset.date = dateKey;
  document.getElementById('add-event-modal').dataset.editIndex = index;
  openModal('add-event-modal');
}

function deleteEvent(dateKey, index) {
  let events = JSON.parse(localStorage.getItem('events') || '{}');
  if (confirm('Deseja excluir este evento?')) {
    events[dateKey].splice(index, 1);
    if (events[dateKey].length === 0) delete events[dateKey];
    localStorage.setItem('events', JSON.stringify(events));
    generateCalendar();
    showDayEvents(new Date(dateKey.replace(/-/g, '/')));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('calendar-days')) {
    generateCalendar();
  }
});
