/*
 Rename to nodemailer.config.js and add the api_key, which you can get from Nate Eagle
 */

var smtpConfig = {
	transport: 'SendGrid',
	auth: {
		api_key: ''
	},
};

module.exports = smtpConfig;
