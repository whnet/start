# coding:utf-8
from django.http import HttpResponse
from django.shortcuts import render


def index(request):
    return HttpResponse("hello,world!")


def test(request):
    list = {'name': 'yanli', 'address': '华贸', 'title': '测试文档'}
    return render(request, "index.html", list)
