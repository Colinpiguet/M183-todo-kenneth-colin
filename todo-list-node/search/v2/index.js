const db = require('../../fw/db');
const { escapeHtml } = require('../../fw/db');

async function search(req) {
    if (req.query.terms === undefined){
        return "Not enough information to search";
    }

    let terms = req.query.terms;
    let userid = req.session.user.userid;
    let result = '';

    let stmt = await db.executeStatement("select ID, title, state from tasks where userID = ? and title like ?", [userid, `%${terms}%`]);
    if (stmt.length > 0) {
        stmt.forEach(function(row) {
            result += escapeHtml(row.title)+' ('+escapeHtml(row.state)+')<br />';
        });
    }

    return result;
}

module.exports = {
    search: search
};