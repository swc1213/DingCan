/**
 * Created by xfzhang on 2016/8/18.
 */
var moment = require('moment'); //日期时间格式化工具模块
var Base64 = require('js-base64').Base64; //进行Base64编码模块
var md5 = require("blueimp-md5"); //进行MD5加密模块
var reqest = require('request'); //Http Client模块

/**
 * 生成随机值
 * @param length
 * @returns {string}
 */
function randomCode(length) {
    var jschars = ['0','1','2','3','4','5','6','7','8','9'];
    var code = "";
    for(var i = 0; i < length ; i ++) {
        var index = Math.ceil(Math.random()*(jschars.length-1));
        code += jschars[index];
    }
    return code;
}
exports.randomCode = randomCode;
//console.log(randomCode(6));

/**
 * 利用第三方平台(容云), 向手机发送验证码
 * @param phone
 * @param code
 * @param cb
 */
exports.sendCode = function (phone, code, cb) {

    var BASE_URL = 'https://app.cloopen.com:8883';
    var ACCOUNT_SID = '8aaf070855b647ab0155b9f80994058a';
    var AUTH_TOKEN = 'aa8aa679414e49df8908ea5b3d043c24';

    //当前日期时间字符串
    var time = moment().format('YYYYMMDDHHmmss');

    //使用MD5加密（账户Id + 账户授权令牌 + 时间戳）, 且必须是大写
    var SigParameter = ACCOUNT_SID+AUTH_TOKEN+time;
    SigParameter = md5(SigParameter).toUpperCase();
    console.log("md5", SigParameter);
    var url = BASE_URL+'/2013-12-26/Accounts/'+ACCOUNT_SID+'/SMS/TemplateSMS?sig='+SigParameter;

    //使用Base64编码（账户Id + 冒号 + 时间戳）
    var Authorization = ACCOUNT_SID+":"+time;
    Authorization = Base64.encode(Authorization);
    console.log("Base64", Authorization);

    //请求体数据对象
    var body = {
        to : phone,
        appId : '8aaf070855b647ab0155b9f809f90590',
        templateId : "1",
        datas : [code,"1"]
    };
    var bodyJson = JSON.stringify(body);

    //请求相关配置对象
    var options = {
        uri : url,
        method : 'POST',
        headers : {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json;charset=utf-8',
            'Content-Length' : bodyJson.length+"",
            'Authorization' : Authorization
        },
        body : body,
        json : true
    };

    //发送请求
    reqest(options, function (error, response, body) {
        //如果没有错误, 并且成功返回
        if (!error && response.statusCode == 200) {
            //取响应体中的statusCode, 只有为000000才代表成功了
            var statusCode = body.statusCode;
            cb(statusCode==='000000');
        }
    });
}