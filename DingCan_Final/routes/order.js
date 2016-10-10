/**
 * 订单路由
 */
var db = require('../db/gb');  //db是一个对象
var moment = require('moment');

module.exports = function (router) {
    //注册多个路由

    //得到用户的默认地址
    router.get('/order/getNewestAddress', function (req, res, next) {
        var userId = req.query.userId;
        db.getDefaultAddrByUserId(userId, function (address) {
            if(address==null) {
                res.json({code:1});
            } else {
                res.json({code:0, data:address});
            }
        });
    });

    //下单
    router.post('/order/createOrder', function (req, res, next) {
        //获取订单数据
        var order = req.body.order;
        order.state = 3; //表示订单已完成
        db.addOrder(order, function (order) {
            res.json({code : 0, data : order});
        })
    });

    //显示订单详情
    router.get('/order/detail/:id', function (req, res, next) {
        var id = req.params.id;
        db.getOrderById(id, function (order) {

            //状态文本
            var stateText = null;
            switch(order.state) {
                case 0:
                    stateText = '待支付';
                    break;
                case 1:
                    stateText = '已付款';
                    break;
                case 2:
                    stateText = '';
                    break;
                case 3:
                    stateText = '已完成';
                    break;
                case 4:
                    stateText = '店铺拒单';
                    break;
                case 5:
                    stateText = ' 商家已接单';
                    break;
                case 6:
                    stateText = '已退单';
                    break;
                case 7:
                    stateText = '未支付的取消订单';
                    break;
                case 8:
                    stateText = '订单异常';
                    break;
                case 9:
                    stateText = '退单中';
                    break;
                case 10:
                    stateText = '商家拒绝退单';
            }

            //如果添加一个没有的属性, 只能直接添加, 不要通过_doc
            order.stateText = stateText;
            //修改已有的属性的值, 必须通过_doc来操作
            //到达时间
            order._doc.arrive_time = moment(order.arrive_time).format('HH:mm');
            //对象化detail
            order._doc.detail = JSON.parse(order.detail);

            //使用ejs
           res.render('orderDetail', {code :0, data : order});
        });
    });


    //显示用户订单列表
    router.get('/order/orderList', function (req, res, next) {
        var userId = req.query.userId;
        db.getOrdersByUserId(userId, function (orderArr) {

            for (var i = 0; i < orderArr.length; i++) {
                var order = orderArr[i];

                order._doc.detail = JSON.parse(order.detail);
                order._doc.arrive_time = moment(order.arrive_time).format('MM-DD HH:mm');
                order._doc.order_time = moment(order.order_time).format('MM-DD HH:mm');
            }

            //使用ejs
            res.render('orderList', {code :0, data : orderArr});
        })
    });
};