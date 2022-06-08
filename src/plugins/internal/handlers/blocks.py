# This module is used to handle all the block level nodes
from src.core.utils import ExtraInfo, BranchTagContainer
from ..utils import decl_vars_and_funcs, to_obj_nodes
from src.plugins.internal.utils import emit_thread
import threading
import time

def simurun_block(G, ast_node, parent_scope=None, branches=None,
    block_scope=True, decl_var=False):
    """
    Simurun a block by running its statements one by one.
    A block is a BlockStatement in JavaScript,
    or an AST_STMT_LIST in PHP.
    """
    from src.plugins.manager_instance import internal_manager
    if branches is None:
        branches = BranchTagContainer()
    returned_objs = set()
    used_objs = set()
    if parent_scope == None:
        parent_scope = G.cur_scope if not G.thread_version else G.mydata.cur_scope
    if block_scope:
        if G.thread_version:
            G.mydata.cur_scope = \
                G.add_scope('BLOCK_SCOPE', decl_ast=ast_node,
                            scope_name=G.scope_counter.gets(f'Block{ast_node}'))
        else:
            G.cur_scope = \
                G.add_scope('BLOCK_SCOPE', decl_ast=ast_node,
                            scope_name=G.scope_counter.gets(f'Block{ast_node}'))
    # loggers.main_logger.log(ATTENTION, 'BLOCK {} STARTS, SCOPE {}'.format(ast_node, G.cur_scope))
    decl_vars_and_funcs(G, ast_node, var=decl_var)
    stmts = G.get_ordered_ast_child_nodes(ast_node)
    upper_toplevel = G.check_upper_toplevel(ast_node)
    # simulate statements
    break_signal = False


    if not G.thread_stmt:
        current_thread = threading.current_thread()
        for (i,stmt) in enumerate(stmts):
            if check_return(G, branches):
                break
            node_attr = G.get_node_attr(stmt)
            # print(node_id)
            node_type = node_attr['type']
            if node_type=="AST_BREAK":
                break_signal = True
                break
            elif node_type=="AST_RETURN":
                handled_res = internal_manager.dispatch_node(stmt, ExtraInfo(branches=branches))
                break
            if G.cfg_stmt is not None:
                G.add_edge_if_not_exist(G.cfg_stmt, stmt, {"type:TYPE": "FLOWS_TO"})
            if G.thread_version:
                G.mydata.cur_stmt = stmt
            else:
                G.cur_stmt = stmt
            G.cfg_stmt = stmt
            if G.policy==3:
                with G.thread_info_lock:
                    parent_info=G.thread_infos[current_thread.name]
                parent_copy = parent_info.copy_thread
                if parent_copy:
                    last_len = get_len_son(G, current_thread)
                    print(last_len)
                    while True:
                        len_son = get_len_son(G, current_thread)
                        if len_son<=0:
                            break
                        print(len_son)
                        if len_son<last_len:
                            last_len = len_son
                            func = internal_manager.dispatch_node
                            args = (stmt, ExtraInfo(branches=branches))
                            t = emit_thread(G, func, args, thread_age=parent_info.thread_age)
                    handled_res = internal_manager.dispatch_node(stmt, ExtraInfo(branches=branches))
                else:
                    handled_res = internal_manager.dispatch_node(stmt, ExtraInfo(branches=branches))
            else:
                handled_res = internal_manager.dispatch_node(stmt, ExtraInfo(branches=branches))
    else:
        current_thread = threading.current_thread()
        with G.thread_info_lock:
            cur_info = G.thread_infos[current_thread.name]
        thread_age = cur_info.thread_age
        for (i, stmt) in enumerate(stmts):
            stmt_age = thread_age + i
            start_time = time.time()
            stmt_thread = emit_thread(G, internal_manager.dispatch_node, (stmt, ExtraInfo(branches=branches), G.mydata.pickle_up()), thread_age=stmt_age)
            while True:
                # time.sleep(0.05)
                if stmt_thread.is_alive() and time.time()-start_time>G.seq_timeout:
                    break
                else:
                    break
            # print("seq_timeout: ", G.seq_timeout)



    returned_objs = G.function_returns[G.find_ancestor_scope()][1]
    
    if block_scope:
        if G.thread_version:
            G.mydata.cur_scope = parent_scope
        else:
            G.cur_scope = parent_scope


    return list(returned_objs), list(used_objs), break_signal

def get_len_son(G, current_thread):
    sons = []
    for son in G.branch_son_dad:
        if G.branch_son_dad[son][0] == current_thread:
            sons.append(son)
    return len(sons)

def check_return(G, branches):
    ancestor_scope = G.find_ancestor_scope()
    if G.function_returns[ancestor_scope]:
        returned_branch = G.function_returns[ancestor_scope][2]
        if branches in returned_branch:
            returned_objs = G.function_returns[ancestor_scope][1]
            return True