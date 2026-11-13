package com.college.studentmanagement.service;

import com.college.studentmanagement.entity.Student;
import com.college.studentmanagement.exception.StudentNotFoundException;
import com.college.studentmanagement.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    // Constructor injection (no Lombok)
    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Get all students
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get student by ID
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException(id));
    }

    // Create new student
    public Student createStudent(Student student) {
        validateStudent(student);

        if (studentRepository.existsByEmail(student.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + student.getEmail());
        }

        // Ensure ID is null so database auto-generates it
        student.setId(null);
        return studentRepository.save(student);
    }

    // Update existing student
    public Student updateStudent(Long id, Student studentDetails) {
        Student existingStudent = getStudentById(id);
        validateStudent(studentDetails);

        if (studentRepository.existsByEmailAndIdNot(studentDetails.getEmail(), id)) {
            throw new IllegalArgumentException("Email already in use by another student: " + studentDetails.getEmail());
        }

        existingStudent.setName(studentDetails.getName().trim());
        existingStudent.setEmail(studentDetails.getEmail().trim());
        existingStudent.setCourse(studentDetails.getCourse().trim());
        existingStudent.setAge(studentDetails.getAge());

        return studentRepository.save(existingStudent);
    }

    // Delete student by ID
    public void deleteStudent(Long id) {
        Student student = getStudentById(id);
        studentRepository.delete(student);
    }

    // Get students by course
    public List<Student> getStudentsByCourse(String course) {
        if (course == null || course.trim().isEmpty()) {
            return studentRepository.findAll();
        }
        return studentRepository.findByCourseIgnoreCase(course.trim());
    }

    // Basic helper validation
    private void validateStudent(Student student) {
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Student name cannot be empty");
        }
        if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Student email cannot be empty");
        }
        if (!student.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (student.getCourse() == null || student.getCourse().trim().isEmpty()) {
            throw new IllegalArgumentException("Course cannot be empty");
        }
        if (student.getAge() == null || student.getAge() <= 0 || student.getAge() > 120) {
            throw new IllegalArgumentException("Age must be a valid positive number between 1 and 120");
        }
    }
}
