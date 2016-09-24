"use strict";
function send(request) {
    return new Promise(function (resolve, reject) {
        request()
            .on('success', function (response) { return resolve(response.data); })
            .on('error', function (response) { return reject(response); })
            .send();
    });
}
exports.send = send;
//# sourceMappingURL=common.js.map