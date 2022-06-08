import json
import os
import argparse

class DepdData:

    def __init__(self, json_path):
        with open(json_path, 'r') as json_file:
            self.json_data = json.load(json_file)

    def get_value(self, package_name):
        """
        return a list of packages under this dict
        """
        if package_name not in self.json_data:
            return []
        res_list = self.json_data[package_name]
        return res_list
        return [os.path.basename(p) for p in res_list]

def main():
    argparser = argparse.ArgumentParser()
    argparser.add_argument('-f', nargs='+')
    args = argparser.parse_args()

    files = args.f
    print(files)

    depd = DepdData('./back_depd.json')

    cur_list = []
    for f in files:
        if len(cur_list) == 0:
            cur_list = depd.get_value(f)
        else:
            cur_list = [p for p in cur_list if p in depd.get_value(f)]
            
    print(cur_list)
    print(len(cur_list))

main()
