# Penetration Test Report – TODO Application

Module: M183  
Team: Kenneth & Colin  
Date: 02.05

---

## 1. Introduction

In this report, the TODO application is tested for potential security vulnerabilities.

The goal of this phase is to identify weaknesses in the application after implementing security fixes in Phase 1. The tests are performed from an attacker's perspective.

---

## 2. Test Cases
### Test Case 1: Authorization Bypass (Edit Task)

Test ID: TC-01

Objective:  
Verify that a user cannot access or edit tasks belonging to another user.

Steps:
- Login as admin1
- Create a task (e.g. ID = 5)
- Logout and login as User1
- Manually change URL: `/edit?id=5`

**Result:**
Access was denied.

Conclusion:  
The vulnerability is fixed. Authorization checks correctly prevent access to other users tasks.

Screenshots:

**Admin1 creats tasks with id5:**
<img width="998" height="550" alt="image" src="https://github.com/user-attachments/assets/65303f7b-ab52-4eeb-a873-c97ea42dcec5" />
**User1 tries accessing task with id 5 via edit page:**
<img width="1432" height="296" alt="image" src="https://github.com/user-attachments/assets/889cea3e-1d83-4a49-b13c-94f41f2fcbdc" />

---

### Test Case 2: Unauthorized Task Deletion

Test ID: TC-02

Objective:  
Check whether a user can delete tasks of another user.

Steps:
- Login as admin1
- Create a task
- Logout and login as User1
- Attempt to delete the task using its ID

Result:  
Deletion was not possible.

Conclusion:  
The application correctly restricts delete operations to the task owner.

Screenshot:  

**Admin1 creates a task with id7 (see list)**
<img width="809" height="375" alt="image" src="https://github.com/user-attachments/assets/678d31b9-d8f8-4439-a437-87929885f1ef" />

**user1 tries deleting via id**
<img width="1449" height="432" alt="image" src="https://github.com/user-attachments/assets/dcaea63a-65b8-4858-a9e0-eec7d4b0c506" />


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
**Try to use sql injection in login page**
<img width="1000" height="272" alt="image" src="https://github.com/user-attachments/assets/35bff3e2-e598-47b8-84a7-bd2d04fee802" />

**Displays "Username does not exist" message**
<img width="1028" height="341" alt="image" src="https://github.com/user-attachments/assets/5b2bcd81-f33c-4b35-a512-663d9f195e7f" />


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
