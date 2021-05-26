const config=require("./webpack.config")
const Webpack=require("./lib/webpack")
new Webpack(config).run()