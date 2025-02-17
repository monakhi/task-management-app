# Vue Task Management App

This is a **Vue.js** and **Vuetify**-powered task management application that allows users to **view, add, edit, and delete tasks**. The app retrieves tasks from a JSON file hosted on **GitHub** and provides an intuitive interface for task management.

---

## Project Setup

### Prerequisites

Ensure you have the following installed before proceeding:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://npmjs.com/) (comes with Node.js)

---

### 1. Clone the Repository

```
git clone https://github.com/monakhi/task-management-app.git
cd task-management-app
```

---

### 2. Install Dependencies

Run the following command to install all necessary dependencies:

```
npm install
```

---

### 3. Set Up the Environment Variables

The app fetches task data from a JSON file stored on **GitHub**. You must create a **`.env`** file in the root directory and define the API URL:

```
VITE_API_URL="https://raw.githubusercontent.com/monakhi/GenerateJson/refs/heads/main/TaskList.json"
```

---

### 4. Run the App

Start the development server using:

```
npm run dev
```

This will launch the app in **development mode**. By default, it runs on:

```
http://localhost:3000
```

---

### 5. Run Unit Tests

You can execute the unit tests using:

```
npm run test
```

This will run tests using **Vitest**.

---

## API Integration

The **taskStore** fetches and manages task data from a JSON file hosted on **https://raw.githubusercontent.com/monakhi/GenerateJson/refs/heads/main/TaskList.json**:

```
${VITE_API_URL}  (Defined in .env file)
```

### API JSON Format

The JSON file should be structured as follows:

```
[
  {
    "id": 1,
    "title": "Design Homepage UI",
    "description": "Create a responsive homepage layout using Vuetify.",
    "dueDate": "2025-03-14",
    "status": "On Hold"
  },
  {
    "id": 2,
    "title": "Fix Login Bug",
    "description": "Resolve issue where users cannot log in with special characters in passwords.",
    "dueDate": "2025-02-17",
    "status": "Pending"
  }
]

```

This API is used for:
- Fetching task data

Once fetched the below functions, update the Task List on the local Pinia Store
- Creating new tasks
- Updating existing tasks
- Deleting tasks 

---



