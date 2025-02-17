import { mount } from "@vue/test-utils";
import { describe, it, expect, beforeEach, vi} from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import TaskList from "../src/components/TaskList.vue";
import { useTaskStore } from "../src/stores/tasksStore";
import "vuetify/styles";
import ResizeObserver from "resize-observer-polyfill";

const vuetify = createVuetify({
  components,
  directives,
});

globalThis.ResizeObserver = ResizeObserver;

describe("TaskList.vue", () => {
  let taskStore: ReturnType<typeof useTaskStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    taskStore = useTaskStore();
  });

  it("renders the task list correctly", async () => {
    taskStore.tasks = [
      { id: 1, title: "Task 1", description: "First task", dueDate: "2025-02-17", status: "Pending" },
      { id: 2, title: "Task 2", description: "Second task", dueDate: "2025-02-18", status: "Completed" },
    ];

    const wrapper = mount(TaskList, {
      global: {
        plugins: [vuetify],
      },
    });

    expect(wrapper.text()).toContain("Task 1");
    expect(wrapper.text()).toContain("Task 2");
  });

  it("opens the modal when 'New Task' button is clicked", async () => {
    const wrapper = mount(TaskList, {
      global: {
        plugins: [vuetify],
      },
    });

    await wrapper.find("button").trigger("click");

    expect(wrapper.findComponent({ name: "VDialog" }).exists()).toBe(true);

  });

  const updateField = (labelText: string, value: string) => {
    const field = [...document.querySelectorAll(".v-field__field")].find((field) =>
      field.querySelector("label")?.textContent?.trim() === labelText
    );

    if (!field) throw new Error(`Field with label "${labelText}" not found`);

    if (labelText === "Status") {
      const selectInput = field.querySelector("input") as HTMLInputElement;
      const selectionSpan = field.querySelector(".v-select__selection-text") as HTMLSpanElement;

      expect(selectInput).not.toBeNull();
      expect(selectionSpan).not.toBeNull();

      selectInput.value = value;
      selectionSpan.textContent = value;
      selectInput.dispatchEvent(new Event("input"));
    } else {
      const input = field.querySelector(".v-field__input") as HTMLInputElement | HTMLTextAreaElement;
      expect(input).not.toBeNull();
      input.value = value;
      input.dispatchEvent(new Event("input"));
    }
  };


  it("creates a new task", async () => {
    const wrapper = mount(TaskList, {
      global: {
        plugins: [vuetify],
      },
    });

    await wrapper.find("button").trigger("click");
    await wrapper.vm.$nextTick();

    const titleValue = "New Task Title";
    const descriptionValue = "New task description";
    const duedateValue = "2025-12-20";
    const statusValue = "Pending";

    updateField("Title", titleValue);
    updateField("Description", descriptionValue);
    updateField("Due Date", duedateValue);
    updateField("Status", statusValue);

    await wrapper.vm.$nextTick();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const saveButton = [...document.querySelectorAll("button")].find((btn) =>
      btn.textContent?.trim().includes("Save")
    ) as HTMLButtonElement;

    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBe(false);

    saveButton.click();

    await wrapper.vm.$nextTick();

    const taskStore = useTaskStore();
    expect(taskStore.tasks.length).toBe(1);
    expect(taskStore.tasks[0].title).toBe(titleValue);
    expect(taskStore.tasks[0].description).toBe(descriptionValue);
    expect(taskStore.tasks[0].dueDate).toBe(duedateValue);
    expect(taskStore.tasks[0].status).toBe(statusValue);
  });


  it("updates an existing task", async () => {
    const taskStore = useTaskStore();
    taskStore.tasks = [
      { id: 1, title: "Old Task Title", description: "Old task description", dueDate: "2025-01-01", status: "In Progress" },
    ];

    const wrapper = mount(TaskList, {
      global: {
        plugins: [vuetify],
      },
    });

    await wrapper.vm.$nextTick();

    const editButton = wrapper.find(".mr-2");
    expect(editButton.exists()).toBe(true);

    await editButton.trigger("click");
    await wrapper.vm.$nextTick();

    const modal = [...document.querySelectorAll(".v-overlay__content")].find((el) =>
      el.textContent?.includes("Edit Task")
    );

    expect(modal).not.toBeNull();

    const updateEditField = (labelText: string, value: string) => {
      const field = [...modal!.querySelectorAll(".v-field__field")].find((field) =>
        field.querySelector("label")?.textContent?.trim() === labelText
      );

      if (!field) throw new Error(`Field with label "${labelText}" not found`);

      if (labelText === "Status") {
        const selectInput = field.querySelector("input") as HTMLInputElement;
        const selectionSpan = field.querySelector(".v-select__selection-text") as HTMLSpanElement;

        expect(selectInput).not.toBeNull();
        expect(selectionSpan).not.toBeNull();

        selectInput.value = value;
        selectionSpan.textContent = value;
        selectInput.dispatchEvent(new Event("input"));

      } else {
        const input = field.querySelector(".v-field__input") as HTMLInputElement | HTMLTextAreaElement;
        expect(input).not.toBeNull();
        input.value = value;
        input.dispatchEvent(new Event("input"));
      }
    };

    const updatedTitle = "Updated Task Title";
    const updatedDescription = "Updated task description";
    const updatedDueDate = "2025-12-20";
    const updatedStatus = "In Progress";

    updateEditField("Title", updatedTitle);
    updateEditField("Description", updatedDescription);
    updateEditField("Due Date", updatedDueDate);
    updateEditField("Status", updatedStatus);

    await wrapper.vm.$nextTick();

    await new Promise((resolve) => setTimeout(resolve, 50));

    const saveButton = [...modal!.querySelectorAll("button")].find((btn) =>
      btn.textContent?.trim().includes("Save")
    ) as HTMLButtonElement;

    expect(saveButton).not.toBeNull();
    expect(saveButton.disabled).toBe(false);

    saveButton.click();
    await wrapper.vm.$nextTick();

    expect(taskStore.tasks.length).toBe(1);
    expect(taskStore.tasks[0].title).toBe(updatedTitle);
    expect(taskStore.tasks[0].description).toBe(updatedDescription);
    expect(taskStore.tasks[0].dueDate).toBe(updatedDueDate);
    expect(taskStore.tasks[0].status).toBe(updatedStatus);
  });



it("deletes a task", async () => {
  taskStore.tasks = [
    { id: 1, title: "Task 1", description: "First task", dueDate: "2025-02-17", status: "Pending" },
  ];

  const wrapper = mount(TaskList, {
    global: {
      plugins: [vuetify],
    },
  });

  vi.spyOn(window, "confirm").mockReturnValue(true);

  const deleteButton = wrapper.find(".mdi-delete");
  expect(deleteButton.exists()).toBe(true);

  await deleteButton.trigger("click");

  expect(taskStore.tasks.length).toBe(0);

  vi.restoreAllMocks();
});



it("displays success notification when a task is created", async () => {
  const wrapper = mount(TaskList, {
    global: {
      plugins: [vuetify],
    },
  });

  taskStore.notification = "Task created successfully";
  await wrapper.vm.$nextTick();
  expect(wrapper.text()).toContain("Task created successfully");
});

it("displays error when an issue occurs", async () => {
  const wrapper = mount(TaskList, {
    global: {
      plugins: [vuetify],
    },
  });

  taskStore.error = "An error occurred";
  await wrapper.vm.$nextTick();
  expect(wrapper.text()).toContain("An error occurred");
});

});
