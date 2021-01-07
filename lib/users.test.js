const { expect } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

chai.use(chaiAsPromised);
chai.use(sinonChai);

const mongoose = require('mongoose');

let users = rewire('./users');
const User = require('./models/user.model');
const mailer = require('./mailer');

let sandbox = sinon.createSandbox();

describe('users', () => {
    let findStub;
    let deleteStub;
    let sampleArgs;
    let sampleUser;
    let mailerStub;

    beforeEach(() => {
        sampleUser = {
            id: 123,
            name: 'foo',
            email: 'foo@bar.com',
            save: sandbox.stub().resolves()
        };

        findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser);
        deleteStub = sandbox.stub(mongoose.Model, 'remove').resolves('fake_remove_result');
        mailerStub = sandbox.stub(mailer, 'sendWelcomeEmail').resolves('fake_email');
    });

    afterEach(() => {
        sandbox.restore();
        users = rewire('./users');
    });

    context('get', () => {
        it('should throw error if no id provided', () => {
            users.get(null, (err, result) => {
                expect(err).to.exist;
                expect(err.message).to.equal('Invalid user id');
            })
        });

        it('should call findUserById with id and return result', () => {
            sandbox.restore();
            const stub = sandbox.stub(mongoose.Model, 'findById').yields(null, { name: 'foo' });

            users.get(123, (err, result) => {
                expect(err).to.not.exist;
                expect(stub).to.have.been.calledOnce;
                expect(stub).to.have.been.calledWith(123);
                expect(result).to.be.a('object');
                expect(result).to.have.property('name').to.equal('foo');
                expect(result).to.deep.equal({ name: 'foo' });
            })
        });

        it('should catch error if there is one', () => {
            sandbox.restore();
            const stub = sandbox.stub(mongoose.Model, 'findById').yields(new Error('fake'));

            users.get(123, (err, result) => {
                expect(result).to.not.exist;
                expect(err).to.exist;
                expect(err).to.be.instanceOf(Error);
                expect(stub).to.have.been.calledWith(123);
                expect(err.message).to.equal('fake');
            })
        });
    });

    context('delete user', () => {
        it('should check for an id using return', () => {
            return users.delete().then((result) => {
                throw new Error('unexpected success');
            }).catch(err => {
                expect(err).to.be.instanceOf(Error);
                expect(err.message).to.equal('Invalid id');
            });
        });

        it('should check for error using eventually', () => {
            return expect(users.delete()).to.eventually.be.rejectedWith('Invalid id');
        });

        it('should call User.remove', async () => {
            const result = await users.delete(123);

            expect(result).to.equal('fake_remove_result');
            expect(deleteStub).to.have.been.calledWith({ _id: 123 });
        });
    });

    context('create user', () => {
        let fakeUserClass, saveStub, result;

        beforeEach(async () => {
            saveStub = sandbox.stub().resolves(sampleUser);
            fakeUserClass = sandbox.stub().returns({ save: saveStub });

            users.__set__('User', fakeUserClass);
            result = await users.create(sampleUser);
        });

        it('should reject invalid args', async () => {
            await expect(users.create()).to.eventually.be.rejectedWith('Invalid arguments');
            await expect(users.create({ name: 'foo' })).to.eventually.be.rejectedWith('Invalid arguments');
            await expect(users.create({ email: 'test@gmail.com' })).to.eventually.be.rejectedWith('Invalid arguments');
        });

        it('should call User with new', () => {
            expect(fakeUserClass).to.have.been.calledWithNew;
            expect(fakeUserClass).to.have.been.calledWith(sampleUser);
        });

        it('should save the user', () => {
            expect(saveStub).to.have.been.called;
        });

        it('should save the user', () => {
            expect(mailerStub).to.have.been.calledWith(sampleUser.email, sampleUser.name);
        });

        it('should reject errors', async () => {
            saveStub.rejects(new Error('fake'));
            await expect(users.create(sampleUser)).to.eventually.be.rejectedWith('fake');
        });
    });

    context('update user', () => {
        it('should find user by id', async () => {
            await users.update(123, { age: 35 });

            expect(findStub).to.have.been.calledWith(123);
        });

        it('should call user.save', async () => {
            await users.update(123, { age: 35 });

            expect(sampleUser.save).to.have.been.calledOnce;
        });

        it('should reject if there is an error', async () => {
            findStub.throws(new Error('fake'));

            await expect(users.update(123, { age: 35 })).to.eventually.be.rejectedWith('fake')
        });
    });

    context('reset password', () => {
        let resetStub;

        beforeEach(() => {
            resetStub = sandbox.stub(mailer, 'sendPasswordResetEmail').resolves('reset');
        });

        it('should check for email', async () => {
            await expect(users.resetPassword()).to.eventually.be.rejectedWith('Invalid email');
        });

        it('should call sendPasswordResetEmail', async () => {
            await users.resetPassword('foo@bar.com');

            expect(resetStub).to.have.been.calledWith('foo@bar.com');
        });
    });

});
