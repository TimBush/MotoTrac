const home = require('../routes/index');
const products = require('../routes/product')

module.exports = (app) => {
    app.use('/', home);
    app.use('/product', products);
}