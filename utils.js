const readline = require('readline');
const fs = require('fs');

module.exports = {
    getInputs : async function() {

        let input = {};

        try {

            input.token = await fetchInput('MFA Token : ');
            if(!input.token) 
                throw 'MFA Token is required.';

        }
        catch(err) {

            console.error(err);
            input = null;

        }
        finally {

            return Promise.resolve(input);

        }
    },
    fetchConfig : function() {
        return new Promise((resolve) => {
            let config = null;
            fs.readFile('config.json', (err, data) => {
                try {
                    if(err)
                        throw err;
                    else {
                        try {
                            config = JSON.parse(data.toString());
                        }
                        catch(err) {
                            throw 'Invalid config.';
                        }
                        if(!config.arn_mfa)
                            throw 'Please provide ARN of MFA device in config.';
                        if(!config.credentials_file_path)
                            throw 'Please provide AWS Credentials file path in config.';
                    }
                }
                catch(err) {
                    config = null;
                    console.log(err);
                }
                finally {
                    resolve(config);
                }
            });
        });
    }
};

function fetchInput(question) {
    return new Promise((resolve, reject) => {

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });

    });
}
