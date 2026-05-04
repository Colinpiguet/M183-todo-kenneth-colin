# Journal
We wrote this journal to keep track of what we did in the different phases.

- [Phase 1](#phase-1)
- [Phase 2](#phase-2)
- [Phase 3](#phase-3)


Command to start application:
```Terminal
docker compose -f compose.node.yaml up
```

# Phase 1
### What we did
- First decision we had to make was if we want Node or php application. -> We heard some bad stuff about php so we decided on node.
- Set up the Node.js TODO application using Docker
- Resolve problems with docker (didn't work on one computer)
- Successfully started the app and accessed it via localhost

- Spent some time trying to find login credentials -> we tried accessing database and then use sql queries to get data out of tables -> didn't work
- Eventually found it inside the SQL file
- Logged into the application

### Findings (security issues / observations)
Since we both aren't fluent in Node we decided it would be best to learn some basics and for that we did like small online course and watched some youtube videos. Once we knew some of the basics it was time to go through code a bit and try to understand it. While doing so with the help of manually testing the application we found some security issues.
- Login system uses plain SQL queries with user input (possible SQL injection)
- Authentication is based only on cookies (no real session validation)
- UserID is stored in cookies and can potentially be manipulated
- Passwords appear to be stored in plaintext (no encryption)
- Application is not safe from brute force attacks. (no limit on login tries)
- userId is logged in console.

### What worked / what didn’t
- Application setup and login worked correctly
- SQL injection attempt in login did not work as expected

### Next steps
- Test other parts of the application for SQL injection (search, tasks)
- Test cookie manipulation for authorization bypass
- Start documenting vulnerabilities properly
- Plan fixes for authentication and SQL queries

### Findings in further detail
#### UserId in cookies
Since userId is stored in cookies you can manually edit it and enter another user id. And once you reload it you can see tasks of other users.
<img width="2255" height="654" alt="image" src="https://github.com/user-attachments/assets/42bddaf4-170c-4118-9c5a-c6a247adb25c" />

#### SQL injection
### SQL Injection (Login)
The login query is built using direct user input:

```js
const sql = `SELECT id, username, password FROM users WHERE username='`+username+`'`;
```
This can lead to SQL injection vulnerabilities.
Inputs like: **' OR 1=1 --** caused unexpected behavior (e.g. errors or failed login), showing that input affects the SQL query.
We came to conclusion that even though login bypass was not successful, the query is still vulnerable because it uses unsanitized input.

To fix this we read that we could use parameterized queries:

### Some fixes
- Added parameterized query to fix sql injection.
- userId stored in cookies (before) -> Auth fix → Server-side Sessions (after)
- Quick UI fix to hide password in user login(...)

## Authorization Testing

### Findings
- Access control issue in `/edit?id=...`
- Task deletion previously not properly restricted by user ownership

### Test Scenario
User1 created a task (ID: 4).  
After logging out and switching to User2, the user accessed the task edit page.

By manually changing the URL from:
`/edit?id=1` → `/edit?id=4`

User2 was able to view another user's task details.

### Fix Applied
Implemented authorization checks on all task-related operations.

Previously, tasks were accessed using only the task ID.  
Now, all queries include both:
- task ID
- userID from the session

This ensures that users can only access and modify their own tasks.

### New feature: login logging
Implemented logging of login attempts.

Both successful and failed logins are now recorded with timestamp and username.

This helps detect suspicious activity and improves monitoring.

Phase 1 complete...
# Phase 2
[Testing protocol](testing-protocol.md)

# Phase 3
## Phase 3 – Feedback on Test Report

After reviewing the test report, we analyzed the identified vulnerabilities and evaluated their impact on the application.

The report correctly identified several important security issues:

- Broken access control on admin routes
- Cross-Site Scripting (XSS) vulnerability in task titles
- Missing protection against brute force attacks

What we will do:
- We will add role-based access control to restrict admin pages to authorized users only
- We will fix XSS by escaping user input before rendering it in the browser
- Brute force: We will add a delay after logging and a quiz to ensure it's not a robot logging in. 
  
## How we fixed it
### Fix: Admin Access Control

#### Before
The `/admin/users` route only checked if a user was logged in and not what role the user had.

To fix this problem: we added a role check using the session:
```js
 req.session.user.role !== 'admin'
```
So if the current users session role isn't admin we just send a response back that Access is denied.

### XSS Fix Verification

Before the fix, entering `<script>alert(1)</script>` as a task title triggered a popup when viewing the task list.

After implementing output escaping, the same input is displayed as plain text and no script is executed.

This confirms that the XSS vulnerability has been successfully mitigated.

### Fix: Login Security Improvements

Improved login security by implementing a generic error message and basic brute force protection.

All login failures now return:
"Invalid username or password"

Additionally, a short delay (~2000ms) was introduced for each login attempt to slow down automated attacks.

Server-side logging still records the actual reason for failed logins for monitoring purposes.

This prevents username enumeration and reduces the effectiveness of brute force attacks.

<img width="1309" height="677" alt="image" src="https://github.com/user-attachments/assets/f90ac71d-7d26-44f2-95da-d7992831cf86" />


### Feature: Login Security Quiz (Brute Force Protection)

Implemented an additional security layer in the login process to mitigate brute force attacks.

After multiple failed login attempts, the system triggers a verification step where the user must solve a simple math question before continuing the login process.

If the answer is correct, the login process continues normally. If incorrect, access is denied and the user must retry.

This feature improves resistance against automated login attempts by introducing a manual verification step after repeated failures.
<img width="1645" height="594" alt="image" src="https://github.com/user-attachments/assets/4b78c6bd-d19e-4427-82fc-77caf3ac3f6f" />


---

### AI-usage

During this project, AI tools (ChatGPT) were used in the following areas:

- **Security analysis support:** Identification and explanation of vulnerabilities such as SQL injection, XSS, broken authorization, and insecure session handling.
- **Fix suggestions:** Assistance in designing secure implementations (e.g. parameterized queries, session-based authentication, authorization checks).
- **Code structure guidance:** Help in understanding and improving Express.js routing and MySQL query handling.
- **Feature design:** Support in designing the login quiz mechanism as a brute force mitigation technique.
- **Documentation support:** Assistance in writing journal entries, commit messages, and test documentation.

AI was NOT used to fully generate the final application, but rather as a support tool for understanding, improving, and structuring security-related changes.

All implementations were reviewed, adapted, and tested manually in the running application.

