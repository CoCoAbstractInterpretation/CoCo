from .trace_rule import TraceRule
from .vul_func_lists import *
from .logger import loggers
import sty

def get_path_text(G, path, caller= None):
    """
    get the code by ast number
    Args:
        G: the graph
        path: the path with ast nodes
    Return:
        str: a string with text path
    """
    res_path = ""
    # cur_path_str1 = ""
    cur_path_str2 = ""
    for node in path:
        cur_node_attr = G.get_node_attr(node)
        if cur_node_attr.get('lineno:int') is None:
            continue
        # cur_path_str1 += cur_node_attr['lineno:int'] + '->'
        start_lineno = int(cur_node_attr['lineno:int'])
        end_lineno = int(cur_node_attr['endlineno:int']
                        or start_lineno)

        content = None
        cur_path_str2 += "$FilePath${}\n".format(G.get_node_file_path(node))
        try:
            content = G.get_node_file_content(node)
        except Exception as e:
            print(e)
        if content is not None:
            attr = G.get_node_attr(node)
            cur_path_str2 += "Line {}\t{}\t{}\n".format(start_lineno,
                    ''.join(content[start_lineno:end_lineno + 1]), attr['code'])
    # cur_path_str1 += G.get_node_attr(caller)['lineno:int']
    # G.logger.debug(cur_path_str1)

    res_path += "==========================\n"
    res_path += cur_path_str2
    return res_path

def traceback(G, vul_type, start_node=None):
    """
    traceback from the leak point, the edge is OBJ_REACHES
    Args:
        G: the graph
        vul_type: the type of vulnerability, listed below
    Return:
        the paths include the objs,
        the string description of paths,
        the list of callers,
    """
    res_path = ""
    ret_pathes = []
    caller_list = []
    if vul_type == "proto_pollution":
        # in this case, we have to specify the start_node
        if start_node is not None:
            start_cpg = G.find_nearest_upper_CPG_node(start_node)
            pathes = G._dfs_upper_by_edge_type(start_cpg, "OBJ_REACHES")

            for path in pathes:
                ret_pathes.append(path)
                path.reverse()
                res_path += get_path_text(G, path, start_cpg)
            
            return ret_pathes, res_path, caller_list

    expoit_func_list = signature_lists[vul_type]

    func_nodes = G.get_node_by_attr('type', 'AST_METHOD_CALL')
    func_nodes += G.get_node_by_attr('type', 'AST_CALL')

    for func_node in func_nodes:
        # we assume only one obj_decl edge
        func_name = G.get_name_from_child(func_node)
        if func_name in expoit_func_list:
            caller = func_node
            caller = G.find_nearest_upper_CPG_node(caller)
            caller_list.append("{} called {}".format(caller, func_name))
            pathes = G._dfs_upper_by_edge_type(caller, "OBJ_REACHES")

            for path in pathes:
                ret_pathes.append(path)
                path.reverse()
                res_path += get_path_text(G, path, caller)
                # print('get_path_text\n', get_path_text(G, path, caller))
    # print('ret_pathes debug\n', ret_pathes)
    return ret_pathes, res_path, caller_list

def do_vul_checking(G, rule_list, pathes):
    """
    checking the vuleralbilities in the pathes

    Args:
        G: the graph object
        rule_list: a list of paires, (rule_function, args of rule_functions)
        pathes: the possible pathes
    Returns:
    """
    trace_rules = []
    for rule in rule_list:
        trace_rules.append(TraceRule(rule[0], rule[1], G))

    success_pathes = []
    flag = True
    for path in pathes:
        flag = True
        for trace_rule in trace_rules:
            if not trace_rule.check(path):
                flag = False
                break
        if flag:
            success_pathes.append(path)
    return success_pathes

def vul_checking(G, pathes, vul_type):
    """
    picking the pathes which satisfy the xss
    Args:
        G: the Graph
        pathes: the possible pathes
    return:
        a list of xss pathes
    """
    xss_rule_lists = [
            [('has_user_input', None), ('not_start_with_func', ['sink_hqbpillvul_http_write']), ('not_exist_func', ['parseInt']), ('end_with_func', ['sink_hqbpillvul_http_write'])],
            [('has_user_input', None), ('not_start_with_func', ['sink_hqbpillvul_http_setHeader']), ('not_exist_func', ['parseInt']), ('end_with_func', ['sink_hqbpillvul_http_setHeader'])]
            ]
    os_command_rule_lists = [
            [('has_user_input', None), ('not_start_within_file', ['child_process.js']), ('not_exist_func', ['parseInt'])],
            [('start_with_var', ['source_hqbpillvul_url']), ('not_start_within_file', ['child_process.js']), ('not_exist_func', signature_lists['sanitation'])]
            ]

    code_exec_lists = [
            [('has_user_input', None), ('not_start_within_file', ['eval.js']), ('not_exist_func', ['parseInt'])],
            [('has_user_input', None), ('end_with_func', ['Function']), ('not_exist_func', ['parseInt'])],
            [('has_user_input', None), ('end_with_func', ['eval']), ('not_exist_func', ['parseInt'])],
            # include os command here
            [('has_user_input', None), ('not_start_within_file', ['child_process.js']), ('not_exist_func', ['parseInt'])]
            ]
    proto_pollution = [
            [('has_user_input', None), ('not_exist_func', signature_lists['sanitation'])]
            ]
    path_traversal = [
            [('start_with_var', ['source_hqbpillvul_url']),
                ('not_exist_func', signature_lists['sanitation']), 
                ('end_with_func', signature_lists['path_traversal']),
                ('exist_func', ['sink_hqbpillvul_fs_read'])
            ],
            [('start_with_var', ['source_hqbpillvul_url']),
                ('not_exist_func', signature_lists['sanitation']), 
                ('end_with_func', ['sink_hqbpillvul_http_sendFile'])
            ]
            ]

    depd = [
            [('has_user_input', None), ('not_exist_func', signature_lists['sanitation']), 
                ('end_with_func', signature_lists['depd']), ('not_start_within_file', ['undefsafe.js', 'thenify.js', 'codecov.js', 'class-transformer.js', 'dot-object.js', 'git-revision-webpack-plugin.js'])
            ]
            ]

    # ('start_with_func', dispatchable_events),
    chrome_data_exfiltration = [
        # information leak
        # [ ('start_with_var', crx_source_var_name),('end_with_func', user_sink)],
        # [('start_with_sensitiveSource', None), ('end_with_func', user_sink)],
        # privilege escalation
        [('has_user_input', None), ('end_with_func', crx_sink)],
    ]
    # has_user_input means tainted
    chrome_API_execution = [
        [('has_user_input', None), ('end_with_func', crx_sink)],
    ]

    vul_type_map = {
            "xss": xss_rule_lists,
            "os_command": os_command_rule_lists,
            "code_exec": code_exec_lists,
            "proto_pollution": proto_pollution,
            "path_traversal": path_traversal,
            "depd": depd,
            "chrome_data_exfiltration": chrome_data_exfiltration,
            "chrome_API_execution": chrome_API_execution
            }


    rule_lists = vul_type_map[vul_type]
    success_pathes = []
    print('vul_checking', vul_type)
    """
    print(pathes)
    """
    for path in pathes:
        res_text_path = get_path_text(G, path, path[0])
        loggers.main_logger.info(res_text_path)

    for rule_list in rule_lists:
        success_pathes += do_vul_checking(G, rule_list, pathes)
    print_success_pathes(G, success_pathes)
    return success_pathes

def print_success_pathes(G, success_pathes):
    print(sty.fg.li_green + "|Checker| success: ", success_pathes)
    path_id = 0
    for path in success_pathes:
        res_text_path = get_path_text(G, path, path[0])
        loggers.tmp_res_logger.info("|checker| success id${}$: ".format(path_id))
        loggers.tmp_res_logger.info(res_text_path)
        path_id += 1
        print("Attack Path: ")
        print(res_text_path + sty.rs.all)
        loggers.res_logger.info(res_text_path)


def traceback_crx(G, vul_type, start_node=None):
    """
    traceback from the leak point, the edge is OBJ_REACHES
    Args:
        G: the graph
        vul_type: the type of vulnerability, listed below
    Return:
        the paths include the objs,
        the string description of paths,
        the list of callers,
    """
    res_path_text = ""
    sink = []
    sink.extend(crx_sink)
    # sink.extend(user_sink)
    sink.extend(ctrl_sink)
    # func_nodes: the entries of traceback, which are all the CALLs of functions
    func_nodes = G.get_node_by_attr('type', 'AST_METHOD_CALL')
    func_nodes += G.get_node_by_attr('type', 'AST_CALL')
    func_nodes = [i for i in func_nodes if G.get_name_from_child(i) in sink]

    ret_paths = []
    caller_list = []
    for func_node in func_nodes:
        # we assume only one obj_decl edge
        func_name = G.get_name_from_child(func_node)
        # print('func_name debug##', func_name)
        caller = func_node
        # FROM AST NODE TO OPG NODE
        caller = G.find_nearest_upper_CPG_node(caller)
        caller_list.append("{} called {}".format(caller, func_name))
        # caller_name = G.get_name_from_child(caller)
        # print("{} called {}".format(caller_name, func_name))
        pathes = G._dfs_upper_by_edge_type(caller, "OBJ_REACHES")
        # here we treat the single calling as a possible path
        pathes.append([caller])
        # NOTE: reverse the path here!
        ret_paths.extend(pathes)
        for path in pathes:
            # ret_paths.append(path)
            path.reverse()
            res_path_text += get_path_text(G, path, caller)
    # print('=========ret_pathes debug=========\n', ret_paths)
    # print(res_path_text)
    # ret_paths: source 2 sink lists
    # res_path_text: source 2 sink texts
    return ret_paths, res_path_text, caller_list

def get_obj_defs(G, obj_nodes=[]):
    """
    input a list of objs and return a list of def asts
    """
    cur_creater = []
    for node in obj_nodes:
        # for each objects, store the creater of the obj and used obj
        ast_node = G.get_obj_def_ast_node(node)
        cur_creater.append(ast_node)
    return cur_creater


def obj_traceback(G, start_node):
    """
    traceback from the target object node, based on obj level dependency
    Args:
        G: the graph
        start_node: the start object node
    Returns:
        pathes(list): the pathes to the target object
        def pathes(list): AST nodes that defines the objects in the pathes
        text pathes(str): the human-friendly text pathes
    """
    text_path = ""
    ast_pathes = []
    obj_pathes = G._dfs_upper_by_edge_type(source=start_node, edge_type="CONTRIBUTES_TO")

    for obj_p in obj_pathes:
        obj_def = get_obj_defs(G, obj_p)
        obj_def.reverse()
        ast_pathes.append(obj_def)
        text_path += get_path_text(G, obj_def)
    return obj_pathes, ast_pathes, text_path

'''
def obj_traceback(G, vul_type, start_node=None):
    """
    traceback from the sink function, based on obj level dependency
    Args:
        G: the graph
        vul_type: the type of the vulnerability
    Return:

    """
    # attention
    text_path = ""
    # we put the caller ast to the last element of path
    pathes = []
    creaters = []
    users = []
    caller_list = []
    sink_functions = signature_lists[vul_type]
    func_nodes = G.get_node_by_attr('type', 'AST_METHOD_CALL')
    func_nodes += G.get_node_by_attr('type', 'AST_CALL')
    for func_node in func_nodes:
        func_name = G.get_name_from_child(func_node)
        if func_name in sink_functions:
            func_edges = G.get_in_edges(func_node, edge_type="SCOPE_TO_CALLER")
            scope_nodes = [e[0] for e in func_edges]
            for sn in scope_nodes:
                arg_names = G.get_child_nodes(sn, edge_type="SCOPE_TO_VAR", child_name='arguments')
                if len(arg_names) == 0:
                    continue
                arg_obj = G.get_child_nodes(arg_names[0], edge_type="NAME_TO_OBJ")
                prop_name_nodes = G.get_prop_name_nodes(arg_obj[0])
                arg_nodes = G.get_prop_obj_nodes(arg_obj)
                for an in arg_nodes:
                    cur_pathes = G._dfs_upper_by_edge_type(source=an, edge_type="CONTRIBUTES_TO")
                    for path in cur_pathes:
                        path.reverse()
                        path.append(G.find_nearest_upper_CPG_node(func_node))
                        pathes.append(path)

    for path in pathes:
        cur_creater = []
        for node in path[:-1]:
            # for each objects, store the creater of the obj and used obj
            ast_node = G.get_obj_def_ast_node(node)
            cur_creater.append(ast_node)
        # cur_creater.reverse()
        cur_creater.append(path[-1])
        text_path += get_path_text(G, cur_creater)
        creaters.append(cur_creater)

    # print(pathes, creaters, text_path)
    return pathes, text_path, creaters

'''
def obj_traceback_crx(G, vul_type, start_node=None):
    """
    traceback from the sink function, based on obj level dependency
    Args:
        G: the graph
        vul_type: the type of the vulnerability
    Return:

    """
    # attention
    text_path = ""
    # we put the caller ast to the last element of path
    pathes = []
    creaters = []
    users = []
    caller_list = []

    sink = []
    sink.extend(crx_sink)
    # sink.extend(user_sink)
    sink.extend(ctrl_sink)
    # func_nodes: the entries of traceback, which are all the CALLs of functions
    func_nodes = G.get_node_by_attr('type', 'AST_METHOD_CALL')
    func_nodes += G.get_node_by_attr('type', 'AST_CALL')
    func_nodes = [i for i in func_nodes if G.get_name_from_child(i) in sink]

    for func_node in func_nodes:
        func_name = G.get_name_from_child(func_node)
        func_edges = G.get_in_edges(func_node, edge_type="SCOPE_TO_CALLER")
        scope_nodes = [e[0] for e in func_edges]
        for sn in scope_nodes:
            arg_names = G.get_child_nodes(sn, edge_type="SCOPE_TO_VAR", child_name='arguments')
            if len(arg_names) == 0:
                continue
            arg_obj = G.get_child_nodes(arg_names[0], edge_type="NAME_TO_OBJ")
            prop_name_nodes = G.get_prop_name_nodes(arg_obj[0])
            arg_nodes = G.get_prop_obj_nodes(arg_obj)
            for an in arg_nodes:
                cur_pathes = G._dfs_upper_by_edge_type(source=an, edge_type="CONTRIBUTES_TO")
                for path in cur_pathes:
                    path.reverse()
                    path.append(G.find_nearest_upper_CPG_node(func_node))
                    pathes.append(path)

    for path in pathes:
        cur_creater = []
        for node in path[:-1]:
            # for each objects, store the creater of the obj and used obj
            ast_node = G.get_obj_def_ast_node(node)
            cur_creater.append(ast_node)
        # cur_creater.reverse()
        cur_creater.append(path[-1])
        text_path += get_path_text(G, cur_creater)
        creaters.append(cur_creater)

    # print(pathes, creaters, text_path)
    return pathes, text_path, creaters


