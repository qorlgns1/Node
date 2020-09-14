const url = require('url');
const querystring = require('querystring');

const parsedUrl = url.parse('http://cyberadam.cafe24.com/item/detail?itemid=1');
const query = querystring.parse(parsedUrl.query);
console.log('querystring.parse():', query);
console.log('querystring.stringify():', querystring.stringify(query));
