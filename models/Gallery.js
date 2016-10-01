var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Gallery Model
 * =============
 */

var Gallery = new keystone.List('Gallery', {
	autokey: { from: 'name', path: 'key', unique: true },
});

Gallery.add({
	name: { type: String, required: true },
	publishedDate: { type: Date, default: Date.now },
	heroImage: { //These types will change in version 4 https://github.com/keystonejs/keystone/tree/master/lib/storage/adapters/fs
	   type: Types.LocalFile,
	   dest: './files/hero/',
       prefix: '/hero/',
       format: function(item, file) {
          return '<img src="' + file.href + '" >'
       }
    },
	images: { 
	   type: Types.LocalFiles,
	   dest: './files/gallery/',
       prefix: '/gallery/',
       format: function(item, file) {
          return '<img src="' + file.href + '" >'
       }
	},
});

Gallery.register();
