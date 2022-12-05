from src.core.graph import Graph
from src.plugins.handler import Handler
from src.plugins.internal.utils import emit_thread
from src.core.utils import NodeHandleResult
from src.core.utils import wildcard

class HandleExprList(Handler):
    """
    handle the expr list ast
    """
    def process(self):
        result = NodeHandleResult()
        if self.G.thread_stmt:
            for child in self.G.get_ordered_ast_child_nodes(self.node_id):
                # print("HandleExprList", child)
                emit_thread(self.G, self.internal_manager.dispatch_node, (child, self.extra, self.G.mydata.pickle_up()))
                # return a wildcard object if in thread_stmt
                wildcard_obj = self.G.add_obj_node(js_type='object' if self.G.check_proto_pollution
                                       else None, value=wildcard)
                result = NodeHandleResult(obj_nodes=[wildcard_obj])
        else:
            for child in self.G.get_ordered_ast_child_nodes(self.node_id):
                result = self.internal_manager.dispatch_node(child, self.extra)
        return result

