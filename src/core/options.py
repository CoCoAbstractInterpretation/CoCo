import argparse


def parse_args():
    # Parse arguments
    parser = argparse.ArgumentParser(
        description='Object graph generator for JavaScript.')
    parser.add_argument('-p', '--print', action='store_true',
                        help='Print logs to console, instead of file.')
    parser.add_argument('-t', '--vul-type', default='os_command',
                        help="Set the vulnerability type to be checked.")
    parser.add_argument('-P', '--prototype-pollution', '--pp',
                        action='store_true',
                        help="Check prototype pollution.")
    parser.add_argument('-m', '--module', action='store_true',
                        help="Module mode. Regard the input file as a module "
                        "required by some other modules.")
    parser.add_argument('-q', '--exit', action='store_true', default=False,
                        help="Exit the program when vulnerability is found.")
    parser.add_argument('-s', '--single-branch', action='store_true',
                        help="Single branch. Do not create multiple "
                        "possibilities when meet a branching point.")
    parser.add_argument('-a', '--run-all', action='store_true', default=False,
                        help="Run all exported functions in module.exports. "
                        "By default, only main functions will be run.")
    parser.add_argument('-f', '--function-timeout', type=float,
                        help="Time limit when running all exported function, "
                        "in seconds. (Defaults to no limit.)")
    parser.add_argument('--timeout', type=int, help="Time limit for testing a package. (Defaults to None)")
    parser.add_argument('-c', '--call-limit', default=3, type=int,
                        help="Set the limit of a call statement. "
                        "(Defaults to 3.)")
    parser.add_argument('-e', '--entry-func')
    parser.add_argument('-l', '--list', action='store')
    parser.add_argument('--install', action='store_true', default=False, help="If set, we will install the packages to the run env")
    parser.add_argument('--run-env', default='./tmp_env/', help="set the running env location")
    parser.add_argument('--no-file-based', action='store_true', default=False, help="No file based detection")
    parser.add_argument('--parallel', help="run multiple package parallelly")
    parser.add_argument('--auto-type', action='store_true', default=False, help="Auto change the type of wildcard obj based on the called method")
    parser.add_argument('--export', help="export the graph to csv files, can be light or all")
    parser.add_argument('--nodejs', action='store_true', default=False, help="run a nodejs package")
    parser.add_argument('--gc', action='store_true', default=False, help="run a garbage collection after every function run")
    parser.add_argument('--babel', help="use babel to convert the files first, need to input the path to the files to be converted")
    parser.add_argument('input_file', action='store', nargs='?', help="Source code file (or directory) to generate object graph for. "
        "Use '-' to get source code from stdin. Ignore this argument to analyze ./nodes.csv and ./rels.csv.")
    parser.add_argument('-crx', '--chrome_extension', action='store_true', default=False, help="run a chrome extension")
    parser.add_argument('-pq', '--run_with_pq', action='store_true', default=False, help="run a the program as a priority queue")
    parser.add_argument('-o', '--obj_traceback', action='store_true', default=False, help="traceback through the obj contribute to edge")
    parser.add_argument('-dx', '--dx', action='store_true', default=False, help="test on the doublex dataset")
    parser.add_argument('-easy', '--easy_test', action='store_true', default=False, help="test on simple extension")
    parser.add_argument('-path', '--package_path', default='demos/', help="path to extension")
    parser.add_argument('-auto', '--autostop', action='store_true', default=False, help="auto stop when running too slow")
    parser.add_argument('-no_merge', '--no_merge', action='store_true', default=False, help="do not do merge")
    parser.add_argument('-thread_stmt', '--thread_stmt', action='store_true', default=False, help="run stmts with threads if they are taking too long")
    parser.add_argument('-allb', '--all_branch', action='store_true', default=False, help="run all the branches for no thread version")
    parser.add_argument('-war', '--war', action='store_true', default=False, help="run with war as bg")
    parser.add_argument('-measure_thread', '--measure_thread', action='store_true', default=False, help="measure thread with time")
    parser.add_argument('-measure_code_cov_progress', '--measure_code_cov_progress', action='store_true', default=False, help="measure code coverage with time")
    parser.add_argument('-slice', '--time_slice', type=float, default=0.1, help="find the best time slice")
    parser.add_argument('-seq_timeout', '--seq_timeout', type=float, default=20, help="find the best seq_timeout, use with thread_stmt")
    parser.add_argument('-policy', '--policy', type=int, default=1,help="which policy is the best?")
    parser.add_argument('-alpha', '--alpha', type=float, default=0.2, help="choose aplha")
    parser.add_argument('-beta', '--beta', type=float, default=0.8, help="choose beta")
    parser.add_argument('-gamma', '--gamma', type=float, default=1, help="choose gamma")
    parser.add_argument('-abla', '--ablation_mode', default="coco", help="choose ablation_mode")
    parser.add_argument('-code_progress_html', '--code_progress_html', action='store_true', default=False, help="output the timeline of code analysis")



    args = parser.parse_args()
    if args.vul_type == 'prototype_pollution':
        args.vul_type = 'proto_pollution'

    return args

class Options:
    class __Options:
        def __init__(self):
            args = parse_args()
            for arg in vars(args):
                setattr(self,arg,getattr(args,arg))
    instance = None
    def __init__(self):
        if not Options.instance:
            Options.instance = Options.__Options()
    def __getattr__(self, name):
        return getattr(self.instance, name)
    def __setattr__(self, name, val):
        return setattr(self.instance, name, val)

options = Options()
