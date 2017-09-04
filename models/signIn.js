var keystone = require('keystone');
var Email = require('keystone-email')
var Types = keystone.Field.Types;
var nodemailerConfig = require('../nodemailer.config.js');
var path = require('path');
var util = require('util');

/**
 * Enquiry Model
 * =============
 */

var Enquiry = new keystone.List('signIn', {
	nocreate: true,
	noedit: true,
});

Enquiry.add({
	name: { type: Types.Name, required: true },
	email: { type: Types.Email, required: true },
	phone: { type: String },
	createdAt: { type: Date, default: Date.now },
});

Enquiry.schema.pre('save', function (next) {
	this.wasNew = this.isNew;
	next();
});

Enquiry.schema.post('save', function () {
	if (this.wasNew) {
		this.sendNotificationEmail();
	}
});

Enquiry.schema.methods.sendNotificationEmail = function (callback) {
	if (typeof callback !== 'function') {
		callback = function (err, response) {
			/* Keep for debugging */
			console.log(util.inspect(err, {
				showHidden: false,
				depth: null,
				colors: true
			}));
			console.log(util.inspect(response, {
				depth: null,
				colors: true
			}));
		};
	}
	var enquiry = this;
	keystone.list('User').model.find().where('isAdmin', true).exec(function (err, admins) {
		if (err) return callback(err);
		Email.send('templates/emails/enquiry-notification.pug', {
			transport: 'nodemailer'
		}, {
			// Email locals
			// TODO: figure out the right way to get these
			_: require('lodash'),
			basedir: path.join(__dirname, '../', '/templates/helpers/emails'),
			logo_src: '/images/logo-email.gif',
			logo_width: 194,
			logo_height: 76,
			theme: {
				email_bg: '#f9f9f9',
				link_color: '#2697de',
				buttons: {
					color: '#fff',
					background_color: '#2697de',
					border_color: '#1a7cb7',
				},
			},
			enquiry: enquiry
		}, {
			to: admins,
			from: {
				name: 'National Go Center',
				email: 'contact@national-go-center.com',
			},
			subject: 'New sign in at National Go Center',
			nodemailerConfig: nodemailerConfig
		}, callback);
	});
};

Enquiry.defaultSort = '-createdAt';
Enquiry.defaultColumns = 'name, email, enquiryType, createdAt';
Enquiry.register();
