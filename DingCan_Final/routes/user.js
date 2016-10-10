/**
 * 用户路由
 */
var db = require('../db/gb');  //db是一个对象
var sms_utils = require('../util/sms_utils');

module.exports = function (router) {
    //注册多个路由

    //登陆
    router.post('/login', function (req, res, next) {
        //从req中获取数据
        var phone = req.body.phone;
        var code = req.body.code;
        console.log('/login phone='+phone+' code='+code);
        if(usersObj[phone]!==code) {
            res.send({
                code : 1,
                data : '验证码不正确!'
            });
            return;
        }
        //删除此属性
        delete usersObj[phone];

        //调用db处理数据
            //根据phone进行查询
        db.getUser(phone, function (user) { //查询返回的user
            //如果没有, 添加数据, 并返回数据
            if(user==null) {
                db.addUser({phone:phone}, function (user) {//添加返回的user
                    res.send({
                        code: 0,
                        data: user
                    });
                })
            } else {
                //如果有, 返回数据
                res.send({
                    code: 0,
                    data: user
                });
            }
        });
    });

    //意见反馈
    router.get('/feedback', function (req,res, next) {
        //获取参数数据
        var dataJson = req.query.data;
        var feedback = JSON.parse(dataJson);
        //处理数据
        db.addFeedback(feedback, function (feedback) {
            //返回数据
            res.json({code : 0, data : feedback});
        });
    });

    //存储用户的phone--code
    var usersObj = {};

    /**
     * 处理发送验证码短信的ajax请求
     */
    router.get('/sendCode', function (req, res, next) {

        var phone = req.query.phone;

        //生成随机值验证码
        var code = sms_utils.randomCode(6);
        //向phone发验证码短信
        sms_utils.sendCode(phone, code, function (success) {
            if(success) {
                usersObj[phone] = code;
                console.log('send', phone, code);
            }
        });

        //启动定时器60s后删除保存的数据
        setTimeout(function () {
            delete usersObj[phone];
        }, 60000);

        //返回响应
        res.send({
            code : 0
        });
    });
};