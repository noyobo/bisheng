'use strict';

const fs = require('fs');
const path = require('path');

const defaultConfig = {
  source: './posts',
  sourceIgnore: [],
  output: './_site',
  theme: './_theme',
  htmlTemplate: path.join(__dirname, '../template.html'),
  port: 8000,
  root: '/',
  plugins: [],
  doraConfig: {},
  webpackConfig(config) {
    return config;
  },
};

const pluginHighlight = path.join(__dirname, '..', 'bisheng-plugin-highlight');

function isRelative(filepath) {
  return filepath.charAt(0) === '.';
}

module.exports = function getConfig(configFile) {
  const customizedConfig = fs.existsSync(configFile) ? require(configFile) : {};
  const config = Object.assign({}, defaultConfig, customizedConfig);
  config.plugins = [pluginHighlight].concat(config.plugins.map(
    (plugin) => isRelative(plugin) ? path.join(process.cwd(), plugin) : plugin
  ));
  return config;
};
