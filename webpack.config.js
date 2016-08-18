module.exports = {
	entry: './src/js/entry.js',
	output: {
		path: './public/js/',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				loader: 'babel',
				query: {
					presets: ['es2015']
				}
			}
		]
	}
};
