from src.core.graph import Graph
from src.core.utils import *
from src.core.logger import *
from src.plugins.internal.handlers.event_loop import event_loop_threading, other_attack
from .utils import emit_thread
import threading
from src.core.checker import obj_traceback
from src.plugins.internal.handlers.event_loop import attack_dic
from src.core.utils import wildcard
import time

logger = loggers.main_logger

def setup_extension_builtins(G: Graph):
    setup_utils(G)

# setup three functions: RegisterFunc, TriggerEvent, MarkSource here for use
def setup_utils(G: Graph):
    G.add_blank_func_to_scope('RegisterFunc', scope=G.get_cur_window_scope(), python_func=RegisterFunc)
    G.add_blank_func_to_scope('TriggerEvent', scope=G.get_cur_window_scope(), python_func=TriggerEvent)
    G.add_blank_func_to_scope('MarkSource', scope=G.get_cur_window_scope(), python_func=MarkSource)
    G.add_blank_func_to_scope('MarkSink', scope=G.get_cur_window_scope(), python_func=MarkSink)
    G.add_blank_func_to_scope('MarkAttackEntry', scope=G.get_cur_window_scope(), python_func=MarkAttackEntry)
    G.add_blank_func_to_scope('debug_sink', scope=G.get_cur_window_scope(), python_func=debug_sink)
    G.add_blank_func_to_scope('debug_thread', scope=G.get_cur_window_scope(), python_func=debug_thread)
    G.add_blank_func_to_scope('sink_function', scope=G.get_cur_window_scope(), python_func=sink_function)

# event is a string
# func is the function's declaration node ID
def RegisterFunc(G: Graph, caller_ast, extra, _, *args):
    listener = args[0].values[0]
    func = args[1].obj_nodes[0]
    cur_thread = threading.current_thread()
    # print(args)
    print('=========Register listener: '+ listener + ' in ' + cur_thread.name)
    if G.thread_version and G.ablation_mode in ["coco-single", "coco"]:
        register_event_check(G, listener, func)
    else:
        if listener in G.eventRegisteredFuncs:
            G.eventRegisteredFuncs[listener].append(func)
        else:
            G.eventRegisteredFuncs[listener] = [func]
    return NodeHandleResult()

def register_event_check(G:Graph, listener, func):
    with G.eventRegisteredFuncs_lock:
        if listener in G.eventRegisteredFuncs:
            G.eventRegisteredFuncs[listener].append(func)
        else:
            G.eventRegisteredFuncs[listener] = [func]
    event = G.listener_event_dic[listener]
    with G.event_loop_lock:
        print("register_event_check")
        # names = [i['eventName'] for i in G.event_loop]
        if event in G.event_loop:
            for ev in G.event_loop[event]:
                emit_thread(G, event_loop_threading, (G, ev, G.mydata.pickle_up()))
            del G.event_loop[event]

def UnregisterFunc(G: Graph, caller_ast, extra, _, *args):
    event = args[0].values[0]
    func = args[1].obj_nodes[0]
    if G.thread_version and G.ablation_mode in ["coco-single", "coco"]:
        with G.eventRegisteredFuncs_lock:
            if event in G.eventRegisteredFuncs:
                del G.eventRegisteredFuncs[event]
    else:
        if event in G.eventRegisteredFuncs:
            del G.eventRegisteredFuncs[event]
    return NodeHandleResult()


# store the events in the queue first
# trigger the events in turn after all the events entered the queue
# NOTE: the eventName and info we store are both obj node ID in graph
def TriggerEvent(G: Graph, caller_ast, extra, _, *args):
    # print(args)
    # eventName = G.get_node_attr(args[0].obj_nodes[0])['code']
    eventName = args[0].values[0]
    info = args[1].obj_nodes[0]
    event = {'eventName': eventName, 'info': info, 'extra':extra, 'caller_ast':caller_ast}
    """for prop in G.get_prop_obj_nodes(event['info']):
        print(prop)
        for data in G.get_prop_obj_nodes(prop):
            print(G.get_prop_obj_nodes(data))"""
    # trigger event right away
    listener = G.event_listener_dic[eventName]
    if G.thread_version and G.ablation_mode in ["coco-single", "coco"]:
        with G.eventRegisteredFuncs_lock:
            listener_not_registered = True if listener not in G.eventRegisteredFuncs else False
        if listener_not_registered:
            print('listener not registered, store ' , event['eventName'], ' to loop')
            with G.event_loop_lock:
                if eventName in G.event_loop:
                    G.event_loop[eventName].append(event)
                else:
                    G.event_loop[eventName] = [event]
        else:
            with G.event_record_lock:
                if eventName in G.event_record:
                    G.event_record[eventName]+=1
                else:
                    G.event_record[eventName]=0
                tmp_time = G.event_record[eventName]
            if tmp_time>G.event_max_time:
                # print("happen > 5 times")
                emit_thread(G, event_loop_threading, (G, event, G.mydata.pickle_up()), thread_age = -1)
            else:
                print("TriggerEvent emit_thread directly")
                current_thread = threading.current_thread()
                with G.thread_info_lock:
                    cur_info = G.thread_infos[current_thread.name]
                thread_age = cur_info.thread_age
                emit_thread(G, event_loop_threading, (G, event, G.mydata.pickle_up()), thread_age=thread_age)
    else:
        G.eventQueue.insert(0, event)
    return NodeHandleResult()


def MarkSourceInGraph(G, sourceObj, sourceName):
    sons = G.get_off_spring(sourceObj)
    sons.add(sourceObj)
    for son in sons:
        G.set_node_attr(son, ('tainted',True))
        # every path is a tuple with (path, source_name)
        G.set_node_attr(son, ('taint_flow', [([son],sourceName)]))
    return NodeHandleResult()

def MarkSource(G: Graph, caller_ast, extra, _, *args):
    sensitiveSource = args[0].obj_nodes[0]
    source_name = args[1].values[0]
    sons = G.get_off_spring(sensitiveSource)
    sons.add(sensitiveSource)
    for son in sons:
        G.set_node_attr(son, ('tainted',True))
        # every path is a tuple with (path, source_name)
        G.set_node_attr(son, ('taint_flow', [([son],source_name)]))
        G.set_node_attr(son,("code", wildcard))
        G.set_node_attr(son, ("value", wildcard))
    return NodeHandleResult()

def MarkSink(G: Graph, caller_ast, extra, _, *args):
    new_sink = args[0].obj_nodes[0]
    G.sinks.add(new_sink)
    return NodeHandleResult()

def MarkAttackEntry(G: Graph, caller_ast, extra, _, *args):
    type = args[0].values[0]
    listener = args[1].obj_nodes[0]
    if listener!=G.undefined_obj:
        if decide_valid_attacks(type):
            with G.attacked_lock:
                if not G.attacked:
                    G.attacked = True
        #  attack right away!
        entry = [type, listener]
        if G.thread_version and G.ablation_mode in ["coco-single", "coco"]:
            thread_age = -1 if type == "bg_tabs_onupdated" else 1
            if entry[0] in attack_dic:
                attack_func = attack_dic[entry[0]]
                emit_thread(G, attack_func, (G, entry, G.mydata.pickle_up()), thread_age = thread_age)
            else:
                emit_thread(G, other_attack, (G, entry, G.mydata.pickle_up()), thread_age = thread_age)
        else:
            # if this attack should be called later
            if type=="bg_tabs_onupdated":
                G.attackEntries.insert(0, entry)
            else:
                # if type in attack_dic:
                #     attack_dic[type](G, entry)
                # else:
                #     other_attack(G, entry)
                G.attackEntries.insert(0, entry)

    return NodeHandleResult()


def MarkAttackEntryOnProperty(G: Graph, type, listener):
    if listener!=G.undefined_obj:
        if type not in invalid_onEvents_attacks:
            with G.attacked_lock:
                if not G.attacked:
                    G.attacked = True
        #  attack right away!
        entry = [type, listener]
        if G.thread_version and G.ablation_mode in ["coco-single", "coco"]:
            if entry[0] in attack_dic:
                attack_func = attack_dic[entry[0]]
                emit_thread(G, attack_func, (G, entry, G.mydata.pickle_up()))
            else:
                emit_thread(G, other_attack, (G, entry, G.mydata.pickle_up()))
        else:
            G.attackEntries.insert(0, entry)

def debug_sink(G: Graph, caller_ast, extra, _, *args):
    print('debug code reached')
    print("In thread: ", threading.current_thread().name)
    print(args)
    # loggers.thread_logger.info(int(args[0].values[0]))
    print(args[0].values)
    sus_objs = set()
    for arg in args:
        for obj in arg.obj_nodes:
            sus_objs.add(obj)
    tmp_objs = set()
    for obj in sus_objs:
        offsprings = G.get_off_spring(obj)
        tmp_objs.update(offsprings)
    sus_objs.update(tmp_objs)
    print("sus_objs", sus_objs)
    for obj in sus_objs:
        print(obj)
        print(G.get_node_attr(obj))
    return NodeHandleResult()


def debug_thread(G: Graph, caller_ast, extra, _, *args):
    loggers.thread_logger.info(int(args[0].values[0]))
    

# check the sink function
def sink_function(G: Graph, caller_ast, extra, _, *args):
    sink_name = args[-1].values[0]
    sus_objs = set()
    # print('sink function reached:', args[-1].values[0])
    # get sus_objs and sink_nam
    if len(args)>1:
        # len(args)-1 is because the last arg is the name of the sink.
        for i in range(len(args)-1):
            arg = args[i]
            sus_objs.update(arg.obj_nodes)
            if arg.value_sources:
                for objs in arg.value_sources:
                    sus_objs.update(set(objs))
    SpringObjs = set()
    for obj in sus_objs:
        SpringObjs.update(G.get_off_spring(obj))
    sus_objs.update(SpringObjs)
    # if no obj is required, control flow reaches
    if len(sus_objs)==0:
        with G.attacked_lock:
            if not G.attacked:
                return NodeHandleResult()
        print(sty.fg.li_green + sty.ef.inverse + f'~~~tainted detected!~~~in extension: ' \
              + G.package_name + ' with ' + sink_name + sty.rs.all)
        res = str(time.time())+"----"+'tainted detected!~~~in extension: ' + G.package_name + ' with ' + sink_name + '\n'
        res_dir = os.path.join(G.package_name, 'opgen_generated_files')
        with open(os.path.join(res_dir, G.result_file), 'a') as f:
            f.write(res)
        G.detected = True
    else:
        # check whether the taint flow is vulnerable, check first whether it is attacked yet.
        check = False
        with G.attacked_lock:
            if G.attacked:
                check = True
        for obj in sus_objs:
            if check_taint(G, obj, sink_name, check):
                G.detected = True
    return NodeHandleResult()


def sink_function_in_graph(G: Graph, args, sink_name):
    sus_objs = set()
    # print('sink function reached')
    # get sus_objs and sink_name
    for arg in args:
        sus_objs.update(arg.obj_nodes)
        if arg.value_sources:
            for objs in arg.value_sources:
                sus_objs.update(set(objs))
    SpringObjs = set()
    for obj in sus_objs:
        SpringObjs.update(G.get_off_spring(obj))
    sus_objs.update(SpringObjs)
    # if no obj is required, control flow reaches
    if len(sus_objs) == 0:
        with G.attacked_lock:
            if not G.attacked:
                return NodeHandleResult()
        print(sty.fg.li_green + sty.ef.inverse + f'~~~tainted detected!~~~in extension: ' \
              + G.package_name + ' with ' + sink_name + sty.rs.all)
        res = str(time.time())+"----"+'tainted detected!~~~in extension: ' + G.package_name + ' with ' + sink_name + '\n'
        res_dir = os.path.join(G.package_name, 'opgen_generated_files')
        with open(os.path.join(res_dir, G.result_file), 'a') as f:
            f.write(res)
        G.detected = True
    else:
        # check whether the taint flow is vulnerable, check first whether it is attacked yet.
        check = False
        with G.attacked_lock:
            if G.attacked:
                check = True
        for obj in sus_objs:
            if check_taint(G, obj, sink_name, check):
                G.detected = True
    return NodeHandleResult()



invalid_taint  = [("cs_window_eventListener_message","window_postMessage_sink"),
                  ("cs_window_eventListener_message", "bg_external_port_postMessage_sink"),
                  ("bg_chrome_runtime_MessageExternal", "window_postMessage_sink"),
                  ("bg_chrome_runtime_MessageExternal", "sendResponseExternal_sink"),
                  ("bg_external_port_onMessage", "window_postMessage_sink"),
                  ("storage_sync_get_source", "chrome_storage_sync_set_sink"),
                  # ("storage_sync_get_source", "fetch_options_sink"),
                  ("XMLHttpRequest_responseText_source", "XMLHttpRequest_post_sink"),
                  ("cookies_source", "chrome_cookies_set_sink"),
                  ("cookie_source", "chrome_cookies_set_sink"),
                  ("cookies_source", "chrome_cookies_remove_sink"),
                  # ("management_getAll_source", "management_setEnabled_id"),
                  # ("management_getAll_source", "management_setEnabled_enabled"),
                  ("storage_local_get_source", "chrome_storage_local_set_sink"),
                  ("storage_local_get_source", "XMLHttpRequest_url_sink"),
                  ("storage_sync_get_source", "chrome_storage_sync_set_sink"),
                  # ("cookie_source" , "localStorage_setItem_value"),
                  # ("storage_sync_get_source", "fetch_resource_sink"),
                  # ("fetch_source", "chrome_storage_sync_set_sink"),
                ]

# invalid attack
invalid_execution_attacks = ["bg_tabs_onupdated", "bg_externalNativePort_onMessage"]
invalid_onEvents_attacks = ["onload", "onreadystatechange", "onerror", "ready"]

# API execution
bg_valid_execution_sources = ["bg_external_port_onMessage", "bg_chrome_runtime_MessageExternal"]
cs_valid_execution_sources = ["document_on_event"]
cs_valid_execution_sources_starts = ["cs_window_", "document_"]
cs_invalid_execution_sources_ends = ["change", "click", "scroll", "load", "mouseover", "mouseout", "unload", "DOMContentLoaded", "mousemove", "mousedown", "fetch", "keydown", "touchmove", "resize", "touch"]
doc_valid_sources = [
    "Document_element_href",
    "document_body_innerText",
    "jQuery_ajax_result_source",
    "jQuery_get_source",
    "jQuery_post_source",
    "fetch_source",
    "XMLHttpRequest_responseText_source",
    "XMLHttpRequest_responseXML_source"
]
cs_attack_execution_sink = [
    # storage
    "chrome_storage_sync_set_sink",
    "chrome_storage_sync_remove_sink",
    "chrome_storage_sync_clear_sink",
    "chrome_storage_local_set_sink",
    "chrome_storage_local_remove_sink",
    "chrome_storage_local_clear_sink",
    "bg_localStorage_remove_sink",
    "bg_localStorage_setItem_key_sink",
    "bg_localStorage_setItem_value_sink",
    "bg_localStorage_clear_sink"
    "jQuery_ajax_url_sink",
    "jQuery_ajax_settings_data_sink",
    "jQuery_ajax_settings_url_sink",
    "jQuery_get_url_sink",
    "jQuery_post_data_sink",
    "jQuery_post_url_sink",
    "fetch_resource_sink",
    "fetch_options_sink",
    "XMLHttpRequest_url_sink",
    "XMLHttpRequest_post_sink",
    "eval_sink",
    "chrome_tabs_executeScript_sink",
    "chrome_cookies_set_sink",
    "chrome_cookies_remove_sink",
    "chrome_downloads_download_sink",
    "chrome_downloads_removeFile_sink",
    "chrome_downloads_erase_sink",
    "chrome_browsingData_remove_sink",
    "management_setEnabled_id",
    "management_setEnabled_enabled",
    "document_execCommand_sink",
    "BookmarkCreate_sink",
    "BookmarkRemove_sink",
    "BookmarkSearchQuery_sink"
    ]

# bg attack sink only
bg_attack_execution_sink = [
    "cs_localStorage_remove_sink",
    "cs_localStorage_setItem_key_sink",
    "cs_localStorage_setItem_value_sink",
    "cs_localStorage_clear_sink",
    "document_write_sink",
    "document_execCommand_sink",
    "JQ_obj_val_sink",
    "JQ_obj_html_sink"
]

# DATA exfiltration
extension_data_source = [
"bg_localStorage_getItem_source",
'topSites_source',
'cookie_source',
'cookies_source',
'CookieStores_source' ,
'storage_sync_get_source',
'storage_local_get_source',
'HistoryItem_source',
'VisitItem_source',
'DownloadItem_source',
'iconURL_source',
'BookmarkTreeNode_source',
"management_getAll_source",
"management_getSelf_source"
]

extension_data_source_no_attack = [
"cs_localStorage_getItem_source",
"jQuery_ajax_result_source",
"jQuery_get_source",
"jQuery_post_source",
"fetch_source",
"XMLHttpRequest_responseText_source",
"XMLHttpRequest_responseXML_source"
]

extension_data_out = [
    "window_postMessage_sink",
    "bg_external_port_postMessage_sink",
    "sendResponseExternal_sink",
    'externalNativePortpostMessage_sink',
    "document_write_sink",
    "JQ_obj_val_sink",
    "JQ_obj_html_sink",
    "localStorage_remove_sink",
    "localStorage_setItem_key",
    "localStorage_setItem_value",
    "document_execCommand_sink"
]
# invalid: document_eventListener_scroll, document_eventListener_click, cs_window_eventListener_click, cs_window_eventListener_scroll

def decide_valid_attacks(type):
    res = True
    if type in invalid_execution_attacks:
        res = False
    elif "eventListener_" in type:
        if type.split("eventListener_")[0] in cs_valid_execution_sources_starts and type.split("eventListener_")[1] in cs_invalid_execution_sources_ends:
            res = False
    return res

def decide_valid_taint_flow(source_name, sink_name, attacked):
    res = False
    # API  execution: sensitive info should be from attacker and to sink
    if source_name in bg_valid_execution_sources or source_name in doc_valid_sources:
        if sink_name in cs_attack_execution_sink or sink_name in bg_attack_execution_sink:
            res = True
    elif source_name in cs_valid_execution_sources or \
            (source_name.split("eventListener_")[0] in cs_valid_execution_sources_starts and source_name.split("eventListener_")[1] not in cs_invalid_execution_sources_ends):
        if sink_name in cs_attack_execution_sink:
            res = True
    # data exfiltration: sensitive info should be out
    if source_name in extension_data_source:
        if sink_name in extension_data_out and attacked:
            res = True
    elif source_name in extension_data_source_no_attack:
        if sink_name in extension_data_out:
            res = True
    # user action or document load, onEvent
    # elif source_name in invalid_execution_attacks or source_name in invalid_onEvents_attacks:
    #     res = False
    # # invalid_taint
    # if (source_name, sink_name) in invalid_taint:
    #     res = False
    return res


def decide_valid_taint_flow_dx(source_name, sink_name, attacked):
    res = True
    if (source_name, sink_name) in invalid_taint:
        res = False
    if sink_name in ['chrome_tabs_create_sink']:
        res = False
    return res


def check_taint(G, obj, sink_name, attacked):
    attrs = G.get_node_attr(obj)
    check_res = False
    if attrs.get('tainted') and 'taint_flow' in attrs:
        res = ""
        for flow in attrs['taint_flow']:
            path = flow[0]
            source_name = flow[1]
            if not G.dx:
                if not decide_valid_taint_flow(source_name, sink_name, attacked):
                    continue
            else:
                if not decide_valid_taint_flow_dx(source_name, sink_name, attacked):
                    continue
            ast_path = [G.get_obj_def_ast_node(node) for node in path]
            ast_path = [node for node in ast_path if node]
            from src.core.checker import get_path_text
            res += str(time.time())+"----"+'tainted detected!~~~in extension: ' + G.package_name + ' with ' + sink_name + '\n'
            res += str(flow) + '\n'
            res += ('from ' + source_name + ' to ' + sink_name + '\n')
            # res += (str(ast_path) + '\n')
            # print(ast_path)
            res += (get_path_text(G, ast_path) + '\n')
            print(sty.fg.li_green + sty.ef.inverse + f'~~~tainted detected!~~~in extension: ' \
                  + G.package_name + ' with ' + sink_name + sty.rs.all)
        res_dir = os.path.join(G.package_name, 'opgen_generated_files')
        if res!='':
            with open(os.path.join(res_dir, G.result_file), 'a') as f:
                f.write(res)
            check_res = True
    return check_res



