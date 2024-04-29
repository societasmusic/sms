var json2xml = require('json2xml');

exports.downloadXmlResource = (res, fileName, data) => {
    const xml = json2xml(data, {header: true});
    res.header('Content-Type', 'text/xml');
    res.attachment(fileName);
    return res.send(xml);
};