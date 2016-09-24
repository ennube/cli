
export function send(request: (()=>any)) {
    return new Promise((resolve, reject) => {
        request()
        .on('success', (response) => resolve(response.data) )
        .on('error', (response) => reject(response) )
        .send();
    });
}
/*
export function log(message?: any, ...optionalParams: any[]) {
    return (x) => {
        console.log(message, ...optionalParams);
        return x;
    }
}
*/
