'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import styles from './css_module/page.module.css';

type Task = {
  id: number;
  texto: string;
  completada: boolean;
};

type Modal = 'edit' | 'delete' | 'deleteCompleted' | null;

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const storedTasks = window.localStorage.getItem('todo_tasks');

    if (!storedTasks) {
      setIsLoaded(true);
      return;
    }

    try {
      setTasks(JSON.parse(storedTasks) as Task[]);
    } catch {
      window.localStorage.removeItem('todo_tasks');
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    window.localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  }, [isLoaded, tasks]);

  function addTask() {
    const texto = taskText.trim();

    if (!texto) return;

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: Date.now(), texto, completada: false },
    ]);
    setTaskText('');
  }

  function toggleTask(id: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completada: !task.completada } : task,
      ),
    );
  }

  function openEdit(task: Task) {
    setSelectedTaskId(task.id);
    setEditText(task.texto);
    setModal('edit');
  }

  function saveEdit() {
    const texto = editText.trim();

    if (!texto || selectedTaskId === null) return;

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === selectedTaskId ? { ...task, texto } : task,
      ),
    );
    closeModal();
  }

  function deleteTask() {
    if (selectedTaskId === null) return;

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== selectedTaskId),
    );
    closeModal();
  }

  function deleteCompletedTasks() {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completada));
    closeModal();
  }

  function closeModal() {
    setModal(null);
    setSelectedTaskId(null);
    setEditText('');
  }

  const completedCount = tasks.filter((task) => task.completada).length;

  return (
    <main className={styles.todoContainer}>
      <h1>MI TODO LIST</h1>

      <div className={styles.inputArea}>
        <input
          className={styles.taskInput}
          type="text"
          value={taskText}
          onChange={(event) => setTaskText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addTask();
          }}
          placeholder="Escribe una tarea..."
        />
        <div className={styles.inputHint}>
          Presiona <strong>Enter</strong> para agregar una tarea
        </div>
      </div>

      <div className={styles.taskList}>
        {tasks.map((task) => (
          <div
            className={`${styles.taskItem} ${task.completada ? styles.completed : ''}`}
            key={task.id}
          >
            <input
              type="checkbox"
              checked={task.completada}
              onChange={() => toggleTask(task.id)}
              aria-label={`Marcar ${task.texto} como completada`}
            />
            <span className={styles.taskText}>{task.texto}</span>
            <div className={styles.taskActions}>
              <button
                className={styles.editBtn}
                onClick={() => openEdit(task)}
                aria-label={`Editar ${task.texto}`}
              >
                <Image
                  src="/pencil.svg"
                  alt="Editar"
                  width={20}
                  height={20}
                />
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setModal('delete');
                }}
                aria-label={`Eliminar ${task.texto}`}
              >
                <Image
                  src="/trash.svg"
                  alt="Eliminar"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <p>
        Completadas: {completedCount} de {tasks.length}
      </p>

      <button
        className={styles.DeleteCompleteBtn}
        onClick={() => setModal('deleteCompleted')}
        disabled={completedCount === 0}
      >
        Eliminar Completadas
      </button>

      {modal && (
        <div className={styles.modalOverlay} role="presentation">
          {modal === 'edit' && (
            <div className={styles.modalBox} role="dialog" aria-modal="true">
              <div className={styles.modalHeader}>
                <h3>Editar tarea</h3>
                <button className={styles.closeBtn} onClick={closeModal} aria-label="Cerrar">
                  ×
                </button>
              </div>
              <input
                type="text"
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveEdit();
                }}
                autoFocus
              />
              <div className={styles.modalActions}>
                <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
                <button className={styles.btnSave} onClick={saveEdit}>Guardar</button>
              </div>
            </div>
          )}

          {modal === 'delete' && (
            <div className={styles.modalBox} role="dialog" aria-modal="true">
              <div className={styles.modalHeader}>
                <h3>Eliminar tarea</h3>
                <button className={styles.closeBtn} onClick={closeModal} aria-label="Cerrar">
                  ×
                </button>
              </div>
              <p>¿Seguro que quieres eliminar esta tarea?</p>
              <div className={styles.modalActions}>
                <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
                <button className={styles.btnDelete} onClick={deleteTask}>Eliminar</button>
              </div>
            </div>
          )}

          {modal === 'deleteCompleted' && (
            <div className={styles.modalBox} role="dialog" aria-modal="true">
              <div className={styles.modalHeader}>
                <h3>Eliminar completadas</h3>
                <button className={styles.closeBtn} onClick={closeModal} aria-label="Cerrar">
                  ×
                </button>
              </div>
              <p>¿Seguro que quieres eliminar todas las tareas completadas?</p>
              <div className={styles.modalActions}>
                <button className={styles.btnCancel} onClick={closeModal}>Cancelar</button>
                <button className={styles.btnDelete} onClick={deleteCompletedTasks}>
                  Eliminar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}