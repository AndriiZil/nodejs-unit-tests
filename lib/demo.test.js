const { expect } = require('chai');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const rewire = require('rewire');

chai.use(chaiAsPromised);
chai.use(sinonChai);

const demo = rewire('./demo');

describe('demo', () => {
    context('add', () => {
        it('should add two numbers', () => {
            expect(demo.add(1, 2)).to.equal(3)
        });
    });

    context('callback add', () => {
        it('should test callback', () => {
            demo.addCallBack(1, 2, (err, result) => {
                expect(err).to.not.exist;
                expect(result).to.equal(3);
            })
        });
    });

    context('test promise', () => {
        // it('should add with promise', () => {
        //     demo.addPromise(1, 2).then(result => {
        //         expect(result).to.equal(3);
        //     }).catch(e => {
        //         console.log('error');
        //     })
        // });

        it('should test promise with return ', () => {
            return demo.addPromise(1, 2).then(result => {
                expect(result).to.equal(3);
            })
        });

        it('should test promise with async await', async () => {
            const result = await demo.addPromise(1, 2);
            expect(result).to.equal(3);
        });

        it('should test promise with chai as promised', async () => {
            await expect(demo.addPromise(1, 2)).to.eventually.equal(3);
        });
    });

    context('test doubles', () => {
        it('should spy on log', () => {
            const spy = sinon.spy(console, 'log');

            demo.foo();
            expect(spy.calledOnce).to.be.true;

            spy.restore();
        });

        it('should stub console.warn', () => {
            const stub = sinon.stub(console, 'warn').callsFake(() => {
                console.log('console.log from stub');
            })

            demo.foo()
            expect(stub).to.have.been.calledOnce;
            stub.restore();
        });
    });

    context('stub private functions', () => {
        it('should stub createFile', async () => {
            const createStub = sinon.stub(demo, 'createFile').resolves('create_stub');
            const callStub = sinon.stub().resolves('calldb_stub');

            demo.__set__('callDb', callStub);

            const result = await demo.bar('test.txt');
            expect(result).to.equal('calldb_stub');
            expect(createStub).to.have.been.calledOnce;
            expect(createStub).to.have.been.calledWith('test.txt');
            expect(callStub).to.have.been.calledOnce;
            expect(callStub).to.have.been.calledWith('test.txt');
        });
    })
})