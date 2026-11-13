# Student Management System

A clean, modern, and minimal **Student Management System** college assignment project built from scratch with **Spring Boot** and **Vanilla JavaScript**.

---

## 🚀 Project Overview

This full-stack application provides an end-to-end management dashboard for student enrollments. It features a responsive, single-page dashboard with a light modern aesthetic, real-time metrics, live search and course filtering, modal-based CRUD operations, and safe confirmation dialogs. All data is persisted directly in a **MySQL** database through standard Spring Data JPA RESTful endpoints.

---

## 🛠️ Technology Stack

### Backend
- **Java 17**
- **Spring Boot 3.3.5**
- **Spring Web** (REST API & static web resource hosting)
- **Spring Data JPA** (Repository pattern with Hibernate ORM)
- **MySQL** (Relational database)
- **Maven** (Dependency & build management)

### Frontend
- **HTML5** (Semantic structure)
- **CSS3** (Custom design system, CSS variables, responsive layout, glassmorphism touches)
- **Vanilla JavaScript (ES6+)** (Native `fetch()` API calls, DOM manipulation, no heavy frontend frameworks)

---

## 📁 Project Architecture

```
student-management-system/
├── pom.xml
├── postman_collection.json
├── README.md
├── mvnw / mvnw.cmd
└── src/
    └── main/
        ├── java/com/college/studentmanagement/
        │   ├── StudentManagementApplication.java
        │   ├── entity/
        │   │   └── Student.java
        │   ├── repository/
        │   │   └── StudentRepository.java
        │   ├── service/
        │   │   └── StudentService.java
        │   ├── controller/
        │   │   └── StudentController.java
        │   └── exception/
        │       ├── StudentNotFoundException.java
        │       ├── GlobalExceptionHandler.java
        │       └── ErrorResponse.java
        └── resources/
            ├── application.properties
            └── static/
                ├── index.html
                ├── style.css
                └── script.js
```

---

## 🗄️ Database Setup (MySQL)

1. **Start MySQL Server** on your computer (via MySQL Workbench, XAMPP, or MySQL Command Line).
2. **Create the Database** (optional, Spring Boot will also auto-create if configured with `createDatabaseIfNotExist=true`):
   ```sql
   CREATE DATABASE student_db;
   ```
3. **Configure Database Credentials**:
   Open `src/main/resources/application.properties` and verify your username and password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/student_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   spring.jpa.hibernate.ddl-auto=update
   ```
   > **Note:** You can also pass credentials through environment variables without editing the file:
   > - `DB_USERNAME`
   > - `DB_PASSWORD`

---

## ▶️ How to Run the Application

### 1. Using Maven Wrapper (Recommended)

In terminal or PowerShell, navigate to the project directory:

**Windows (PowerShell or CMD):**
```powershell
.\mvnw.cmd spring-boot:run
```

**Linux / macOS:**
```bash
./mvnw spring-boot:run
```

### 2. Access the Web Dashboard

Open your web browser and navigate to:
```
http://localhost:8080
```

---

## 📡 REST API Endpoints

All endpoints are prefixed with `/api/students`:

| Method | Endpoint | Description | Request Body | Response Status |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/students` | Create a new student | `{ "name": "...", "email": "...", "course": "...", "age": 21 }` | `201 Created` |
| **GET** | `/api/students` | Retrieve all students | None | `200 OK` |
| **GET** | `/api/students/{id}` | Get student details by ID | None | `200 OK` / `404 Not Found` |
| **PUT** | `/api/students/{id}` | Update existing student | `{ "name": "...", "email": "...", "course": "...", "age": 22 }` | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/students/{id}` | Delete student by ID | None | `204 No Content` / `404 Not Found` |
| **GET** | `/api/students/course/{course}` | Filter students by course | None | `200 OK` |

### Sample JSON Request Body (POST / PUT)
```json
{
  "name": "Alex Johnson",
  "email": "alex.johnson@college.edu",
  "course": "Computer Science",
  "age": 21
}
```

---

## 📮 Postman Collection

Import the included `postman_collection.json` directly into Postman:
1. Open Postman.
2. Click **Import** in the top-left corner.
3. Select `postman_collection.json` located in the root directory.
4. Run any of the 6 pre-configured requests.

---

## 💻 How to Use the Dashboard

1. **View Overview**: Top summary cards display total student enrollments and unique active courses.
2. **Add Student**: Click the **"+ Add Student"** button in the header, fill out the form in the modal, and click **Save Student**.
3. **Search Records**: Type in the search box to instantly filter students by name or email.
4. **Filter by Course**: Select any course from the dropdown to query students via the `/api/students/course/{course}` endpoint.
5. **Edit Record**: Click the **pencil icon** on any student row, adjust their information, and click **Update Student**.
6. **Delete Record**: Click the **trash icon** on any student row and confirm deletion in the security modal.
7. **Feedback**: Real-time toast notifications will confirm each action or explain validation errors.
