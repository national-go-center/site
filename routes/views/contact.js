var keystone = require('keystone');
var Enquiry = keystone.list('Enquiry');
var request = require('request');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'contact';
	locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
	locals.formData = req.body || {};
	locals.validationErrors = {};
	locals.enquirySubmitted = false;
	locals.noHumanProof = undefined;
	locals.notARobot = undefined;

	// On POST requests, add the Enquiry item to the database
	view.on('post', { action: 'contact' }, function (next) {
		var recaptchaResponse = req.body['g-recaptcha-response'];

		if (!recaptchaResponse) {
			locals.noHumanProof = true;
			next();
		} else {
			request.post({
				url: 'https://www.google.com/recaptcha/api/siteverify',
				form: {
					secret: '6LdgWVMUAAAAAOfQazyOHm0AdjLB3ZDuX7g3XRTd',
					response: recaptchaResponse
				}
			}, function (error, response, body) {
				body = JSON.parse(body);

				if (body.success === true) {
					var newEnquiry = new Enquiry.model();
					var updater = newEnquiry.getUpdateHandler(req);

					updater.process(req.body, {
						flashErrors: true,
						fields: 'name, email, phone, enquiryType, message',
						errorMessage: 'There was a problem submitting your enquiry:',
					}, function (err) {
						if (err) {
							locals.validationErrors = err.errors;
						} else {
							locals.enquirySubmitted = true;
						}
						next();
					});

				} else {
					locals.notARobot = false;
					next();
				}
			});
		}
	});

	view.render('contact');
};
