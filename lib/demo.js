exports.add = (a, b) => {
    return a + b;
}

exports.addCallBack = (a, b, callback) => {
    setTimeout(() => {
        return callback(null, a + b);
    }, 500);
}

exports.addPromise = (a, b) => {
    // return Promise.reject('fake');
    return Promise.resolve(a + b);
}

// spy on log
exports.foo = () => {
    console.log('console.log was called');
    console.warn('console.warn was called');

    return;
}

// stub createfile
exports.bar = async (fileName) => {
    await exports.createFile(fileName);
    const result = await callDb(fileName);

    return result;
}

exports.createFile = (fileName) => {
    console.log('--in createFile');
    // fake create file
    return new Promise((resolve => {
        setTimeout(() => {
            console.log('fake file created');
            return Promise.resolve('done');
        }, 100);
    }));
}

function callDb(fileName) {
    console.log('--in callDb');
    // fake create file
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('fake db call');
            resolve('saved');
        }, 100);
    });
}
