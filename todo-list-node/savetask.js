const db = require("./fw/db");

async function getHtml(req) {
  let html = "";
  let taskId = "";

  // see if the id exists in the database
  if (req.body.id !== undefined && req.body.id.length !== 0) {
    taskId = req.body.id;
    let userid = req.session.user.userid;
    // Authorization check: ensure task belongs to current user
    let stmt = await db.executeStatement(
      "select ID, title, state from tasks where ID = ? AND userID = ?",
      [taskId, userid],
    );
    if (stmt.length === 0) {
      taskId = "";
    }
  }

  if (req.body.title !== undefined && req.body.state !== undefined) {
    let state = req.body.state;
    let title = req.body.title;
    let userid = req.session.user.userid;

    if (taskId === "") {
      stmt = db.executeStatement(
        "insert into tasks (title, state, userID) values (?, ?, ?)",
        [title, state, userid],
      );
    } else {
      // Authorization check: ensure task belongs to current user in UPDATE
      stmt = db.executeStatement(
        "update tasks set title = ?, state = ? where ID = ? AND userID = ?",
        [title, state, taskId, userid],
      );
    }

    html += "<span class='info info-success'>Update successfull</span>";
  } else {
    html += "<span class='info info-error'>No update was made</span>";
  }

  return html;
}

module.exports = { html: getHtml };
