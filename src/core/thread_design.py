#!/usr/bin/env python
# coding: utf-8

import threading

class thread_info():
    def __init__(self, thread, last_start_time, thread_age):
        # self.thread_id = kwargs['id']
        self.thread_self = thread
        self.flag = threading.Event()     # 用于暂停线程的标识
        self.flag.set()       # 设置为True
        self.running = threading.Event()      # 用于停止线程的标识
        self.running.set()      # 将running设置为True
        self.last_start_time = last_start_time
        self.code_cov_imp = 0
        self.copy_thread = False
        self.thread_age = thread_age
        self.handled = False


    def pause(self):
        self.flag.clear()     # 设置为False, 让线程阻塞

    def resume(self):
        self.flag.set()    # 设置为True, 让线程停止阻塞

    def stop(self):
        self.flag.set()       # 将线程从暂停状态恢复, 如何已经暂停的话
        self.running.clear()        # 设置为False