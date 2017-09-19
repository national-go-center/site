var keystone = require('keystone');
var async = require('async');
const request = require('request');
const chalk = require('chalk');
const _ = require('lodash');
const util = require('util');
const dateFns = require('date-fns');

let accessToken;
let cachedEvents;
let chachedTime;

function authenticateWildApricot () {
	return new Promise((resolve, reject) => {
		if (accessToken) {
			console.log('Using old accessToken', accessToken);
			resolve(accessToken);
		} else {
			request({
				url: 'https://oauth.wildapricot.org/auth/token',
				method: 'POST',
				auth: {
					user: 'APIKEY',
					pass: process.env.WA_API_KEY
				},
				form: {
					grant_type: 'client_credentials',
					scope: 'auto'
				}
			}, function (err, res) {
				if (err) {
					reject(err);
				}
				var json = JSON.parse(res.body);
				if (json.error) {
					reject(json.error);
				}
				console.log('json', json);
				console.log('New Access Token:', json.access_token);
				accessToken = json.access_token;
				resolve(accessToken);
			});
		}
	});
}

function getUpcomingEvents() {
	return new Promise((resolve, reject) => {
		let futureDate = new Date();
		futureDate = new Date(futureDate.setDate(futureDate.getDate() + 7));
		futureDate = dateFns.format(futureDate, 'YYYY-MM-DD');
		console.log(chalk.yellow(futureDate));

		request({
			url: 'https://api.wildapricot.org/v2/Accounts/228337/Events',
			method: 'GET',
			qs: {
				'$filter': `IsUpcoming eq true AND StartDate lt ${futureDate}`,
				includeEventDetails: true
			},
			auth: {
				bearer: accessToken
			}
		}, function (err, res, body) {
			if (err) {
				reject(err);
			}

			let json = JSON.parse(body);
			console.log('events', util.inspect(json, { depth: 4 }))
			let events = [];

			if (!_.get(json, 'Events', []).length) {
				resolve([]);
			} else {
				/*
				json.Events.forEach(event => {
					if (event.Tags.indexOf('canceled') === -1) {

						events.push(event);
					}
				});
				*/
				events = json.Events;

				// Sort events chronologically by start date
				events.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));

				const eventsByDate = {};
				events.forEach(event => {
					if (!eventsByDate[event.StartDate]) {
						eventsByDate[event.StartDate] = [];
					}

					eventsByDate[event.StartDate].push(event);
				});


				console.log('events', eventsByDate);
				resolve(eventsByDate);
			}

		});
	});
}


exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;
	locals.data = {};

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'kiosk';

	view.on('init', function (next) {
		console.log('kiosk init');
		console.log('process.env.WA_API_KEY', process.env.WA_API_KEY)
		authenticateWildApricot().then(token => {
			locals.data.token = token;
			next();
		}).catch(error => {
			console.log('error', error);
			next();
		});
	});

	// Render the view
	view.render('kiosk');
};
