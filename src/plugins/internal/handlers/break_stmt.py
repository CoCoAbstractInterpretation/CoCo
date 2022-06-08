from src.plugins.handler import Handler
from src.plugins.internal.handlers.blocks import simurun_block
from src.core.utils import ExtraInfo, NodeHandleResult

class HandleBreak(Handler):
    def process(self):
        result = NodeHandleResult()
        return result