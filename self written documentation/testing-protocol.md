# Penetration Test Report – TODO Application

Module: M183  
Team: Kenneth & Colin  
Date: [heutiges Datum]

---

## 1. Introduction

In this report, the TODO application is tested for potential security vulnerabilities.

The goal of this phase is to identify weaknesses in the application after implementing security fixes in Phase 1. The tests are performed from an attacker's perspective.

---

## 2. Test Cases

---

### Test Case 1: Authorization Bypass (Edit Task)

Test ID: TC-01

Objective:  
Verify that a user cannot access or edit tasks belonging to another user.

Steps:
- Login as User1
- Create a task (e.g. ID = 4)
- Logout and login as User2
- Manually change URL: `/edit?id=4`

Result:  
Access was denied.

Conclusion:  
The vulnerability is fixed. Authorization checks correctly prevent access to чуж tasks.

Screenshot:  
(Insert screenshot here)

---

### Test Case 2: Unauthorized Task Deletion

Test ID: TC-02

Objective:  
Check whether a user can delete tasks of another user.

Steps:
- Login as User1
- Create a task
- Logout and login as User2
- Attempt to delete the task using its ID

Result:  
Deletion was not possible.

Conclusion:  
The application correctly restricts delete operations to the task owner.

Screenshot:  
(Insert screenshot here)

---

### Test Case 3: SQL Injection (Login)

Test ID: TC-03

Objective:  
Test if login is vulnerable to SQL injection.

Steps:
- Enter username: `' OR 1=1 --`
- Enter any password

Result:  
Login failed.

Conclusion:  
SQL injection is no longer possible due to the use of parameterized queries.

Screenshot:  
(Insert screenshot here)

---

### Test Case 4: Cross-Site Scripting (XSS)

Test ID: TC-04

Objective:  
Check if user input is properly sanitized.

Steps:
- Create a task with title: `<script>alert(1)</script>`

Result:  
[Describe what happened – popup or not]

Conclusion:  
[If popup appears → Vulnerable]  
[If not → Not vulnerable]

Screenshot:  
(Insert screenshot here)

---

### Test Case 5: Admin Access Control

Test ID: TC-05

Objective:  
Check if unauthorized users can access admin functionality.

Steps:
- Login as normal user
- Navigate to `/admin/users`

Result:  
[Access granted or denied]

Conclusion:  
[If accessible → Vulnerability]  
[If blocked → Secure]

Screenshot:  
(Insert screenshot here)

---

### Test Case 6: Brute Force Attack (FAILED TEST)

Test ID: TC-06

Objective:  
Check if login is protected against brute force attacks.

Steps:
- Repeatedly attempt login with wrong credentials

Result:  
Unlimited attempts possible.

Conclusion:  
The application is vulnerable to brute force attacks, as there is no rate limiting or account lockout mechanism.

Screenshot:  
(Insert screenshot here)

---

### Test Case 7: Session Handling

Test ID: TC-07

Objective:  
Verify if session handling is secure.

Steps:
- Login as user
- Observe session behavior
- Try reusing session after logout

Result:  
Sessions are handled server-side.

Conclusion:  
Session security is improved compared to Phase 1.

---

## 3. Summary

Most critical vulnerabilities from Phase 1 (SQL Injection, Authentication, Authorization) have been successfully fixed.

However, some weaknesses still remain:
- No protection against brute force attacks
- Potential XSS issues depending on input handling
- Admin access control should be verified more strictly

Overall, the application is significantly more secure, but further improvements are recommended.

---