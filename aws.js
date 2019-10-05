const fs = require('fs');
const shell = require('shelljs');

class AWS {

    constructor(arnMfa, profile, credentialsPath, token) {
        this.arnMfa = arnMfa;
        this.profile = profile;
        this.credentialsPath = credentialsPath;
        this.token = token;
        this.credentials = '';
    }

    fetchCreds() {
        return new Promise((resolve, reject) => {
            let command = `aws sts get-session-token --serial-number ${this.arnMfa} --token-code ${this.token}`;
            shell.exec(command, { silent: true }, (code, stdout, stderr) => {
                if(stderr) {
                    reject(stderr);
                }
                else {
                    try {
                        this.credentials = JSON.parse(stdout);
                        resolve();
                    }
                    catch(err) {
                        reject(err);
                    }
                }
            });
        });
    }

    async setCreds() {
        try {
            let file = await this.readFile();
            let data = await this.modifyFile(file);
            await this.writeToFile(data);
            return Promise.resolve();
        }
        catch(err) {
            return Promise.reject(err);
        }
    }

    readFile() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.credentialsPath, (err, data) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(data.toString().split('\n'));
                }
            });
        });
    }

    modifyFile(data) {

        let profile = this.profile ? this.profile : 'default';

        let pos = data.indexOf(`[${profile}]`);
        if(pos == -1) {
            data.push('');
            data.push('');
            data.push(`[${this.profile}]`);
            data.push('output = json');
            data.push('region = us-west-2');
            data.push(`aws_access_key_id = ${this.credentials.Credentials.AccessKeyId}`);
            data.push(`aws_secret_access_key = ${this.credentials.Credentials.SecretAccessKey}`);
            data.push(`aws_session_token = ${this.credentials.Credentials.SessionToken}`);
        }
        else {
            if(profile == 'default') {
                data[pos+1] = `aws_access_key_id = ${this.credentials.Credentials.AccessKeyId}`;
                data[pos+2] = `aws_secret_access_key = ${this.credentials.Credentials.SecretAccessKey}`;
                data[pos+3] = `aws_session_token = ${this.credentials.Credentials.SessionToken}`;
            }
            else {
                data[pos+3] = `aws_access_key_id = ${this.credentials.Credentials.AccessKeyId}`;
                data[pos+4] = `aws_secret_access_key = ${this.credentials.Credentials.SecretAccessKey}`;
                data[pos+5] = `aws_session_token = ${this.credentials.Credentials.SessionToken}`;
            }
        }
        return data;
    }

    writeToFile(data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.credentialsPath, data.join('\n'), (err, data) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}


module.exports = AWS;
