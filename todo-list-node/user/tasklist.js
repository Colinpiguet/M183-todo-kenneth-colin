const db = require('../fw/db');

async function getHtml(req) {
    let html = `
    <section id="list">
        <a href="edit">Create Task</a>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th></th>
            </tr>
    `;

    let conn = await db.connectDB();
    let [result, fields] = await conn.execute('select ID, title, state from tasks where UserID = ?', [req.session.user.userid]);
    result.forEach(function(row) {
        html += `
            <tr>
                <td>`+db.escapeHtml(row.ID.toString())+`</td>
                <td class="wide">`+db.escapeHtml(row.title)+`</td>
                <td>`+ucfirst(row.state)+`</td>
                <td>
                    <a href="edit?id=`+db.escapeHtml(row.ID.toString())+`">edit</a> | <a href="delete?id=`+db.escapeHtml(row.ID.toString())+`">delete</a>
                </td>
            </tr>`;
    });

    html += `
        </table>
    </section>`;

    return html;
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
    html: getHtml
}