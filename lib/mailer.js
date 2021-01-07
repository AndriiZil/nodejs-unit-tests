exports.sendWelcomeEmail = (email, name) => {
    if (!email || !name) {
        return Promise.reject(new Error('Invalid input'));
    }

    const body = `Dear ${name}, welcome to our family!`;

    return sendEmail(email, body);
}

exports.sendPasswordResetEmail = (email) => {
    if (!email) {
        return Promise.reject(new Error('Invalid input'));
    }

    const body = 'Please click http://some_link to reset your password';

    return sendEmail(email, body);
}

const sendEmail = (email, body) => {
    if (!email || !body) {
        return Promise.reject(new Error('Invalid input'));
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Email sent!');
            return resolve('Email sent');
        }, 100)
    });
}
