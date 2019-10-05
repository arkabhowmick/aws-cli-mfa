const AWS = require('./aws');
const utils = require('./utils');


(async () => {
    
    /* Fetch details from config file */
    let config = await utils.fetchConfig();
    if(config) {
        /* If config is present, fetch inputs from user */
        let input = await utils.getInputs();
        
        /* If input is present */
        if(input) {

            try {
                /* Create an instance of AWS */
                const aws = new AWS(config.arn_mfa, config.profile, config.credentials_file_path, input.token);
                /* Fetch the credentials */
                await aws.fetchCreds();
                /* Set the credentials */
                await aws.setCreds();
            }
            catch(err) {
                console.log(err);
            }
        }
    }

})();


