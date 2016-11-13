var keystone = require('keystone');
var async = require('async');
var fastFeed = require('fast-feed');
var http = require('http');

var forumFeed = {
	// Cache the feed for five minutes
	cacheDuration: 1000 * 60 * 5
};

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
		// If we haven't fetched the feed yet, or the cache has expired, fetch it now
		if (
			!forumFeed.lastFetched
			|| Date.now() > forumFeed.lastFetched + forumFeed.cacheDuration
		) {
			var req = http.request({
				hostname: 'forum.nationalgocenter.org',
				port: '80',
				path: '/category/1.rss',
				method: 'GET'
			}, function (res) {
				res.setEncoding('utf8');
				var xmlString = '';
				res.on('data', function (chunk) {
					xmlString += chunk;
				});

				res.on('end', function () {
					forumFeed.xmlString = xmlString;
					forumFeed.data = fastFeed.parse(xmlString);
					forumFeed.lastFetched = Date.now();
					locals.data.forumFeed = forumFeed;
					next();
				});
			});

			req.on('error', function (e) {
				next(e);
			});
			
			req.end();
		} else {
			locals.data.forumFeed = forumFeed;
			next();
		}
	});

	// Render the view
	view.render('index');
};
