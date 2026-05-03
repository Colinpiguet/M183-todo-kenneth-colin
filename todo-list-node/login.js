const db = require("./fw/db");

const QUIZ_THRESHOLD = 3; // Show quiz after 3 failed attempts
const QUIZ_QUESTION = "What is 1 + 3?";
const QUIZ_ANSWER = "4";

async function handleLogin(req) {
  let msg = "";
  let user = { username: "", userid: 0 };
  let loginData =
    req.body && Object.keys(req.body).length > 0 ? req.body : req.query;

  // Initialize session states if not set
  if (typeof req.session.failedAttempts === "undefined") {
    req.session.failedAttempts = 0;
  }
  if (typeof req.session.quizRequired === "undefined") {
    req.session.quizRequired = false;
  }
  if (typeof req.session.quizPassed === "undefined") {
    req.session.quizPassed = false;
  }

  // If form is submitted with credentials
  if (
    typeof loginData.username !== "undefined" &&
    typeof loginData.password !== "undefined"
  ) {
    // Step 1: Check if quiz is required but not yet passed
    if (req.session.quizRequired && !req.session.quizPassed) {
      // User must answer quiz first
      if (typeof loginData.quizAnswer === "undefined" || loginData.quizAnswer.trim() === "") {
        msg = '<div class="alert alert-error">Please answer the security question to continue</div>';
        return { html: msg + getHtml(req), user: user };
      }

      // Validate quiz answer
      if (loginData.quizAnswer.trim() !== QUIZ_ANSWER) {
        msg = '<div class="alert alert-error">Wrong answer. Please try again.</div>';
        return { html: msg + getHtml(req), user: user };
      }

      // Quiz answer is correct - mark quiz as passed and continue with login
      req.session.quizPassed = true;
    }

    // Step 2: Validate credentials
    let result = await validateLogin(loginData.username, loginData.password);

    if (result.valid) {
      // Login credentials are correct
      user.username = loginData.username;
      user.userid = result.userId;
      
      // Reset all security counters on successful login
      req.session.failedAttempts = 0;
      req.session.quizRequired = false;
      req.session.quizPassed = false;
      
      msg = result.msg; // "login correct"
      // Note: The user object will be returned and startUserSession will be called
    } else {
      // Login credentials are incorrect
      msg = '<div class="alert alert-error">' + result.msg + '</div>';
      
      // Increment failed attempts
      req.session.failedAttempts++;
      
      // If threshold reached, require quiz on next attempt
      if (req.session.failedAttempts >= QUIZ_THRESHOLD) {
        req.session.quizRequired = true;
        req.session.quizPassed = false;
        msg += '<div class="alert alert-warning" style="margin-top: 10px;">⚠️ For security, you must answer a security question on your next attempt.</div>';
      }
    }
  }

  return { html: msg + getHtml(req), user: user };
}

async function startUserSession(req, res, user) {
  await new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) {
        reject(err);
        return;
      }

      req.session.user = user;
      resolve();
    });
  });

  res.redirect("/");
}

async function validateLogin(username, password) {
  let result = { valid: false, msg: "Invalid username or password", userId: 0 };
  const GENERIC_ERROR_MSG = "Invalid username or password";
  const BRUTE_FORCE_DELAY_MS = 2000; // Delay in milliseconds to slow down brute force attacks

  // Connect to the database
  const dbConnection = await db.connectDB();

  try {
    const [results, fields] = await dbConnection.execute(
      "SELECT id, username, password FROM users WHERE username = ?",
      [username],
    );

    if (results.length > 0) {
      // Bind the result variables
      let db_id = results[0].id;
      let db_password = results[0].password;

      // Verify the password
      if (password == db_password) {
        result.userId = db_id;
        result.valid = true;
        result.msg = "login correct";
        // LOGIN LOGGING: Log successful login
        console.log("SUCCESS login:", username, new Date());
      } else {
        // Password is incorrect - use generic error message
        result.msg = GENERIC_ERROR_MSG;
        // LOGIN LOGGING: Log failed login (incorrect password)
        console.log("FAILED login:", username, new Date());
      }
    } else {
      // Username does not exist - use generic error message
      result.msg = GENERIC_ERROR_MSG;
      // LOGIN LOGGING: Log failed login (username not found)
      console.log("FAILED login:", username, new Date());
    }
  } catch (err) {
    console.log(err);
  }

  // Add delay before returning to slow down brute force attacks
  await new Promise((resolve) => setTimeout(resolve, BRUTE_FORCE_DELAY_MS));

  return result;
}

function getHtml(req) {
  let failedAttempts = (req && req.session && req.session.failedAttempts) ? req.session.failedAttempts : 0;
  let quizRequired = (req && req.session && req.session.quizRequired) ? req.session.quizRequired : false;
  let quizPassed = (req && req.session && req.session.quizPassed) ? req.session.quizPassed : false;
  
  // Determine what step we're on
  let quizFieldHtml = "";
  let warningHtml = "";
  
  if (quizRequired && !quizPassed) {
    // Quiz required but not yet passed - show quiz field
    warningHtml = `
      <div class="alert alert-warning" style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
        <strong>⚠️ Security Check Required:</strong> Please answer the security question below.
      </div>`;
    
    quizFieldHtml = `
      <div class="form-group" style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px; border-left: 4px solid #ffc107;">
        <label for="quizAnswer"><strong>Security Question:</strong> ${QUIZ_QUESTION}</label>
        <input type="text" class="form-control size-medium" name="quizAnswer" id="quizAnswer" placeholder="Your answer" required>
      </div>`;
  } else if (failedAttempts >= QUIZ_THRESHOLD && (!quizRequired || quizPassed)) {
    // Quiz was passed or threshold reached - show info
    warningHtml = `
      <div class="alert alert-info" style="background-color: #d1ecf1; border: 1px solid #0c5460; padding: 10px; margin-bottom: 15px; border-radius: 4px; color: #0c5460;">
        ℹ️ Security check passed. You can now login with your credentials.
      </div>`;
  }
  
  return `
    <h2>Login</h2>
    ${warningHtml}

    <form id="loginForm" method="post" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username" autocomplete="username" required>
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password" autocomplete="current-password" required>
        </div>
        ${quizFieldHtml}
        <div class="form-group">
            <label for="submit" ></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>`;
}

module.exports = {
  getHtml: getHtml,
  handleLogin: handleLogin,
  startUserSession: startUserSession,
};
