# coding:utf-8
from django.db import models


class Members(models.Model):
    name = models.CharField('姓名', max_length=5)
    tel = models.CharField('手机号', max_length=11)
    created = models.CharField('创建时间', max_length=10)

    class Meta:
        db_table = 'members'


class Movie(models.Model):
    title = models.CharField(verbose_name='资源标题', max_length=100, null=True, blank=True)
    link = models.CharField(verbose_name='资源链接', max_length=255, null=True, blank=True)
    passwd = models.CharField(verbose_name='资源密码', max_length=50, null=True, blank=True)
    insert_date = models.DateTimeField(verbose_name='写入时间', auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = '电影资源'
        verbose_name_plural = verbose_name
        ordering = ['-insert_date']
