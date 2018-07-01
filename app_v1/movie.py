# coding:utf-8


import os

import requests
from bs4 import BeautifulSoup
from django.core.wsgi import get_wsgi_application

# sys.path.extend(['/Users/yl/yanliProjects/pythonProjects/bangbangce/bangce_v1/app_v1',])#动态改变环境变量地址
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings")
application = get_wsgi_application()
import django

django.setup()
from app_v1.models import *

header = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch',
    'Accept-Language': 'zh-CN,zh;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36',
    'Cookie': 'yunsuo_session_verify=773fce65ac8baaa9b2fc339f5898ee53; Hm_lvt_37eca9226885a06726365a4e1ad490cd=1526944142,1527424628,1527604106; Hm_lpvt_37eca9226885a06726365a4e1ad490cd=1527634741',
    'Connection': 'keep-alive',
    'Host': 'www.friok.com',
    'Referer': 'http://www.friok.com/'
}


# 获取电影在线资源
def get_movie_from_friok(page=1):
    host = 'http://www.friok.com/category/dyzy/page/{0}/'.format(page)
    try:
        wb = requests.get(host, params=header).content
        soup = BeautifulSoup(wb, 'html5lib')
    except BaseException as e:
        print("访问出错：", e)
    # 获取电影编号
    nums_list = []
    movie_nums = soup.select("h2 > a")
    for m in movie_nums:
        m = m.get("href")[21:-5]
        nums_list.append(m)
    # 从电影下载页中获取百度网盘链接
    video_list = []
    for n in nums_list:
        down_url = 'http://www.friok.com/download.php?id=' + n
        try:
            down_data = requests.get(down_url, headers=header).content
        except BaseException as e:
            continue
        dsoup = BeautifulSoup(down_data, 'html5lib')
        name = dsoup.title.get_text()[:-4]
        try:
            link = dsoup.select_one('div.list > a').get('href')
            passwd = dsoup.select("div.desc > p")[1].get_text().split('：')[-1]
            result = Movie.objects.get_or_create(
                title=name,
                link=link,
                passwd=passwd
            )
            print('[*]完成数据写入：', name, link, passwd)
        except Exception as e:
            print('[-]数据写入错误', e)


if __name__ == '__main__':
    for i in range(1, 139):
        print('当前第{}页'.format(i))
        get_movie_from_friok(page=i)
