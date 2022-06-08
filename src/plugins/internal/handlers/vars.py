from src.core.graph import Graph 
from src.core.utils import ExtraInfo, NodeHandleResult, BranchTagContainer
from src.plugins.handler import Handler
from src.core.helpers import to_values
from src.core.logger import loggers, ATTENTION
import os

class HandleVar(Handler):
    """
    the var type handler including 
    AST_VAR, AST_CONST, AST_NAME
    """
    def process(self):
        side = self.extra.side if self.extra else None
        return handle_var(self.G, 
                self.node_id, side, self.extra)

def handle_var(G: Graph, ast_node, side=None, extra=None):
    cur_node_attr = G.get_node_attr(ast_node)
    var_name = G.get_name_from_child(ast_node)
    tmp_cur_objs = G.cur_objs if not G.thread_version else G.mydata.cur_objs
    if var_name == 'this' and tmp_cur_objs:
        now_objs = tmp_cur_objs
        name_node = None
    elif var_name == '__filename':
        return NodeHandleResult(name=var_name, values=[
            G.get_cur_file_path()], ast_node=ast_node)
    elif var_name == '__dirname':
        return NodeHandleResult(name=var_name, values=[os.path.join(
            G.get_cur_file_path(), '..')], ast_node=ast_node)
    else:
        now_objs = []
        branches = extra.branches if extra else BranchTagContainer()

        name_node = G.get_name_node(var_name)
        # print('++++++debug', name_node, var_name)
        # if var_name == "true" or var_name == "false":
        #     pass
        #     TODO: add true and false obj
        if name_node is not None:
            now_objs = list(
                set(G.get_objs_by_name_node(name_node, branches=branches)))
        elif side != 'right':
            loggers.main_logger.log(ATTENTION, f'Name node {var_name} not found, create name node')
            if cur_node_attr.get('flags:string[]') == 'JS_DECL_VAR':
                # we use the function scope
                name_node = G.add_name_node(var_name,
                                scope=G.find_ancestor_scope())
            elif cur_node_attr.get('flags:string[]') in [
                'JS_DECL_LET', 'JS_DECL_CONST']:
                # we use the block scope
                name_node = G.add_name_node(var_name, scope=G.mydata.cur_scope if G.thread_version else G.cur_scope)
            else:
                # only if the variable is not defined and doesn't have
                # 'var', 'let' or 'const', we define it in the global scope
                # TODO: define in file scope, done
                name_node = G.add_name_node(var_name, scope=G.mydata.cur_file_scope if G.thread_version else G.cur_file_scope)
        # else:
        #     now_objs = [G.undefined_obj]

    name_nodes = [name_node] if name_node is not None else []

    assert None not in now_objs

    # add from_branches information
    # from_branches = []
    # cur_branches = extra.branches if extra else BranchTagContainer()
    # for obj in now_objs:
    #     from_branches.append(cur_branches.get_matched_tags(
    #         G.get_node_attr(obj).get('for_tags') or []))

    # tricky fix, we don't really link name nodes to the undefined object
    if not now_objs:
        now_objs = [G.undefined_obj]

    # if ast_node is not None:
    #     for obj in now_objs:
    #         #  if the obj is not linked to ast node
    #         if not G.get_obj_def_ast_node(obj):
    #             G.add_edge( obj , ast_node, {"type:TYPE": "OBJ_TO_AST"})

    loggers.main_logger.info("Var {} handle result -> {} ast:{}".format(var_name, now_objs, ast_node))
    # for now_obj in now_objs:
        # loggers.main_logger.info(f"\t{now_obj}: {G.get_node_attr(now_obj)}")

    return NodeHandleResult(obj_nodes=now_objs, name=var_name,
        name_nodes=name_nodes, # from_branches=[from_branches],
        ast_node=ast_node)

