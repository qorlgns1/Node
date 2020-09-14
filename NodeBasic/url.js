const url = require('url');

const { URL } = url;
const myURL = new URL('http://cyberadam.cafe24.com/item/list');
console.log('new URL():', myURL);
console.log('url.format():', url.format(myURL));
console.log('------------------------------');
const parsedUrl = url.parse('http://cyberadam.cafe24.com/item/list');
console.log('url.parse():', parsedUrl);
console.log('url.format():', url.format(parsedUrl));
