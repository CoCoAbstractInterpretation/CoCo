from src.core.graph import Graph
from src.plugins.handler import Handler
from src.core.utils import BranchTag, NodeHandleResult, BranchTagContainer
from src.core.logger import * 
from . import blocks
from ..utils import get_random_hex, check_condition, decl_vars_and_funcs
from ..utils import has_else, merge, get_df_callback
from .blocks import simurun_block
from src.core.timeout import timeout, TimeoutError
from threading import Thread, Condition
import threading
import time
from src.plugins.internal.utils import emit_thread

class HandleIf(Handler):
    """
    handle the if ast
    """
    def process(self):

        G = self.G
        node_id = self.node_id
        extra = self.extra
        # lineno = G.get_node_attr(node_id).get('lineno:int')
        stmt_id = "If" + node_id + "-" + get_random_hex()
        if_elems = G.get_ordered_ast_child_nodes(node_id)
        branches = extra.branches
        parent_branch = branches.get_last_choice_tag()
        branch_num_counter = 0
        # if it is sure (deterministic) that "else" needs to run 
        else_is_deterministic = True
        #  three returns in this function, not a good solution
        def run_if_elem(if_elem, else_is_deterministic, branch_num_counter):
            # for each if statement, we should make sure cfg starts from the
            # if condition stmt
            G.cfg_stmt = node_id
            tmp_cur_scope = G.cur_scope
            condition, body = G.get_ordered_ast_child_nodes(if_elem)
            if not G.all_branch:
                if G.get_node_attr(condition).get('type') == 'NULL':  # else
                    if else_is_deterministic or G.single_branch:
                        blocks.simurun_block(G, body, tmp_cur_scope, branches)
                    else:
                        # not deterministic, create branch
                        branch_tag = BranchTag(
                            point=stmt_id, branch=str(branch_num_counter))
                        branch_num_counter += 1
                        # print('test tmp_cur_scope: ', body, tmp_cur_scope, branches + [branch_tag])
                        blocks.simurun_block(G, body, tmp_cur_scope, branches + [branch_tag])
                    return False, else_is_deterministic, branch_num_counter
                    # break
                # check condition
                possibility, deterministic = check_condition(G, condition, extra)
                # loggers.main_logger.debug('Check condition {} result: {} {}'.format(sty.ef.i +
                #                                                                     G.get_node_attr(condition).get(
                #                                                                         'code') + sty.rs.all,
                #                                                                     possibility, deterministic))
                if deterministic and possibility == 1:
                    # if the condition is surely true
                    blocks.simurun_block(G, body, tmp_cur_scope, branches)
                    return False, else_is_deterministic, branch_num_counter
                    # break

                elif G.single_branch and possibility != 0:
                    simurun_block(G, body, tmp_cur_scope)
                elif not deterministic or possibility is None or 0 < possibility < 1:
                    # if the condition is unsure
                    else_is_deterministic = False
                    branch_tag = \
                        BranchTag(point=stmt_id, branch=str(branch_num_counter))
                    branch_num_counter += 1
                    # print('test tmp_cur_scope: ', body, tmp_cur_scope, branches + [branch_tag])
                    blocks.simurun_block(G, body, tmp_cur_scope, branches + [branch_tag])
            else:
                possibility, deterministic = check_condition(G, condition, extra)
                if G.get_node_attr(condition).get('type') == 'NULL':  # else
                    # not deterministic, create branch
                    branch_tag = BranchTag(
                        point=stmt_id, branch=str(branch_num_counter))
                    # print('test tmp_cur_scope: ', body, tmp_cur_scope, branches + [branch_tag])
                    blocks.simurun_block(G, body, tmp_cur_scope, branches + [branch_tag])
                    # break
                else:
                    branch_tag = \
                        BranchTag(point=stmt_id, branch=str(branch_num_counter))
                    # print('test tmp_cur_scope: ', body, tmp_cur_scope, branches + [branch_tag])
                    blocks.simurun_block(G, body, tmp_cur_scope, branches + [branch_tag])
            return True, else_is_deterministic, branch_num_counter

        def run_if_elem_pq(if_elem, branch_num_counter, mydata):
            # for each if statement, we should make sure cfg starts from the
            # if condition stmt
            G.mydata.unpickle_up(mydata)
            # G.mydata = copy.copy(mydata)
            # print('run_if_elem_pq mydata: ',  G.mydata.cur_scope)
            G.cfg_stmt = node_id
            tmp_cur_scope = G.mydata.cur_scope
            condition, body = G.get_ordered_ast_child_nodes(if_elem)
            if G.get_node_attr(condition).get('type') == 'NULL':  # else
                # not deterministic, create branch
                branch_tag = BranchTag(
                    point=stmt_id, branch=str(branch_num_counter))
                # print('test tmp_cur_scope: ', body, tmp_cur_scope, branches + [branch_tag])
                blocks.simurun_block(G, body, tmp_cur_scope, branches + [branch_tag])
                # break
            else:
                possibility, deterministic = check_condition(G, condition, extra)
                branch_tag = \
                    BranchTag(point=stmt_id, branch=str(branch_num_counter))
                # print('test tmp_cur_scope: ', body, tmp_cur_scope, branches + [branch_tag])
                blocks.simurun_block(G, body, tmp_cur_scope, branches + [branch_tag])

        if not G.thread_version:
            for idx, if_elem in enumerate(if_elems):
                result, else_is_deterministic, branch_num_counter = run_if_elem(if_elem, else_is_deterministic, branch_num_counter)
                if not result:
                    break
            # When there is no "else", we still need to add a hidden else
            if not has_else(G, node_id):
                branch_num_counter += 1
            # We always flatten edges
            if not G.single_branch:
                # print('debug merge no pq', stmt_id, parent_branch)
                merge(G, stmt_id, branch_num_counter, parent_branch)
        else:
            # mydata = threading.local()
            # mydata.sons = set()
            current_thread = threading.current_thread()
            with G.thread_info_lock:
                cur_info = self.G.thread_infos[current_thread.name]
                cur_info.pause()
            son_age = cur_info.thread_age
            cv = Condition()
            for idx, if_elem in enumerate(if_elems):
                args=(if_elem, idx, G.mydata.pickle_up())
                depth = G.get_node_attr(if_elem)['branch']
                # print("depth: ", depth)
                # print("son_age: ", son_age+G.beta*depth)
                t = emit_thread(G, run_if_elem_pq, args, thread_age=son_age+G.beta*depth)
                with G.branch_son_dad_lock:
                    G.branch_son_dad[t.name] = [current_thread, cv]
            with cv:
                with G.wait_queue_lock:
                    G.wait_queue.add(cur_info)
                with G.running_queue_lock:
                    if cur_info in G.running_queue:
                        G.running_queue.remove(cur_info)
                with G.ready_queue_lock:
                    if cur_info in G.ready_queue:
                        G.ready_queue.remove(cur_info)
                # print(threading.current_thread().name + ': father waiting')
                cv.wait()
                # print(threading.current_thread().name + ': father finish waiting')
                with G.wait_queue_lock:
                    G.wait_queue.remove(cur_info)
                with G.running_queue_lock:
                    cur_info.resume()
                    G.running_queue.add(cur_info)
                # tmp = [i.thread_self for i in G.running_queue]
                # print('%%%%%%%%%work in condition: ', tmp)
                if G.policy==3:
                    print("policy 3 notified", cur_info.thread_self.name)
                    with G.thread_info_lock:
                        self.G.thread_infos[current_thread.name].copy_thread = True
                # time.sleep(1)
            # print('debug merge',threading.current_thread().name, stmt_id, parent_branch)
            branch_num_counter = len(if_elems)
            if not has_else(G, node_id):
                branch_num_counter += 1
            merge(G, stmt_id, branch_num_counter, parent_branch)

        return NodeHandleResult()

def sons_all_alive(sons):
    alive = True
    for son in sons:
        if not son.is_alive():
            alive = False
            break
    return alive

class HandleConditional(Handler):
    def process(self):
        node_id = self.node_id
        G = self.G
        extra = self.extra

        test, consequent, alternate = G.get_ordered_ast_child_nodes(node_id)
        loggers.main_logger.debug(f'Ternary operator: {test} ? {consequent} : {alternate}')
        possibility, deterministic = check_condition(G, test, extra)
        ### Jianjia not go both ways all the time
        if deterministic and possibility == 1 and not G.dx:
            return self.internal_manager.dispatch_node(consequent, extra)
        elif deterministic and possibility == 0 and not G.dx:
            return self.internal_manager.dispatch_node(alternate, extra)
        else:
            h1 = self.internal_manager.dispatch_node(consequent, extra)
            h2 = self.internal_manager.dispatch_node(alternate, extra)
            return NodeHandleResult(obj_nodes=h1.obj_nodes+h2.obj_nodes,
                name_nodes=h1.name_nodes+h2.name_nodes, ast_node=node_id,
                values=h1.values+h2.values,
                value_sources=h1.value_sources+h2.value_sources,
                callback=get_df_callback(G))

class HandleIfElem(Handler):
    def process(self):
        # maybe wrong, but lets see
        # TODO: check how to handle if elem
        decl_vars_and_funcs(self.G, self.node_id)

