const db = require("./fw/db");

async function handleLogin(req) {
  let msg = "";
  let user = { username: "", userid: 0 };
  let loginData =
    req.body && Object.keys(req.body).length > 0 ? req.body : req.query;

  if (
    typeof loginData.username !== "undefined" &&
    typeof loginData.password !== "undefined"
  ) {
    // Get username and password from the form and call the validateLogin
    let result = await validateLogin(loginData.username, loginData.password);

    if (result.valid) {
      // Login is correct. Store user information to be returned.
      user.username = loginData.username;
      user.userid = result.userId;
      msg = result.msg;
    } else {
      msg = result.msg;
    }
  }

  return { html: msg + getHtml(), user: user };
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
  let result = { valid: false, msg: "", userId: 0 };

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
        // Password is incorrect
        result.msg = "Incorrect password";
        // LOGIN LOGGING: Log failed login (incorrect password)
        console.log("FAILED login:", username, new Date());
      }
    } else {
      // Username does not exist
      result.msg = "Username does not exist";
      // LOGIN LOGGING: Log failed login (username not found)
      console.log("FAILED login:", username, new Date());
    }
  } catch (err) {
    console.log(err);
  }

  return result;
}

function getHtml() {
  return `
    <h2>Login</h2>

    <form id="form" method="post" action="/login">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password">
        </div>
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
