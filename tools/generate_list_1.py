# this tool is used to generate a list of input files of the folder
import sys
import os
from tqdm import tqdm

def read_data_from_txt(file_name):
    """
    read data from txt file
    :param file_name: file name
    :return: list of lines
    """
    result_lines = []
    with open(file_name) as f:
        result_lines = f.read().splitlines()
    return result_lines

def generate_list(dir_path):
    """
    list the folders and return a list 
    """
    dir_list = [os.path.join(dir_path, i) for i in os.listdir(dir_path)]
    # all the package should be folders
    res = []
    finished_task = read_data_from_txt('./crx_5_3.log')
    for d in tqdm(dir_list):
        if os.path.isdir(d) and d not in finished_task:
            res.append(os.path.abspath(d))
    return res

input_dir = sys.argv[1]
generated_list = generate_list(input_dir)
with open("result.list", 'w') as fp:
    fp.write('\n'.join(generated_list))
