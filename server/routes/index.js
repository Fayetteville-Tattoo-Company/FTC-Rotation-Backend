module.exports = (routes) => {
  require('./users')(routes);
  require('./appointments')(routes);
  require('./settings')(routes);
  require('./images')(routes);
}