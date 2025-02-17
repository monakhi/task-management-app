import type { Task } from '@/types';
import axios from 'axios';
import { defineStore } from 'pinia';

const API_URL = import.meta.env.VITE_API_URL;

export const useTaskStore = defineStore('tasks', {
  state: (): { tasks: Task[]; error: string; loading: boolean, notification: string } => ({
    tasks: [],
    error: "",
    loading: true,
    notification: ""
  }),
  actions: {
    async getTasks() {
      try {
        const response = await axios.get<Task[]>(API_URL);
        this.tasks = response.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        this.error = "Failed to load tasks.";
      } finally {
        this.loading = false;
      }
    },

    createTask(newTask: Task) {
      const existingTask = this.tasks.find(task => task.id === newTask.id);
      if (!existingTask) {
        this.tasks.push(newTask);
        this.notification = "Task is added successfully.";
      } else {
        this.error = `Task with id ${newTask.id} already exists.`;
      }
    },

    updateTask(updatedTask: Task) {
      const index = this.tasks.findIndex(task => task.id === updatedTask.id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updatedTask };
        this.notification = "Task is updated successfully.";
      } else {
        this.error = `Task with id ${updatedTask.id} not found.`;
      }
    },

    deleteTask(taskId: number) {
      const index = this.tasks.findIndex(task => task.id === taskId);
      if (index !== -1) {
        this.tasks.splice(index, 1);
        this.notification = "Task is deleted successfully.";
      } else {
        this.error = `Task with id ${taskId} not found.`;
      }
    }
  }
});

