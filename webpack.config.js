var path = require("path");
var Dotenv = require("dotenv-webpack");

let config = {
	entry: "./src/index.js", // path to entry script
	output: {
		// configure to bundle output
		path: __dirname + "/dist",
		filename: "bundle.js",
		publicPath: "/",
	},
	devServer: {
		contentBase: "./", // where dev server should serve content from
		publicPath: "/dist/",
	},
	devtool: "source-map",
	plugins: [new Dotenv()],
	module: {
		// defining the actual behavior the webpack bundler
		rules: [
			{
				// pre-proecess all .js and .jsx files with babel-loader
				test: /\.(js|.jsx)$/, // file matching regex
				exclude: /node_modules/, // file matching regex
				use: ["babel-loader"], // processor dependency name
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: "file-loader",
					},
				],
			},
		],
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src/"),
		},
	},
};

module.exports = (env, argv) => {
	if (argv.mode === 'development') {
		config.devtool = 'eval';
	} else {
		config.devtool = 'source-map'
	}

	return config;
}