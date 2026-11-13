package com.college.studentmanagement.repository;

import com.college.studentmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    // Find students enrolled in a specific course (case-insensitive for convenience)
    List<Student> findByCourseIgnoreCase(String course);
    
    // Check if email already exists for validation
    boolean existsByEmail(String email);
    
    // Check if email exists for another student id
    boolean existsByEmailAndIdNot(String email, Long id);
}
