"""
this file need a list that contains a list of target packages
and the root path to do the operation

in the end, the program will create a "backup_song" dir and put all 
the dirs that not in the list into this dir
"""
import os

root_path = "/home/lsong18/legacy/modules/"
backup_path = os.path.join(root_path, "backup_song") 
if not os.path.exists(backup_path):
    os.mkdir(backup_path)
list_path = "/home/lsong18/legacy/pp_legacy.res"


with open(list_path, 'r') as fp:
    packages = [os.path.join(root_path, x).strip() for x in list(fp.readlines())]
    for cur_dir in os.listdir(root_path):
        cur_path = os.path.join(root_path, cur_dir)
        if cur_path not in packages and cur_path != backup_path:
            os.rename(cur_path, os.path.join(backup_path, cur_dir))

