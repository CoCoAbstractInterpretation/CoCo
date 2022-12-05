from src.core.graph import Graph
from src.core.utils import NodeHandleResult, ExtraInfo, BranchTagContainer
from src.core.logger import *
# file level handling is higher than function level
# we can safely import function level functions
from .functions import simurun_function
from ..utils import decl_function, decl_vars_and_funcs
from src.plugins.handler import Handler
from src.plugins.internal.handlers.class_ import handle_class
from src.plugins.internal.setup_env import setup_opg_window
from threading import Thread
import threading
from src.core.thread_design import thread_info
import time
from src.plugins.internal.utils import emit_thread

class HandleFile(Handler):

    def process(self):
        """
        handle the file node type
        Args:
            G (Graph): the graph
            node_id (str): the node id
        Returns:
            NodeHandleResult: the handle result
        """
        # Directory
        node_attr = self.G.get_node_attr(self.node_id)
        node_type = node_attr['type']
        # if thread version, dispatch the files in different threads

        if self.G.thread_version and node_type=="Directory":
            for child in self.G.get_child_nodes(self.node_id):
                # self.internal_manager.dispatch_node(child, self.extra)
                emit_thread(self.G, self.internal_manager.dispatch_node, (child, self.extra, self.G.mydata.pickle_up()))
        else:
            for child in self.G.get_child_nodes(self.node_id):
                self.internal_manager.dispatch_node(child, self.extra)

class HandleToplevel(Handler):
    
    def process(self):
        """
        handle the toplevel node type
        Args:
            G (Graph): the graph
            node_id (str): the node id
        Returns:
            NodeHandleResult: the handle result
        """

        flags = self.G.get_node_attr(self.node_id).get('flags:string[]')
        if flags == 'TOPLEVEL_FILE':
            module_exports_objs = run_toplevel_file(self.G, self.node_id)
            return NodeHandleResult(obj_nodes=module_exports_objs)
        elif flags == 'TOPLEVEL_CLASS':
            handle_class(self.G, self.node_id, self.extra)

def run_toplevel_file(G: Graph, node_id):
    """
    run a top level file 
    return a obj and scope
    """
    # switch current file path

    file_path = None
    if 'name' in G.get_node_attr(node_id):
        file_path = G.get_node_attr(node_id)['name']
    else:
        loggers.main_logger.error("[ERROR] " + node_id + "no file name")
    if not G.thread_version:
        # loop call
        if file_path in G.file_stack:
            return []
        G.file_stack.append(file_path)
        print('G.file_stack', G.file_stack)
    else:
        print('G.file_stack'+file_path+'\n')
    if G.thread_version:
        previous_file_path = G.mydata.cur_file_path
        G.mydata.cur_file_path = file_path
    else:
        previous_file_path = G.cur_file_path
        G.cur_file_path = file_path
    if G.entry_file_path is None:
        G.entry_file_path = file_path
    loggers.main_logger.info(sty.fg(173) + sty.ef.inverse + 'FILE {} BEGINS'.format(file_path) + sty.rs.all)

    # add function object and scope
    func_decl_obj = decl_function(G, node_id, func_name=file_path,
        obj_parent_scope=G.BASE_SCOPE, scope_parent_scope=G.BASE_SCOPE)
    func_scope = G.add_scope(scope_type='FILE_SCOPE', decl_ast=node_id,
        scope_name=G.scope_counter.gets(f'File{node_id}'),
        decl_obj=func_decl_obj, func_name=file_path, parent_scope=G.BASE_SCOPE)
    if G.thread_version:
        backup_scope = G.mydata.cur_scope
        G.mydata.cur_scope = func_scope
        # update cur_file_scope
        G.mydata.cur_file_scope = func_scope
        backup_stmt = G.mydata.cur_stmt
    else:
        backup_scope = G.cur_scope
        G.cur_scope = func_scope
        # update cur_file_scope
        G.cur_file_scope = func_scope
        backup_stmt = G.cur_stmt

    # if analyze chrome extension code
    if G.client_side:
        # cs_0.js, bg.js
        # setup the window object before we start run the file
        if 'bg.js' in file_path or ('wars.js' in file_path and G.war):
            G.bg_scope = func_scope
            window_obj = G.add_obj_to_scope(name='window', scope=func_scope, combined=False)
            # add canHaveOnProperty for object.onload property
            G.set_node_attr(window_obj, ('canHaveOnProperty', "True"))
            G.bg_window = window_obj
            setup_opg_window(G, func_scope, window_obj)
        else:
            pattern = re.compile('cs_\d*.js')
            name = pattern.findall(file_path)[0]
            if name!=None:
                G.cs_scopes.append(func_scope)
                # except:
                #     pass
                window_obj = G.add_obj_to_scope(name='window', scope=func_scope, combined=False)
                # add canHaveOnProperty for object.onload property
                G.set_node_attr(window_obj, ('canHaveOnProperty', "True"))
                G.cs_window[func_scope] = window_obj
                setup_opg_window(G, func_scope, window_obj)

    '''
    # add module object to the current file's scope
    added_module_obj = G.add_obj_to_scope("module", node_id)
    # add module.exports
    added_module_exports = G.add_obj_as_prop("exports", node_id,
        parent_obj=added_module_obj)
    # add module.exports as exports
    G.add_obj_to_scope(name="exports", tobe_added_obj=added_module_exports)
    # "this" is set to module.exports by default
    # backup_objs = G.cur_objs
    # G.cur_objs = added_module_exports
    # TODO: this is risky
    G.add_obj_to_scope(name="this", tobe_added_obj=added_module_exports)
    '''

    # simurun the file
    simurun_function(G, node_id, block_scope=True)

    '''
    # get current module.exports
    # because module.exports may be assigned to another object
    # TODO: test if module is assignable
    module_obj = G.get_objs_by_name('module')[0]
    module_exports_objs = G.get_prop_obj_nodes(parent_obj=module_obj,
        prop_name='exports')
    '''

    #final_exported_objs = []
    """
    for obj in module_exports_objs:
        for o in G.get_prop_obj_nodes(obj):
            print('exported', G.get_node_attr(o))
    """

    if G.thread_version:
        # switch back scope, object, path and statement AST node id
        G.mydata.cur_scope = backup_scope
        # G.cur_objs = backup_objs
        G.mydata.cur_file_path = previous_file_path
        G.mydata.cur_stmt = backup_stmt
    else:
        # switch back scope, object, path and statement AST node id
        G.cur_scope = backup_scope
        # G.cur_objs = backup_objs
        G.cur_file_path = previous_file_path
        G.cur_stmt = backup_stmt

    if not G.thread_version:
        G.file_stack.pop(-1)

    module_exports_objs = []

    return module_exports_objs
