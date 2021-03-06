from src.plugins.handler import Handler 
from src.core.utils import ExtraInfo, BranchTag
from src.plugins.internal.utils import to_values, undefined, wildcard, merge, js_cmp
from .blocks import simurun_block
from src.core.graph import Graph
from src.core.logger import loggers
from src.core.timeout import timeout, TimeoutError
import threading

class HandleSwitch(Handler):

    def process(self):
        condition, switch_list = self.G.get_ordered_ast_child_nodes(self.node_id)
        result = self.internal_manager.dispatch_node(condition, self.extra)
        self.internal_manager.dispatch_node(switch_list, ExtraInfo(self.extra, switch_var=result))
        return result

class HandleSwitchList(Handler):
    def process(self):
        node_id = self.node_id
        G = self.G
        extra = self.extra

        stmt_id = "Switch" + node_id
        branches = extra.branches
        parent_branch = branches.get_last_choice_tag()
        cases = G.get_ordered_ast_child_nodes(node_id)
        default_is_deterministic = True
        tmp_cur_scope = G.cur_scope if not G.thread_version else G.mydata.cur_scope
        # next_case =  0 # whether to run the next case
        # for i, case in enumerate(cases):
        #     branch_tag = BranchTag(point=stmt_id, branch=str(i))
        #     test, body = G.get_ordered_ast_child_nodes(case)
        #     if next_case==0:
        #         p, d = check_switch_var(self, G, test, extra)
        #         next_case = p
        #
        #     break_signal = False
        #     if next_case in (0,1):
        #         _, _, break_signal = simurun_block(G, body, tmp_cur_scope, branches+[branch_tag], block_scope=False)
        #     elif next_case == 1:
        #         _, _, break_signal = simurun_block(G, body, tmp_cur_scope, branches, block_scope=False)
        #     if break_signal:
        #         break
        #
        #     if next_case==0 and G.get_node_attr(test).get('type') == 'NULL': # default
        #         # if default_is_deterministic or G.single_branch:
        #         simurun_block(G, body, tmp_cur_scope, branches)
        #         # else:
        #         #     # not deterministic
        #         #     simurun_block(G, body, tmp_cur_scope, branches+[branch_tag])

        next_case = 0  # whether to run the next case
        for i, case in enumerate(cases):
            branch_tag = BranchTag(point=stmt_id, branch=str(i))
            test, body = G.get_ordered_ast_child_nodes(case)
            break_signal = False
            # if last time does not match
            if next_case==0:
                p, d = check_switch_var(self, G, test, extra)
                if d and p == 1:
                    _, _, break_signal = simurun_block(G, body, tmp_cur_scope, branches, block_scope=False)
                    next_case = 1
                elif not d or 0 < p < 1:
                    _, _, break_signal = simurun_block(G, body, tmp_cur_scope, branches+[branch_tag], block_scope=False)
                    default_is_deterministic = False
                    next_case = p
            # if last time keeps it going on
            elif next_case==1:
                _, _, break_signal = simurun_block(G, body, tmp_cur_scope, branches, block_scope=False)
            elif 0 < next_case < 1:
                _, _, break_signal = simurun_block(G, body, tmp_cur_scope, branches + [branch_tag], block_scope=False)
            if next_case == 1 and break_signal:
                break
            # if default
            if next_case==0 and G.get_node_attr(test).get('type') == 'NULL': # default
                if default_is_deterministic or G.single_branch:
                    simurun_block(G, body, tmp_cur_scope, branches)
                else:
                    # not deterministic
                    simurun_block(G, body, tmp_cur_scope, branches+[branch_tag])


        if not G.single_branch:
            merge(G, stmt_id, len(cases), parent_branch)


def check_switch_var(ins, G: Graph, ast_node, extra: ExtraInfo):
    left_values = to_values(G, extra.switch_var, ast_node, for_prop=True)[0]
    right_values = to_values(G, ins.internal_manager.dispatch_node(ast_node, extra), ast_node, for_prop=True)[0]
    loggers.main_logger.debug(f'Switch variable values: {left_values}')
    loggers.main_logger.debug(f'Case values: {right_values}')

    true_num = 0
    total_num = len(left_values) * len(right_values)
    deter_flag = True
    for v1 in left_values:
        for v2 in right_values:
            if (v1 != undefined) != (v2 != undefined):
                true_num += 0.5
                deter_flag = False
            elif v1 != wildcard and v2 != wildcard:
                if js_cmp(v1, v2) == 0:
                    true_num += 1
            else:
                true_num += 0.5
                deter_flag = False
    return total_num if total_num == 0 else true_num / total_num, deter_flag

# def run_case(case):
