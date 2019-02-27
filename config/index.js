const {
    env
} = process;
module.exports = {
    host: env.HOST,
    port: env.PORT,
    jwtSecret: env.JWT_SECRET,
    app_id: env.APP_ID,
    app_secret: env.APP_SECRET
}