var keystone = require('keystone');
var async = require('async');
var fastFeed = require('fast-feed');
var http = require('http');

var feedOptions = {
	// Cache feeds for five minutes
	cacheDuration: 1000 * 60 * 5
};

var feeds = [
	{
		name: 'announcements',
		hostname: 'forum.nationalgocenter.org',
		path: '/category/1.rss'
	},
	{
		name: 'events',
		hostname: 'forum.nationalgocenter.org',
		path: '/category/9.rss'
	}
];

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

	locals.data = {
		posts: [],
	};

	view.on('init', function (next) {
		var q = keystone.list('Post').paginate({
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('author categories');

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});
	});
	
	// Get recent items from the NGC's forum via RSS feed
	view.on('init', function (next) {
		var i = 0;
		
		function fetchFeed(feed, callback) {
			if (
				!feed.lastFetched
				|| Date.now() > feed.lastFetched + feedOptions.cacheDuration
			) {
				var req = http.request({
					hostname: feed.hostname,
					port: '80',
					path: feed.path,
					method: 'GET'
				}, function (res) {
					res.setEncoding('utf8');
					var xmlString = '';
					res.on('data', function (chunk) {
						xmlString += chunk;
					});

					res.on('end', function () {
						feed.xmlString = xmlString;
						feed.data = fastFeed.parse(xmlString);
						feed.lastFetched = Date.now();
						locals.data[feed.name] = feed.data;
						callback();
					});
				});

				req.on('error', function (e) {
					callback(e);
				});

				req.end();
			} else {
				locals.data[feed.name] = feed.data;
				callback();
			}
		}
		
		function feedCallback() {
			i += 1;
			if (i >= feeds.length) {
				next();
			} else {
				fetchFeed(feeds[i], feedCallback);
			}
		}
		
		if (feeds.length) {
			fetchFeed(feeds[i], feedCallback);
		} else {
			next();
		}
	});

	// Render the view
	view.render('index');
};
