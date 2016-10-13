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
/*
export function log(message?: any, ...optionalParams: any[]) {
    return (x) => {
        console.log(message, ...optionalParams);
        return x;
    }
}
*/
//# sourceMappingURL=common.js.map