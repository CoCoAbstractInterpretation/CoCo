from src.core.utils import NodeHandleResult
from src.plugins.internal.handlers.functions import call_function
from src.core.graph import Graph
from src.core.utils import wildcard
import threading

def event_loop_threading(G: Graph, event, mydata):
    G.mydata.unpickle_up(mydata)
    cur_thread = threading.current_thread()
    print('=========processing eventName: ' + event['eventName'] + ' in ' + cur_thread.name)
    if event['eventName'] in event_listener_dic:
        listener = event_listener_dic[event['eventName']][0]
        with G.eventRegisteredFuncs_lock:
            listener_not_registered = True if listener not in G.eventRegisteredFuncs else False
        if listener_not_registered:
            print(event['eventName'] , ': event listener not registered')
            return
        func = event_listener_dic[event['eventName']][1]
        func(G, event)


def event_loop_no_threading(G: Graph):
    print('========SEE eventRegisteredFuncs:========')
    for i in G.eventRegisteredFuncs:
        print(i, G.eventRegisteredFuncs[i])
        print(G.get_obj_def_ast_node(G.eventRegisteredFuncs[i]))
    print('========DO ATTACK:========')
    # run the original events before the attack
    originalEventQueue = G.eventQueue.copy()
    G.eventQueue = []
    while len(originalEventQueue)!=0:
        event = originalEventQueue.pop()
        print('=========processing eventName:', event['eventName'])
        if event['eventName'] in event_listener_dic:
            listener = event_listener_dic[event['eventName']][0]
            listener_not_registered = True if listener not in G.eventRegisteredFuncs else False
            if listener_not_registered:
                print(event['eventName'], ': event listener not registered')
                continue
            func = event_listener_dic[event['eventName']][1]
            func(G, event)
    # run the attack
    while len(G.attackEntries)!=0:
        entry = G.attackEntries.pop()
        type = entry[0]
        if type in attack_dic:
            attack_dic[type](G, entry)
        else:
            other_attack(G, entry)
    # see whether there are other new events
    while len(G.eventQueue)!=0:
        event = G.eventQueue.pop()
        print('=========processing eventName:', event['eventName'])
        if event['eventName'] in event_listener_dic:
            listener = event_listener_dic[event['eventName']][0]
            listener_not_registered = True if listener not in G.eventRegisteredFuncs else False
            if listener_not_registered:
                print(event['eventName'], ': event listener not registered')
                continue
            func = event_listener_dic[event['eventName']][1]
            func(G, event)


def bg_chrome_runtime_MessageExternal_attack(G, entry, mydata=None):
    if G.thread_version:
        cur_thread = threading.current_thread()
        print('=========Perform attack: ' + str(entry) + ' in ' + cur_thread.name)
        G.mydata.unpickle_up(mydata)
    else:
        print('=========Perform attack: ' + str(entry))
    wildcard_msg_obj = G.add_obj_node(js_type='object' if G.check_proto_pollution
                                       else None, value=wildcard)
    G.set_node_attr(wildcard_msg_obj, ('tainted', True))
    G.set_node_attr(wildcard_msg_obj, ('fake_arg', True))
    G.set_node_attr(wildcard_msg_obj, ('taint_flow', [([wildcard_msg_obj], str(entry[0]))]))
    func_objs = G.get_objs_by_name('MessageSenderExternal', scope=G.bg_scope, branches=[])
    sendResponseExternal = G.get_objs_by_name('sendResponseExternal', scope=G.bg_scope, branches=[])
    args = [NodeHandleResult(obj_nodes=[wildcard_msg_obj]), NodeHandleResult(obj_nodes=[wildcard_msg_obj]), NodeHandleResult(obj_nodes=sendResponseExternal)]
    func_objs = [entry[1]]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                          caller_ast=None, is_new=False, stmt_id='Unknown',
                                                         mark_fake_args=False)

def bg_chrome_runtime_onConnectExternal_attack(G, entry, mydata=None):
    if G.thread_version:
        cur_thread = threading.current_thread()
        print('=========Perform attack: ' + str(entry) + ' in ' + cur_thread.name)
        G.mydata.unpickle_up(mydata)
    else:
        print('=========Perform attack: ' + str(entry))
    args = [NodeHandleResult()]
    func_objs = G.get_objs_by_name('externalPort', scope=G.bg_scope, branches=[])
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                  caller_ast=None, is_new=True, stmt_id='Unknown', func_name='externalPort',
                                                  mark_fake_args=True)
    returned_result.obj_nodes = created_objs
    args = [returned_result]
    # args = [NodeHandleResult(obj_nodes=[wildcard_msg_obj]), MessageSenderExternal, NodeHandleResult(obj_nodes=sendResponseExternal)]
    func_objs = [entry[1]]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                          caller_ast=None, is_new=False, stmt_id='Unknown',
                                                         mark_fake_args=False)

def bg_external_port_onMessage_attack(G, entry, mydata=None):
    if G.thread_version:
        cur_thread = threading.current_thread()
        print('=========Perform attack: ' + str(entry) + ' in ' + cur_thread.name)
        G.mydata.unpickle_up(mydata)
    else:
        print('=========Perform attack: ' + str(entry))
    wildcard_msg_obj = G.add_obj_node(js_type='object' if G.check_proto_pollution
                                       else None, value=wildcard)
    G.set_node_attr(wildcard_msg_obj, ('tainted', True))
    G.set_node_attr(wildcard_msg_obj, ('fake_arg', True))
    G.set_node_attr(wildcard_msg_obj, ('taint_flow', [([wildcard_msg_obj], str(entry[0]))]))
    sendResponseExternal = G.get_objs_by_name('sendResponseExternal', scope=G.bg_scope, branches=[])
    args = [NodeHandleResult(obj_nodes=[wildcard_msg_obj]), NodeHandleResult(obj_nodes=[wildcard_msg_obj]), NodeHandleResult(obj_nodes=sendResponseExternal)]
    func_objs = [entry[1]]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                          caller_ast=None, is_new=False, stmt_id='Unknown',
                                                         mark_fake_args=False)

def bg_externalNativePort_onMessage_attack(G, entry, mydata=None):
    if G.thread_version:
        cur_thread = threading.current_thread()
        print('=========Perform event: ' + str(entry) + ' in ' + cur_thread.name)
        G.mydata.unpickle_up(mydata)
    else:
        print('=========Perform event: ' + str(entry))
    wildcard_msg_obj = G.add_obj_node(js_type='object' if G.check_proto_pollution
                                       else None, value=wildcard)
    G.set_node_attr(wildcard_msg_obj, ('fake_arg', True))
    sendResponseExternal = G.get_objs_by_name('sendResponseExternalNative', scope=G.bg_scope, branches=[])
    args = [NodeHandleResult(obj_nodes=[wildcard_msg_obj]), NodeHandleResult(obj_nodes=[wildcard_msg_obj]), NodeHandleResult(obj_nodes=sendResponseExternal)]
    func_objs = [entry[1]]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                          caller_ast=None, is_new=False, stmt_id='Unknown',
                                                         mark_fake_args=False)


def bg_tabs_onupdated_attack(G, entry, mydata=None):
    if G.thread_version:
        cur_thread = threading.current_thread()
        print('=========Perform event: ' + str(entry) + ' in ' + cur_thread.name)
        G.mydata.unpickle_up(mydata)
    else:
        print('=========Perform event: ' + str(entry))
    args = [NodeHandleResult()]
    func_objs = G.get_objs_by_name('Tab', scope=G.bg_scope, branches=[])
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                  caller_ast=None, is_new=True, stmt_id='Unknown', func_name='Tab',
                                                  mark_fake_args=False)
    returned_result.obj_nodes = created_objs
    args = [NodeHandleResult(), NodeHandleResult(), returned_result]
    # args = [NodeHandleResult(obj_nodes=[wildcard_msg_obj]), MessageSenderExternal, NodeHandleResult(obj_nodes=sendResponseExternal)]
    func_objs = [entry[1]]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                          caller_ast=None, is_new=False, stmt_id='Unknown',
                                                         mark_fake_args=False)


def window_eventListener_attack(G, entry, mydata=None):
    if G.thread_version:
        G.mydata.unpickle_up(mydata)
        cur_thread = threading.current_thread()
        print('========Perform attack: ' + str(entry) + ' in ' + cur_thread.name)
    else:
        print('=========Perform attack: ' + str(entry))
    func_objs = [entry[1]]
    # since there is only one parameter in this function, which is fake, we can use the mark_fake_args in call_function
    returned_result, created_objs = call_function(G, func_objs, args=[], this=NodeHandleResult(), extra=None,
                                                          caller_ast=None, is_new=False, stmt_id='Unknown',
                                                          mark_fake_args=True, fake_arg_srcs=[entry[0]])


def other_attack(G, entry, mydata=None):
    if G.thread_version:
        G.mydata.unpickle_up(mydata)
        cur_thread = threading.current_thread()
        print('=========Perform attack: ' + str(entry) + ' in ' + cur_thread.name)
    else:
        print('=========Perform attack: ' + str(entry))
    func_objs = [entry[1]]
    args = []  # no args
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                                                          caller_ast=None, is_new=False, stmt_id='Unknown',
                                                          mark_fake_args=True, fake_arg_srcs=[entry[0]])
def cs_chrome_runtime_connect(G, event):
    # handle the parameter of the callback function
    connectInfo = G.get_child_nodes(event['info'], child_name='connectInfo')[0]
    connectInfo = G.get_child_nodes(connectInfo, edge_type='NAME_TO_OBJ')[0]
    args = [NodeHandleResult(obj_nodes=[connectInfo])]
    func_objs = G.get_objs_by_name('Port', scope=G.bg_scope, branches=[])
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(), extra=None,
                  caller_ast=None, is_new=True, stmt_id='Unknown', func_name='Port',
                  mark_fake_args=False)
    returned_result.obj_nodes = created_objs
    with G.eventRegisteredFuncs_lock:
        func_objs = G.eventRegisteredFuncs['bg_chrome_runtime_onConnect']
    args = [returned_result]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(),extra=None,
                    caller_ast=None, is_new=False, stmt_id='Unknown',
                    mark_fake_args=False)

def cs_port_postMessage(G, event):
    message = G.get_child_nodes(event['info'], child_name='message')[0]
    message = G.get_child_nodes(message, edge_type='NAME_TO_OBJ')[0]
    message = G.copy_obj(message, ast_node=None, deep=True)
    # print('message obj node:', G.get_node_attr(message))
    args = [NodeHandleResult(obj_nodes=[message])]
    with G.eventRegisteredFuncs_lock:
        func_objs = G.eventRegisteredFuncs['bg_port_onMessage']
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(),extra=None,
                caller_ast=None, is_new=False, stmt_id='Unknown',
                mark_fake_args=False)

def bg_port_postMessage(G, event):
    message = G.get_prop_obj_nodes(event['info'], prop_name='message')[0]
    message = G.copy_obj(message, ast_node=None, deep=True)
    args = [NodeHandleResult(obj_nodes=[message])]
    with G.eventRegisteredFuncs_lock:
        func_objs = G.eventRegisteredFuncs['cs_port_onMessage']
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(),extra=None,
                caller_ast=None, is_new=False, stmt_id='Unknown',
                mark_fake_args=False)

def cs_chrome_runtime_sendMessage(G, event):
    sender_responseCallback = G.get_prop_obj_nodes(event['info'], prop_name='responseCallback')[0]
    if sender_responseCallback != G.undefined_obj:
        new_event = 'cs_chrome_runtime_sendMessage_onResponse'  # cs on getting the response from bg
        if G.thread_version:
            from src.plugins.internal.modeled_extension_builtins import register_event_check
            register_event_check(G, new_event, sender_responseCallback)
        else:
            if new_event in G.eventRegisteredFuncs:
                if sender_responseCallback not in G.eventRegisteredFuncs[new_event]:
                    G.eventRegisteredFuncs[new_event].append(sender_responseCallback)
            else:
                G.eventRegisteredFuncs[new_event] = [sender_responseCallback]
        print('========SEE eventRegisteredFuncs after adding onResponse:========')
        for i in G.eventRegisteredFuncs:
            print(i, G.eventRegisteredFuncs[i])
            print(G.get_obj_def_ast_node(G.eventRegisteredFuncs[i]))
    # for tmp in G.get_prop_obj_nodes(event['info'], prop_name = 'message'):
    #     G.debug_sink_in_graph(tmp)
    messages = G.get_prop_obj_nodes(event['info'], prop_name = 'message')
    # print("cs_chrome_runtime_sendMessage debug_sink in graph")
    # G.debug_sink_in_graph(messages[0])
    copied_messages = []
    for tmp in messages:
        copied_messages.append(G.copy_obj((tmp), ast_node=None, deep=True))
    func_objs = G.get_objs_by_name('MessageSender', scope=G.bg_scope, branches=[])
    MessageSender, created_objs = call_function(G, func_objs, args=[], this=NodeHandleResult(),
                  extra=None,
                  caller_ast=None, is_new=True, stmt_id='Unknown',
                  func_name='MessageSender',
                  mark_fake_args=False)
    MessageSender.obj_nodes = created_objs
    sendResponse = G.get_objs_by_name('sendResponse', scope=G.get_cur_window_scope(), branches=[])
    args = [NodeHandleResult(obj_nodes=copied_messages), MessageSender, NodeHandleResult(obj_nodes=sendResponse)]
    with G.eventRegisteredFuncs_lock:
        func_objs = G.eventRegisteredFuncs['bg_chrome_runtime_onMessage']
    # switch cur scope
    if G.thread_version:
        G.mydata.cur_scope = G.bg_scope
        G.mydata.cur_file_scope = G.bg_scope
    else:
        G.cur_scope = G.bg_scope
        G.cur_file_scope = G.bg_scope
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(),extra=None,
                  caller_ast=None, is_new=False, stmt_id='Unknown',
                  mark_fake_args=False)


def bg_chrome_tabs_sendMessage(G, event):
    # register sender_responseCallback function to cs runtime.sendMessage's responseCallback
    sender_responseCallback = G.get_prop_obj_nodes(event['info'], prop_name='responseCallback')[0]
    if sender_responseCallback!=G.undefined_obj:
        new_event = 'bg_chrome_tabs_sendMessage_onResponse'  # bg on getting the response from cs
        if G.thread_version:
            from src.plugins.internal.modeled_extension_builtins import register_event_check
            register_event_check(G, new_event, sender_responseCallback)
        else:
            if new_event in G.eventRegisteredFuncs:
                if sender_responseCallback not in G.eventRegisteredFuncs[new_event]:
                    G.eventRegisteredFuncs[new_event].append(sender_responseCallback)
            else:
                G.eventRegisteredFuncs[new_event] = [sender_responseCallback]
    message = G.get_prop_obj_nodes(event['info'], prop_name='message')[0]
    message = G.copy_obj(message, ast_node=None, deep=True)
    func_objs = G.get_objs_by_name('MessageSender', scope=G.get_cur_window_scope(), branches=[])
    MessageSender, created_objs = call_function(G, func_objs, args=[], this=NodeHandleResult(),
                                                extra=None,
                                                caller_ast=None, is_new=True, stmt_id='Unknown',
                                                func_name='MessageSender',
                                                mark_fake_args=False)
    MessageSender.obj_nodes = created_objs
    # print('MessageSender obj', created_objs[0], G.get_node_attr(created_objs[0]))
    sendResponse = G.get_objs_by_name('sendResponse', scope=G.get_cur_window_scope(), branches=[])
    # print('sendResponse obj', sendResponse[0], G.get_obj_def_ast_node(sendResponse[0]),
    #       G.get_node_attr(sendResponse[0]))
    args = [NodeHandleResult(obj_nodes=[message]), MessageSender, NodeHandleResult(obj_nodes=sendResponse)]
    with G.eventRegisteredFuncs_lock:
        func_objs = G.eventRegisteredFuncs['cs_chrome_runtime_onMessage']
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(),
                                                  extra=None,
                                                  caller_ast=None, is_new=False, stmt_id='Unknown',
                                                  mark_fake_args=False)


def bg_chrome_runtime_onMessage_response(G, event):
    message = G.get_prop_obj_nodes(event['info'], prop_name='message')[0]
    message = G.copy_obj(message, ast_node=None, deep=True)
    args = [NodeHandleResult(obj_nodes=[message])]
    # get and unregister this function
    tmp_event = 'cs_chrome_runtime_sendMessage_onResponse'
    with G.eventRegisteredFuncs_lock:
        if tmp_event in G.eventRegisteredFuncs:
            func_objs = G.eventRegisteredFuncs[tmp_event]
            del G.eventRegisteredFuncs[tmp_event]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(),
                                                  extra=None,
                                                  caller_ast=None, is_new=False, stmt_id='Unknown',
                                                  mark_fake_args=False)

def cs_chrome_tabs_onMessage_response(G, event):
    message = G.get_prop_obj_nodes(event['info'], prop_name='message')[0]
    message = G.copy_obj(message, ast_node=None, deep=True)
    args = [NodeHandleResult(obj_nodes=[message])]
    # get and unregister this function
    tmp_event = 'bg_chrome_tabs_sendMessage_onResponse'
    with G.eventRegisteredFuncs_lock:
        if tmp_event in G.eventRegisteredFuncs:
            func_objs = G.eventRegisteredFuncs[tmp_event]
            del G.eventRegisteredFuncs[tmp_event]
    returned_result, created_objs = call_function(G, func_objs, args=args, this=NodeHandleResult(),
                                                  extra=None,
                                                  caller_ast=None, is_new=False, stmt_id='Unknown',
                                                  mark_fake_args=False)

event_listener_dic = {
    "cs_chrome_runtime_connect": ["bg_chrome_runtime_onConnect", cs_chrome_runtime_connect],
    "cs_port_postMessage":["bg_port_onMessage", cs_port_postMessage],
    "bg_port_postMessage":["cs_port_onMessage", bg_port_postMessage],
    "cs_chrome_runtime_sendMessage":["bg_chrome_runtime_onMessage", cs_chrome_runtime_sendMessage],
    "bg_chrome_tabs_sendMessage":["cs_chrome_runtime_onMessage", bg_chrome_tabs_sendMessage],
    "bg_chrome_runtime_onMessage_response":["cs_chrome_runtime_sendMessage_onResponse", bg_chrome_runtime_onMessage_response],
    "cs_chrome_runtime_onMessage_response":["bg_chrome_tabs_sendMessage_onResponse", cs_chrome_tabs_onMessage_response]
}

# attack name: attack function
attack_dic = {
    'bg_chrome_runtime_MessageExternal': bg_chrome_runtime_MessageExternal_attack,
    'cs_window_eventListener': window_eventListener_attack,
    "bg_chrome_runtime_onConnectExternal": bg_chrome_runtime_onConnectExternal_attack,
    "bg_external_port_onMessage": bg_external_port_onMessage_attack,
    "bg_externalNativePort_onMessage": bg_externalNativePort_onMessage_attack,
    "bg_tabs_onupdated": bg_tabs_onupdated_attack
}