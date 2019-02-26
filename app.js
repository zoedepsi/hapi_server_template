const Hapi = require('hapi');
require('env2')('./.env');
const config = require('./config');
const routesHelloHapi = require('./routes/hello-hapi');
const routesShops = require('./routes/shops');
const routesOrders = require('./routes/orders');
const routesUser = require('./routes/user');
const pluginHapiSwagger = require('./plugins/hapi-swagger');
const pluginHapiPagination = require('./plugins/hapi-pagination');
const hapiAuthJWT2 = require('hapi-auth-jwt2');
const pluginHapiAuthJWT2 = require('./plugins/hapi-auth-jwt2');
const server = new Hapi.Server();
// 配置服务器启动 host 与端口
server.connection({
    port: config.port,
    host: config.host
});

const init = async () => {
    await server.register([
        // 为系统使用 hapi-swagger
        ...pluginHapiSwagger,
        pluginHapiPagination,
        hapiAuthJWT2
    ]);
    pluginHapiAuthJWT2(server);
    server.route([
        ...routesHelloHapi,
        ...routesShops,
        ...routesOrders,
        ...routesUser
    ]);

    //启动服务
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

init();