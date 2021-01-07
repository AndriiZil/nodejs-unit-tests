const User = require('./models/user.model');
const mailer = require('./mailer');

exports.get = (id, callback) => {
    if (!id) {
        return callback(new Error('Invalid user id'));
    }

    User.findById(id, (err, result) => {
        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
}

exports.delete = (id) => {
    if (!id) {
        return Promise.reject(new Error('Invalid id'));
    }

    return User.remove({
        _id: id
    });
}

exports.create = (data) => {
    if (!data || !data.email || !data.name) {
        return Promise.reject(new Error('Invalid arguments'));
    }

    const user = new User(data);

    return user.save().then((result) => {
        return mailer.sendWelcomeEmail(data.email, data.name).then(() => {
            return {
                message: 'User created',
                userId: result.id
            };
        });
    }).catch((err) => {
        return Promise.reject(err);
    });
}

exports.update = async (id, data) => {
    try {
        const user = await User.findById(id);

        for (let prop in data) {
            user[prop] = data[prop];
        }

        const result = await user.save();

        return result;
    } catch (err) {
        return Promise.reject(err);
    }
}

exports.resetPassword = (email) => {
    if (!email) {
        return Promise.reject(new Error('Invalid email'));
    }

    return mailer.sendPasswordResetEmail(email);
}
