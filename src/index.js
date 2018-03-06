const app = require('./app');
const { info } = require('winston');

const { PORT = 4000 } = process.env;

app().listen(PORT, () => info(`App listening on port ${PORT}`));