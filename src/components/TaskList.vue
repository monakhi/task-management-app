<template>
  <v-app>
    <v-container>
      <v-alert
        v-if="taskStore.error"
        type="error"
        dismissible
        class="mb-3"
        @click="taskStore.error = ''"
      >
        {{ taskStore.error }}
      </v-alert>

      <v-alert
        v-if="taskStore.notification"
        type="success"
        dismissible
        class="mb-3"
        @click="taskStore.notification = ''"
      >
        {{ taskStore.notification }}
      </v-alert>

      <v-btn
        color="primary"
        class="mb-3"
        @click="openModal(null)"
      >
        New Task
      </v-btn>

      <v-data-table
        v-if="display.mdAndUp"
        :items="taskStore.tasks"
        :headers="headers"
        class="desktop-table"
        :items-per-page="25"
      >
        <template #[`item.status`]="{ item }">
          <v-chip
            :color="statusColor(item.status)"
            dark
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template #[`item.actions`]="{ item }">
          <div class="d-flex align-center">
            <v-btn
              icon
              color="blue"
              size="small"
              class="mr-2"
              @click="openModal(item)"
            >
              <v-icon small>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn
              icon
              color="red"
              size="small"
              @click="deleteTask(item.id)"
            >
              <v-icon small>
                mdi-delete
              </v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>

      <div v-else>
        <v-card
          v-for="(task, index) in taskStore.tasks"
          :key="index"
          class="mb-3"
        >
          <v-card-title>
            <span class="font-weight-bold">Title:</span> {{ task.title }}
          </v-card-title>
          <v-card-subtitle>
            <span class="font-weight-bold">Due Date:</span> {{ task.dueDate }}
          </v-card-subtitle>
          <v-card-text>
            <span class="font-weight-bold">Description:</span> <p>{{ task.description }}</p>
            <p class="font-weight-bold mt-2 mb-2">
              Status:
            </p>
            <v-chip
              :color="statusColor(task.status)"
              dark
            >
              {{ task.status }}
            </v-chip>
          </v-card-text>
          <v-card-actions>
            <v-btn
              icon
              color="blue"
              size="small"
              class="mr-2"
              @click="openModal(task)"
            >
              <v-icon small>
                mdi-pencil
              </v-icon>
            </v-btn>
            <v-btn
              icon
              color="red"
              size="small"
              @click="deleteTask(task.id)"
            >
              <v-icon small>
                mdi-delete
              </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </div>

      <!-- Task Modal -->
      <v-dialog
        v-model="isModalOpen"
        max-width="500px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ editingTask ? 'Edit Task' : 'Create Task' }}</span>
          </v-card-title>
          <v-card-text>
            <v-form v-model="formValidity">
              <v-container>
                <v-text-field
                  v-model="taskData.title"
                  label="Title"
                  :rules="[rules.required]"
                />
                <v-textarea
                  v-model="taskData.description"
                  label="Description"
                />
                <v-text-field
                  v-model="taskData.dueDate"
                  label="Due Date"
                  type="date"
                  :rules="[rules.required, rules.dueDate]"
                />
                <v-select
                  v-model="taskData.status"
                  label="Status"
                  :items="['Pending', 'In Progress', 'Completed', 'On Hold']"
                  :rules="[rules.required]"
                />
              </v-container>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="blue-darken-1"
              variant="text"
              @click="closeModal"
            >
              Cancel
            </v-btn>
            <v-btn
              color="blue-darken-1"
              variant="text"
              :disabled="!formValidity"
              @click="saveTask"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useTaskStore } from '../stores/tasksStore'
import { onMounted } from "vue";
import type { Task } from '@/types';

const display = ref(useDisplay());
const taskStore = useTaskStore();

onMounted(() => {
   taskStore.getTasks();
});

const headers = ref([
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Title', key: 'title', align: 'start' },
  { title: 'Description', key: 'description', align: 'start' },
  { title: 'Due Date', key: 'dueDate', align: 'center' },
  { title: 'Status', key: 'status', align: 'center' },
  { title: 'Actions', key: 'actions', align: 'center', sortable: false }
] as const);

const isModalOpen = ref(false);
const editingTask = ref(false);
const taskData = ref<Task>({ id:-1, title: '', description: '', dueDate: '', status: 'Pending' });
const formValidity = ref(false);

const rules = {
  dueDate: (value: string) => {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today || 'Due date must be today or later';
  },
  required: (value: string) => !!value || 'Field is required',
};

const statusColor = (status: string): string => {
  switch (status) {
    case 'Completed': return 'green';
    case 'In Progress': return 'blue';
    case 'Pending': return 'orange';
    case 'On Hold': return 'red';
    default: return 'grey';
  }
};


const openModal = (task: Task | null) => {
  editingTask.value = !!task;
  taskData.value = task ? { ...task } : { id:0, title: '', description: '', dueDate: '', status: 'Pending' };
  isModalOpen.value = true;

  taskStore.error = "";
  taskStore.notification = "";
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveTask = () => {
  const index = taskStore.tasks.findIndex(t => t.id === taskData.value.id);
  if (index === -1) {

    const maxId = taskStore.tasks.length > 0
      ? Math.max(...taskStore.tasks.map(task => task.id))
      : 0;

    taskData.value.id = maxId + 1;
    taskStore.createTask(taskData.value);
  } else {
    taskStore.updateTask(taskData.value);
  }
  closeModal();
};

const deleteTask = (taskId: number) => {
  console.log(`Deleting task with id: ${taskId}`);
  if (confirm("Are you sure you want to delete this task?")) {
    taskStore.deleteTask(taskId);
  }
};

</script>
