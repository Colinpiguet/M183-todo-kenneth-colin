# Journal
Command to start application:
```Terminal
docker compose -f compose.node.yaml up
```
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

