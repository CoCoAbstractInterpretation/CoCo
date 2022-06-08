# this tool is used to generate a list of input files of the folder
import sys
import os
import re

def generate_list(dir_path):
    """
    list the folders and return a list 

    """
    with open(dir_path) as f:
        content = f.read()
    pattern = re.compile(r'/media/data2/song/extensions/unzipped_extensions/[^\n\ ]*')
    # all the package should be folders
    res = pattern.findall(content)
    # for d in dir_list:
    #     if os.path.isdir(d):
    #         res.append(os.path.abspath(d))
    res = set(res)
    res = list(res)
    return res

input_dir = "/Users/jia/Desktop/tmp/EOPG/result_analyze/crx_5_3.log"
generated_list = generate_list(input_dir)
with open("runned.list", 'w') as fp:
    fp.write('\n'.join(generated_list))