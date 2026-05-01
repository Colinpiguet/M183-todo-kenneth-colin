const db = require("./fw/db");

async function deleteTask(req) {
  let html = "";
  let taskId = "";

  if (req.query.id !== undefined && req.query.id.length !== 0) {
    taskId = req.query.id;
    let userid = req.session.user.userid;

    // Execute DELETE with authorization check: ensure task belongs to current user
    let stmt = await db.executeStatement(
      "delete from tasks where ID = ? AND userID = ?",
      [taskId, userid],
    );

    // Check if the delete was successful (rowsAffected > 0)
    if (stmt.affectedRows && stmt.affectedRows > 0) {
      html +=
        "<span class='info info-success'>Task deleted successfully</span>";
    } else {
      // Either task doesn't exist or doesn't belong to user
      html +=
        "<span class='info info-error'>Unauthorized access or task not found</span>";
    }
  } else {
    html += "<span class='info info-error'>No task ID provided</span>";
  }

  return html;
}

module.exports = { html: deleteTask };
