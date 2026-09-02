const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const completeCount = document.getElementById('CompleteCount');
const totalCount = document.getElementById('totalCount');
const btnDeleteComplete = document.getElementById('DeleteCompleteBtn');

const modalOverlay = document.getElementById('modalOverlay');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const deleteCompletedModal = document.getElementById('deleteCompletedModal');
const editTaskInput = document.getElementById('editTaskInput');

let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];
let currentTaskId = null;

function saveAndRender() {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = '';
    let completed = 0;

    tasks.forEach(task => {
        if (task.completada) completed++;

        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completada ? 'completed' : ''}`;
        
        taskDiv.innerHTML = `
            <input type="checkbox" ${task.completada ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <span class="task-text">${task.texto}</span>
            <div class="task-actions">
                <button class="edit-btn" onclick="openEdit(${task.id}, '${task.texto.replace(/'/g, "\\'")}')">✏️</button>
                <button class="delete-btn" onclick="openDelete(${task.id})">🗑️</button>
            </div>
        `;
        taskList.appendChild(taskDiv);
    });

    completeCount.textContent = completed;
    totalCount.textContent = tasks.length;
}

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && taskInput.value.trim() !== '') {
        const newTask = {
            id: Date.now(),
            texto: taskInput.value.trim(),
            completada: false
        };
        tasks.push(newTask);
        taskInput.value = '';
        saveAndRender();
    }
});

window.toggleTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completada = !task.completada;
        saveAndRender();
    }
};

function closeModal() {
    modalOverlay.classList.add('hidden');
    editModal.classList.add('hidden');
    deleteModal.classList.add('hidden');
    deleteCompletedModal.classList.add('hidden');
    currentTaskId = null;
}

document.querySelectorAll('.btn-cancel, .close-btn').forEach(btn => {
    btn.addEventListener('click', closeModal);
});

window.openEdit = (id, textoActual) => {
    currentTaskId = id;
    editTaskInput.value = textoActual;
    modalOverlay.classList.remove('hidden');
    editModal.classList.remove('hidden');
    editTaskInput.focus();
};

document.getElementById('saveEditBtn').addEventListener('click', () => {
    if (editTaskInput.value.trim() !== '') {
        const task = tasks.find(t => t.id === currentTaskId);
        if (task) task.texto = editTaskInput.value.trim();
        saveAndRender();
        closeModal();
    }
});

window.openDelete = (id) => {
    currentTaskId = id;
    modalOverlay.classList.remove('hidden');
    deleteModal.classList.remove('hidden');
};

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    tasks = tasks.filter(t => t.id !== currentTaskId);
    saveAndRender();
    closeModal();
});

btnDeleteComplete.addEventListener('click', () => {
    const hayCompletadas = tasks.some(t => t.completada);
    if (hayCompletadas) {
        modalOverlay.classList.remove('hidden');
        deleteCompletedModal.classList.remove('hidden');
    }
});

document.getElementById('confirmDeleteCompletedBtn').addEventListener('click', () => {
    tasks = tasks.filter(t => !t.completada);
    saveAndRender();
    closeModal();
});

renderTasks();