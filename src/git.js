const child_process = require('child_process');
module.exports = {
    branch: function() {
        return child_process.execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    }
}
