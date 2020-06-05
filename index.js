const Web3 = require('web3');

let nodeUrls = [
    'wss://api.wanchain.org:8443/ws/v3/63ed9a8194838987f49090a007e08961ededb2c2e9bd85822f574409258c413f',
    'wss://api2.wanchain.org:8443/ws/v3/63ed9a8194838987f49090a007e08961ededb2c2e9bd85822f574409258c413f',
    'https://gwan-ssl.wandevs.org:46891',
    'https://gwan-ssl.wandevs.org:56891',
    'wss://apitest.wanchain.org:8443/ws/v3/63ed9a8194838987f49090a007e08961ededb2c2e9bd85822f574409258c413f',
    'https://demodex.wandevs.org:48545',
    'http://192.168.1.2:8545',
    'http://192.168.1.3:8545',
]

let web3s = [];
let web3select = 0;

console.log('ready to new web3...');
for (let i = 0; i < nodeUrls.length; i++) {
    try {
        if (nodeUrls[i].indexOf('ws') === 0) {
            web3s.push(new Web3(new Web3.providers.WebsocketProvider(nodeUrls[i])));
        } else {
            web3s.push(new Web3(new Web3.providers.HttpProvider(nodeUrls[i])));
        }
    } catch (err) {
        console.log(err);
    }
}


let switchFinish = false;

const getFastWeb3 = async () => {
    let timeout = 500;

    console.log('Search fast web3...timeout:', timeout);
    let funcs = [];
    for (let i = 0; i < web3s.length; i++) {
        let func = async () => {
            let t0 = Date.now();
            let tmpFunc = [];
            try {
                tmpFunc.push(new Promise((resolve, reject) => {
                    setTimeout(resolve, timeout, 'timeout');
                }));
                tmpFunc.push(web3s[i].eth.net.getId());

                let ret = await Promise.race(tmpFunc);
                if (ret === 'timeout') {
                    console.log('timeout:', i, nodeUrls[i]);
                    return { delay: 100000, index: i };
                }
            } catch (err) {
                console.log('net error:', i, nodeUrls[i]);
                return { delay: 100000, index: i };
            }
            let t1 = Date.now() - t0;
            return { delay: t1, index: i, url: nodeUrls[i] };
        }
        funcs.push(await func());
    }
    let ret = await Promise.all(funcs);
    ret.sort((a, b) => (a.delay - b.delay));
    console.log(ret);
    web3select = ret[0].index;
    console.log('web3select', web3select, nodeUrls[web3select]);
    switchFinish = true;
}

const getWeb3 = () => {
    return web3s[web3select];
}

const isSwitchFinish = () => {
    return switchFinish;
}

getFastWeb3();

