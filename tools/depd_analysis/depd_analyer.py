import json
import os
from tqdm import tqdm

class Analyzer:

    def __init__(self, path):
        self.root_path = path

    def validate_package(self, package_path):
        """
        check whether a package is valid by whether it include package.json
        Args:
            package_path: the path to the package
        Returns:
            True or False
        """
        package_json_path = '{}/package.json'.format(package_path)
        index_path = os.path.join(package_path, 'index.js')
        return os.path.exists(package_json_path) or os.path.exists(index_path)

    def get_list_of_packages(self, path=None, start_id=None, size=None):
        """
        return a list of package names, which is the name of the folders in the path
        Args:
            path: the path of packages folder
        return:
            a list of package names
        """
        if path is None:
            path = self.root_path
        possible_packages = [os.path.join(path, name) for name in os.listdir(path)]

        if start_id is not None:
            possible_packages = possible_packages[start_id:]
        if size is not None:
            possible_packages = possible_packages[:size]
        
        all_packages = []
        print("Preparing")
        for package in tqdm(possible_packages):
            if not os.path.isdir(package):
                continue
            # print(package)
            if package.split('/')[-1][0] == '@' and \
                    (not self.validate_package(package)):
                #should have sub dir
                sub_packages = [os.path.join(package, name) \
                        for name in os.listdir(package)]
                all_packages += sub_packages
            else:
                all_packages.append(package)
        
        print('Prepared')
        return all_packages 

    def get_package_depd(self, package_path):
        """
        get a list of depd of a package
        Args:
            package_path: the path to the package
        """
        package_json_path = "{}/package.json".format(package_path)
        depd = []
        if os.path.exists(package_json_path):
            try:
                with open(package_json_path) as json_file:
                    data = json.load(json_file)
                    if 'dependencies' in data:
                        if type(data['dependencies']) == dict:
                            depd.extend(data['dependencies'].keys())
                        else:
                            depd.extend(data['dependencies'])
                    if 'devDependencies' in data:
                        if type(data['devDependencies']) == dict:
                            depd.extend(data['devDependencies'].keys())
                        else:
                            depd.extend(data['devDependencies'])
            except Exception as e:
                print(e)
        return depd

def main():
    analyzer = Analyzer("/media/data2/song/newdownload/packages")
    all_packages = analyzer.get_list_of_packages(start_id=0)
    depd_list = {}
    back_depd_list = {}
    cnt = 0
    for package in tqdm(all_packages):
        if not analyzer.validate_package(package):
            continue
        cur_depd_list = analyzer.get_package_depd(package)

        depd_list[package] = cur_depd_list
        for depd in cur_depd_list:
            try:
                if depd not in back_depd_list:
                    back_depd_list[depd] = []
                back_depd_list[depd].append(package)
            except Exception as e:
                print(e)

        cnt += 1
        if cnt % 100000 == 0:
            with open("depd.json", "w") as outfile:
                json.dump(depd_list, outfile)

            with open("back_depd.json", "w") as outfile:
                json.dump(back_depd_list, outfile)
                
    with open("depd.json", "w") as outfile:
        json.dump(depd_list, outfile)

    with open("back_depd.json", "w") as outfile:
        json.dump(back_depd_list, outfile)


main()
