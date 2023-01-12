const fs = require('fs');

const fileName = "/usr/src/app/resources/emails.txt";

async function handleFile() {
    try {
        const data = await new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
        let lines = data.split('\n');
        return lines;
    } catch (err) {
        throw err;
    }
}


module.exports = {
    handleFile
}

