const config = require('config');
const etcd = require('./libs/etcd');
etcd(undefined, 'mobile_vendas', config).subscribe();

setInterval(() => console.log(config), 1000)

