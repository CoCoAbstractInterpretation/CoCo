from src.plugins.handler import Handler
from src.plugins.internal.handlers.blocks import simurun_block
from src.core.utils import ExtraInfo, NodeHandleResult


class HandleStmtList(Handler):
    def process(self):
        simurun_block(self.G, self.node_id, parent_scope=None, branches=None,
                      block_scope=True, decl_var=False)
        result = NodeHandleResult()
        return result
