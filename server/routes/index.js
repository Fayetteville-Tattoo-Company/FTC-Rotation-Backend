module.exports = (routes) => {
  require('./users')(routes);
  require('./appointments')(routes);
}