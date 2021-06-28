const Busboy = require('busboy');
const { base64decode } = require('nodejs-base64');

module.exports.parse = async event => {
  const contentType =
    event.headers['Content-Type'] || event.headers['content-type'];

  if (contentType === 'application/json') {
    if (event.isBase64Encoded) {
      event.body = base64decode(event.body);
    }

    return JSON.parse(event.body);
  }

  const busboy = new Busboy({ headers: { 'content-type': contentType } });

  return new Promise((resolve, reject) => {
    const result = {};

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('data', data => {
        result[fieldname] = {};
        result[fieldname] = {
          data,
          filename,
          contentType: mimetype
        };
      });
    });

    busboy.on('field', (fieldname, value) => {
      result[fieldname] = value;
    });

    busboy.on('error', error => reject(error));
    busboy.on('finish', () => resolve(result));

    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    busboy.end();
  });
};
