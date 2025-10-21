const path = require('path');
const swcDefaultConfig = require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory().swcOptions;

module.exports = {
	entry: {
		main: './src/main.ts',
		"fib.worker": './src/fib/fib.worker.js',
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, 'dist'),
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js', '.json'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'swc-loader',
					options: swcDefaultConfig,
				},
			},
		],
	},
}