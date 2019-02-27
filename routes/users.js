const GROUP_NAME = 'users';
const Joi = require('joi');
const models = require("../models");
const decryptData = require('../utils/decrypted-data');
const JWT = require('jsonwebtoken');
const config = require('../config');
const axios = require('axios');
module.exports = [{
    method: 'POST',
    path: `/${GROUP_NAME}/wxLogin`,
    handler: async (req, reply) => {
        const appid = config.app_id;
        const secret = config.app_secret;
        const {
            code,
            encryptedData,
            iv
        } = req.payload;
        const response = await axios({
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            method: 'GET',
            params: {
                appid,
                secret,
                js_code: code,
                grant_type: 'authorization_code',
            }
        });
        const {
            openid,
            session_key
        } = response.data;
        // 基于 openid 查找或创建一个用户
        const user = await models.users.findOrCreate({
            where: {
                open_id: openid
            },
        });
        const userInfo = decryptData(encryptedData, iv, session_key, appid);
        // 更新 user 表中的用户的资料信息
        await models.users.update({
            nick_name: userInfo.nickName,
            gender: userInfo.gender,
            avatar_url: userInfo.avatarUrl,
            open_id: openid,
            session_key: session_key,
        }, {
            where: {
                open_id: openid
            },
        });
        // 签发 jwt
        const generateJWT = (jwtInfo) => {
            const payload = {
                userId: jwtInfo.userId,
                exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
            };
            return JWT.sign(payload, config.jwtSecret);
        };
        reply(generateJWT({
            userId: user[0].id,
        }));
    },
    config: {
        auth: false, // 不需要用户验证
        tags: ['api', GROUP_NAME], // 注册 swagger 文档
        validate: {
            payload: {
                code: Joi.string().required().description('微信用户登录的临时code'),
                encryptedData: Joi.string().required().description('微信用户信息encryptedData'),
                iv: Joi.string().required().description('微信用户信息iv'),

            },
        },
    },
}, ]