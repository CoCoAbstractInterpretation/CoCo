import logging 
import re
import sty
import os
from src.core.options import options

ATTENTION = 15


class ColorFormatter(logging.Formatter):
    def format(self, record):
        res = super(ColorFormatter, self).format(record)
        if record.levelno >= logging.ERROR:
            res = sty.fg.red + sty.ef.bold + res + sty.rs.all
        elif record.levelno == logging.WARNING:
            res = sty.fg.yellow + res + sty.rs.all
        elif record.levelno == ATTENTION:
            res = sty.fg.green + sty.ef.bold + res + sty.rs.all
        return res

class NoColorFormatter(logging.Formatter):
    def format(self, record):
        res = super(NoColorFormatter, self).format(record)
        res = re.sub(r'\x1b\[[0-9;]*[a-zA-Z]', '', res)
        return res

def create_logger(name, output_type="file", level=logging.DEBUG, file_name='run_log.log'):
    """
    we can choose this is a file logger or a console logger
    for now, we hard set the log file name to be run_log.log

    Args:
        name: the name of the logger
        log_type: choose from file or console

    Return:
        the created logger
    """
    logger = logging.getLogger(name)

    for handler in list(logger.handlers):
        logger.removeHandler(handler)

    file_handler = logging.FileHandler(filename=file_name)
    file_handler.setFormatter(NoColorFormatter())
    stream_handler = logging.StreamHandler()
    if os.name == 'nt': # Windows
        stream_handler.setFormatter(NoColorFormatter())
    else:
        stream_handler.setFormatter(ColorFormatter())

    logger.setLevel(level)

    if output_type == "file":
        logger.addHandler(file_handler)
    elif output_type == "console":
        logger.addHandler(stream_handler)

    return logger

class Loggers:
    class __Loggers:
        def __init__(self):
            if options.print:
                self.main_logger = create_logger("main", output_type='console')
            else:
                self.main_logger = create_logger("main", file_name='main.log')

            self.print_logger = create_logger("print", output_type='console')
            self.debug_logger = create_logger("debug", file_name="debug.log")
            self.progress_logger = create_logger("progress", file_name="progress.log")
            self.error_logger = create_logger("error", file_name="error.log")
            self.res_logger = create_logger("result", file_name="results.log")
            self.detail_logger = create_logger("details", file_name="details.log")
            self.tmp_res_logger = create_logger("result_tmp", file_name="results_tmp.log")
            # self.crx_logger = create_logger("crx_res", file_name="crx.log")
            self.crx_record_logger = create_logger("crx_record", file_name="crx_record.log")
            self.thread_logger = create_logger("thread_logger", file_name="thread_logger.log")
    instance = None
    def __init__(self):
        if not Loggers.instance:
            Loggers.instance = Loggers.__Loggers()
    def __getattr__(self, name):
        return getattr(self.instance, name)
    def __setattr__(self, name):
        return setattr(self.instance, name)

loggers = Loggers()
