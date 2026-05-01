const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const header = require("./fw/header");
const footer = require("./fw/footer");
const login = require("./login");
const index = require("./index");
const adminUser = require("./admin/users");
const editTask = require("./edit");
const saveTask = require("./savetask");
const deleteTask = require("./delete");
const search = require("./search");
const searchProvider = require("./search/v2/index");

const app = express();
const PORT = 3000;

// Middleware für Session-Handling
app.use(
  session({
    secret: "lb2-node-auth-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

// Middleware für Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Routen
app.get("/", async (req, res) => {
  if (activeUserSession(req)) {
    let html = await wrapContent(await index.html(req), req);
    res.send(html);
  } else {
    res.redirect("login");
  }
});

app.post("/", async (req, res) => {
  if (activeUserSession(req)) {
    let html = await wrapContent(await index.html(req), req);
    res.send(html);
  } else {
    res.redirect("login");
  }
});

// edit task
app.get("/admin/users", async (req, res) => {
  if (activeUserSession(req)) {
    let html = await wrapContent(await adminUser.html(req), req);
    res.send(html);
  } else {
    res.redirect("/");
  }
});

// edit task
app.get("/edit", async (req, res) => {
  if (activeUserSession(req)) {
    let html = await wrapContent(await editTask.html(req), req);
    res.send(html);
  } else {
    res.redirect("/");
  }
});

// Login-Seite anzeigen
app.get("/login", async (req, res) => {
  if (activeUserSession(req)) {
    res.redirect("/");
    return;
  }

  let html = await wrapContent(login.getHtml(), req);
  res.send(html);
});

app.post("/login", async (req, res) => {
  try {
    let content = await login.handleLogin(req);

    if (content.user.userid !== 0) {
      await login.startUserSession(req, res, content.user);
    } else {
      let html = await wrapContent(content.html, req);
      res.send(html);
    }
  } catch (error) {
    res.status(500).send("Login failed");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// Profilseite anzeigen
app.get("/profile", (req, res) => {
  if (activeUserSession(req)) {
    res.send(
      `Welcome, ${req.session.user.username}! <a href="/logout">Logout</a>`,
    );
  } else {
    res.send("Please login to view this page");
  }
});

// save task
app.post("/savetask", async (req, res) => {
  if (activeUserSession(req)) {
    let html = await wrapContent(await saveTask.html(req), req);
    res.send(html);
  } else {
    res.redirect("/");
  }
});

// delete task - with authorization check
app.get("/delete", async (req, res) => {
  if (activeUserSession(req)) {
    let html = await wrapContent(await deleteTask.html(req), req);
    res.send(html);
  } else {
    res.redirect("/");
  }
});

// search
app.post("/search", async (req, res) => {
  if (!activeUserSession(req)) {
    res.redirect("/login");
    return;
  }

  let html = await search.html(req);
  res.send(html);
});

// search provider
app.get("/search/v2/", async (req, res) => {
  if (!activeUserSession(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  let result = await searchProvider.search(req);
  res.send(result);
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

async function wrapContent(content, req) {
  let headerHtml = await header(req);
  return headerHtml + content + footer;
}

function activeUserSession(req) {
  return (
    req.session !== undefined &&
    req.session.user !== undefined &&
    req.session.user.userid !== undefined &&
    req.session.user.userid !== 0
  );
}
