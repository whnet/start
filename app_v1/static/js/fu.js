(function () {

    var list;

    var fuImg;
    var index;
    var fuID;

    var dealing = false;


    $.ajax({
        url: '/wish/listQingfu.do',
        dataType: 'json',
        success: function (response) {
            if (response.state == 'ok') {
                list = response.data;
                fillData();
            } else {
                app.tip(response.reason);
            }
        }
    });

    function getCharge(wishId, type, succ, err, cmpl) {
        var data = {
            wishId: wishId,
            type: type,
            channel: 'wx_pub'
        }

        app.needLogin(function (headers, url) {
            $.ajax({
                headers: headers,
                url: url,
                type: 'GET',
                data: data,
                success: function (response) {
                    succ && succ(response)
                },
                fail: function (response) {
                    dealing = false;
                    err && err(response)
                },
                complete: function (response) {
                    cmpl && cmpl(response)
                }
            });
        }, '/pay/getCharge.do');

    }

    function onCharge(response) {
        if (response.state != 'ok') {
            dealing = false;
            return app.tip(response.reason);
        }
        var charge = response.data;

        var pingpp = window.pingpp;

        pingpp.createPayment(charge, function (result, err) {
            dealing = false;
            if (result == "success") {
                app.tip('支付成功');
                showSuccessPage();
            } else if (result == "fail") {
                app.tip('支付失败');
                onWXPayFail();
                // charge 不正确或者微信公众账号支付失败时会在此处返回
            } else if (result == "cancel") {
                // 微信公众账号支付取消支付
                app.tip('支付已取消');
                onWXPayFail();
            }
        });

    }

    function showSuccessPage() {
        // if (fuImg) {
        // 	app.setCookie('fu-preview', fuImg, 0, '/');
        // }
        // if (index) {
        // 	app.setCookie('fu-entity', index, 0, '/');
        // }
        // window.location.href = '/action/fu_result.html?id=' + fuID;
        $('.container').html('');

        var fuImg = '/images/fu_thumb' + fuID + '.png';
        var fuEntity = '/images/fu_entity' + fuID + '.png';

        var html = '<div class="firework"></div>\
        		<p class="title">点击御守<br>可查看您请到的符</p>\
        		<p class="title2 tp">长按可保存图片至相册</p>\
        		<div class="fu-div">\
        			<img src="' + fuImg + '" class="fu">\
        		</div>\
        		<div class="detail-div tp">\
            		<img src="' + fuEntity + '" class="fu-detail">\
            		<img src="' + fuImg + '" class="t-fu">\
            	</div>\
        		<view class="buttons">\
            		<p class="share">再次请符</p>\
        		</view>';

        $(html).appendTo('.container');

        // if (fuImg) {
        // 	$('.fu').attr('src', fuImg);
        // 	$('.t-fu').attr('src', fuImg);
        // 	$('.fu-detail').attr('src', fuEntity);

        // } else {
        // 	$('.fu').remove();
        // }

        $('.share').on('tap', function () {
            window.location.href = "/action/fu.html";
        });

        $('.fu').on('tap', function () {

            var left = $('.fu-detail').offset().left + $('.fu-detail').offset().width * 0.7;

            $('.t-fu').css('left', left + 'px');

            $('.title').remove();
            $('.fu-div').remove();
            $('.tp').removeClass('tp');

            $('.fu-detail').css('pointer-events', 'auto');

        });
    }

    function onWXPayFail() {

    }

    function fillData() {

        var html = '';
        for (var i = 0; i < list.length; i += 3) {
            var img1 = '/images/nop_' + list[i].id + '.png';
            var img2 = i + 1 < list.length ? ('/images/nop_' + list[i + 1].id + '.png') : '';
            var img3 = i + 2 < list.length ? ('/images/nop_' + list[i + 2].id + '.png') : '';

            html += '<div class="block">\
							<img data-i="' + i + '" src="' + img1 + '" class="fu1">\
							<img data-i="' + (i + 1) + '" src="' + img2 + '" class="fu1">\
							<img data-i="' + (i + 2) + '" src="' + img3 + '" class="fu1">\
						</div>';
        }
        ;

        $('.container').html(html);

        $('.fu1').on('click', function (e) {

            if (dealing == true) {
                return;
            }
            var idx = this.dataset.i;

            if (idx < list.length) {
                dealing = true;
                app.showLoading();
                var item = list[idx];

                fuImg = '/images/fu_thumb' + item.id + '.png';
                ;
                index = '/images/fu_entity' + item.id + '.png';
                fuID = item.id;

                var postData = {
                    comment: '',
                    qingfuId: item.id,
                    type: 2
                };

                app.needLogin(function (headers, url) {
                    $.ajax({
                        headers: headers,
                        url: url,
                        dataType: 'json',
                        data: postData,
                        type: 'POST',
                        success: function (response) {
                            if (response.state == 'ok') {
                                var wishid = response.data.id;

                                getCharge(wishid, 1, onCharge);
                            } else {
                                dealing = false;
                                app.tip(response.reason);
                            }
                        },
                        fail: function () {
                            dealing = false;
                        },
                        complete: function () {
                            app.clearLoading();
                        }
                    });
                }, '/wish/make.do');
            }

        });
    }
})();