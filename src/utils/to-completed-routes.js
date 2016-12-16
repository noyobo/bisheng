'use strict';

module.exports = function toCompletedRoutes(routes) {

  if (!Array.isArray(routes)) {
    return Object.keys(routes)
      .map(function(route) {

        // 浏览器端的代码
        var template, spm;

        if (Object.prototype.toString.call(routes[route]) === '[object Object]') {
          template = routes[route].template;
          spm = routes[route].spm;
        } else {
          template = routes[route];
          spm = null;
        }

        return {
          route: route,
          dataPath: route,
          template: template,
          spm: spm,
        };
      });
  }
  return routes;
};
