'use strict';

module.exports = function toCompletedRoutes(routes) {

  if (!Array.isArray(routes)) {
    return Object.keys(routes)
      .map(function(route) {

        const template = routes[route].template ? routes[route].template : routes[route];
        const spm = routes[route].template ? routes[route].spm : null;

        return {
          route: route,
          dataPath: route,
          template: template,
          spm: spm
        };
      });
  }
  return routes;
};
