const path = require("path");

module.exports = env => {
  return {
    mode: "development",
    context: path.join(__dirname, "./"),
    entry: "./app/app.jsx",
    output: {
      path: path.join(__dirname, "public"),
      filename: "bundle.js"
    },
    resolve: {
      extensions: [".js", ".jsx"]
    },
    devtool: 'inline-source-map',
    watch: !!env.local,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          },
          exclude: /node_modules/,
          include: path.join(__dirname, "app")
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ]
    }
  };
};
