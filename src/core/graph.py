import networkx as nx
import sys
import csv
import sty
import io
import json
from typing import List, Callable
from .utils import BranchTag, BranchTagContainer, DictCounter, wildcard
from .logger import *
import uuid
from itertools import chain
from collections import defaultdict
from queue import PriorityQueue
from threading import Thread, Event, Lock, Condition
import threading
import copy
import time
class MyData(threading.local):
    def __init__(self):
        self.cur_objs = []
        self.cur_scope = None
        self.cur_file_scope = None
        self.cur_func = None
        self.cur_stmt = None  # for building data flows
        self.cur_file_path = None  # deprecated, use G.get_cur_file_path()
    def pickle_up(self):
        dic = {
            "cur_objs":self.cur_objs,
            "cur_scope": self.cur_scope,
            "cur_file_scope": self.cur_file_scope,
            "cur_func": self.cur_func,
            "cur_stmt": self.cur_stmt,
            "cur_file_path": self.cur_file_path
            }
        return dic
    def unpickle_up(self, dic):
        self.cur_objs = dic['cur_objs']
        self.cur_scope = dic['cur_scope']
        self.cur_file_scope = dic['cur_file_scope']
        self.cur_func = dic['cur_func']
        self.cur_stmt = dic['cur_stmt']  # for building data flows
        self.cur_file_path = dic['cur_file_path']  # deprecated, use G.get_cur_file_path()

class Graph:

    def __init__(self, cs_header_lines, bg_header_lines, thread_version):
        self.cs_header_lines = cs_header_lines
        self.bg_header_lines = bg_header_lines
        self.thread_version = thread_version
        self.client_side = False
        self.auto_stop = False
        self.graph = nx.MultiDiGraph()
        self.graph_lock = Lock()
        self.no_merge = False
        self.thread_stmt = False
        self.time_slice = 0.1
        if self.thread_version:
            self.mydata = MyData()
        else:
            self.cur_objs = []
            self.cur_scope = None
            self.cur_file_scope = None
            self.cur_func = None
            self.cur_stmt = None  # for building data flows
            self.cur_file_path = None  # deprecated, use G.get_cur_file_path()
        self.cur_id = 0
        self.cur_id_lock = Lock()
        self.entry_file_path = None
        self.file_contents = {}
        self.logger = create_logger("graph_logger", output_type="file")
        self.registered_funcs = {}
        self.op_cnt = {'add_node': 0, 'add_edge': 0, 'get_node_attr': 0, 'get_edge': 0, 'get_edge_attr': 0}
        self.nearest_upper_CPG_cache = {}
        ###################

        self.eventQueue = []  # a queue of events
        self.sensitiveSource = set() # a list of sensitive source objs
        self.attackEntries = [] # a list of attack entries (function declaration objs)
        self.sinks = set() # a list of sink objs

        # record the scope of cs and bg
        self.cs_scopes = []
        self.bg_scope = None

        # record the window obj of cs and bg
        self.cs_window = {}
        self.bg_window = None

        self.detection_res = {}
        self.detected = False
        self.num_removed = 0
        self.dont_quit = None
        self.last_stmts = []
        self.package_name = None
        self.no_file_based = False
        self.ipt_use = set()

        # for control flow
        self.cfg_stmt = None

        # for block opt
        self.register = {}
        self.num_function_call = {}
        self.opt_func = True

        # for evaluation
        self.covered_num_stat = 0
        self.covered_stat = {} #set()
        self.all_stat = set()
        self.header_stat = set()
        self.all_func = set()
        self.covered_func = set()

        # exit immediately when vulnerability is found
        self.finished = False
        self.exit_when_found = False

        # mark the type of the node, built-in or application
        self.export_node = True

        self.reverse_names = defaultdict(set)

        self.internal_objs_list = []
        # JS internal values
        self.function_prototype = None
        self.object_prototype = None
        self.array_prototype = None
        self.number_prototype = None
        self.string_prototype = None
        self.boolean_prototype = None
        self.regexp_prototype = None
        
        self.builtin_constructors = []
        self.builtin_prototypes = []

        # scope name counter
        self.scope_counter = DictCounter()

        # contains a list of node ids based on the ast id
        self.call_stack = [] # deprecated, only for debugging
        self.for_stack = [] # for debugging
        self.call_counter = DictCounter() # callers (instead of callees)
        self.call_limit = 3
        self.file_stack = []
        self.require_obj_stack = []

        self.function_returns = defaultdict(lambda: [[], [], []])

        # Python-modeled built-in modules
        self.builtin_modules = {}

        # prototype pollution
        self.check_proto_pollution = False
        self.proto_pollution = set()
        self.func_entry_point = None

        # internal property tampering
        self.check_ipt = False 

        self.run_all = True
        self.function_time_limit = None
        self.single_branch = False
        self.print = False

        self.vul_type = None

        csv.field_size_limit(2 ** 31 - 1)
        class joern_dialect(csv.excel_tab):
            doublequote = False
            escapechar = '\\'
        self.csv_dialect = joern_dialect
        # set a priority queue
        self.pq = []
        self.pq_lock = Lock()

        self.code_coverage_lock = Lock()
        self.last_code_cov_time = 0
        self.last_code_cov = 0
        self.speed_threshold = 1e-10
        self.stop_sign = False

        self.work_queue = set()
        self.work_queue_lock = Lock()
        self.wait_queue = set()
        self.wait_queue_lock = Lock()
        # self.pq_event = Event()
        # self.reverse_pq_event = Event()
        self.add_branch = Condition()
        self.add_branch_bool = False
        self.branch_son_dad = {}
        self.branch_son_dad_lock = Lock()
        self.timeup = False

        self.running_thread_id=0
        self.running_thread_age = 0
        self.running_time = 0
        self.running_thread = None

        # dictionary: {thread name: its thread_info object}
        self.thread_infos = {}
        self.thread_info_lock = Lock()

        self.event_record = {}
        self.event_record_lock = Lock()
        self.event_max_time = 5

        self.event_loop = {}
        # a list of events
        self.event_loop_lock = Lock()

        self.eventRegisteredFuncs = {}
        # a dic of events and their registered funcs
        # {event1: [function1_ID,...],,
        #  event2: [function2_ID,...],
        #  ...
        #  }
        self.eventRegisteredFuncs_lock = Lock()

        self.event_listener_dic = {
            "cs_chrome_runtime_connect": "bg_chrome_runtime_onConnect",
            "cs_port_postMessage": "bg_port_onMessage",
            "bg_port_postMessage": "cs_port_onMessage",
            "cs_chrome_runtime_sendMessage": "bg_chrome_runtime_onMessage",
            "bg_chrome_tabs_sendMessage": "cs_chrome_runtime_onMessage",
            "bg_chrome_runtime_onMessage_response": "cs_chrome_runtime_sendMessage_onResponse",
            "cs_chrome_runtime_onMessage_response": "bg_chrome_tabs_sendMessage_onResponse"
        }

        self.listener_event_dic = {value: key for (key, value) in self.event_listener_dic.items()}

        self.canHaveOnPropertyObject = ['Document', 'Document_element','XMLHttpRequest']
        self.onEvents = ["onload" ,"onmessage", "onreadystatechange", "onerror", "ready"]

        self.attacked = False
        self.attacked_lock = Lock()

    # Basic graph operations
    # node

    def _get_new_nodeid(self):
        """
        return a nodeid
        """
        with self.cur_id_lock:
            self.cur_id += 1
            tmp = self.cur_id - 1
        return str(tmp)
        # return str(uuid.uuid4().int)

    def add_node(self, node_for_adding, attr={}):
        self.op_cnt['add_node'] += 1
        attr['export'] = self.export_node
        self.graph.add_node(node_for_adding, **attr)
        return node_for_adding

    """
    def add_node_from_list(self, node_list):
        print(node_list)
        return self.graph.add_nodes_from(node_list)
    """

    def get_graph_size(self):
        """
        return the size of the graph
        """
        return self.graph.size()

    def set_node_attr(self, node_id, attr):
        """
        attr should be a tuple like (key, value)
        will be added to a node id
        """
        self.graph.nodes[node_id][attr[0]] = attr[1]

    def get_node_attr(self, node_id):
        """
        this function will return a dict with all the attrs and values
        """
        assert node_id is not None
        self.op_cnt['get_node_attr'] += 1
        return self.graph.nodes[node_id]

    def get_all_nodes(self):
        """
        return all nodes in the form of dict
        """
        return self.graph.nodes

    def get_nodes_by_type(self, node_type, data=True):
        """
        return a list of nodes with a specific node type
        as tuples of node id and attrs
        """
        return [node for node in self.graph.nodes(data=data) if node[1].get('type') == node_type]

    def get_nodes_by_type_and_flag(self, node_type, node_flag, data=True):
        """
        return a list of nodes with a specific node type and flag
        """
        return [node[0] for node in self.graph.nodes(data=data) if node[1].get('type') == node_type and node[1].get('flags:string[]') == node_flag]

    def get_node_by_attr(self, key, value):
        """
        get a list of node by key and value
        """
        # with self.graph_lock:
        tmp = list(self.graph.nodes(data = True))
        return [node[0] for node in tmp if key in node[1] and node[1][key] == value]

    def remove_nodes_from(self, remove_list):
        """
        remove a list of nodes from the graph
        """
        with self.graph_lock:
            self.graph.remove_nodes_from(remove_list)

    def relabel_nodes(self):
        """
        relabel all the nodes to a uuid to make the graph globaly useful
        """
        mapping = {}
        for node in self.graph.nodes():
            # make a random uuid
            mapping[node] = str(uuid.uuid4().int)

        self.graph = nx.relabel_nodes(self.graph, mapping)
    
    # edges

    def add_edge(self, from_ID, to_ID, attr):
        """
        insert an edge to graph
        attr is like {key: value, key: value}
        """
        assert from_ID is not None, "Failed to add an edge, from_ID is None."
        assert to_ID is not None, "Failed to add an edge, to_ID is None."
        assert from_ID != 'string' and to_ID != 'string'
        self.op_cnt['add_edge'] += 1
        self.graph.add_edge(from_ID, to_ID, None, **attr)
    
    def add_edge_if_not_exist(self, from_ID, to_ID, attr):
        """
        insert an edge to the graph if the graph does not already has the same edge
        """
        assert from_ID is not None, "Failed to add an edge, from_ID is None."
        assert to_ID is not None, "Failed to add an edge, to_ID is None."
        if not self.graph.has_edge(from_ID, to_ID):
            self.add_edge(from_ID, to_ID, attr)
        else:
            for key, edge_attr in self.graph[from_ID][to_ID].items():
                if edge_attr == attr:
                    # self.logger.warning("Edge {}->{} exists: {}, {}. Duplicate edge "
                    # "will not be created.".format(from_ID,to_ID,key,edge_attr))
                    return
            self.add_edge(from_ID, to_ID, attr)

    def set_edge_attr(self, from_ID, to_ID, edge_id, attr):
        with self.graph_lock:
            self.graph[from_ID][to_ID][attr[0]][edge_id] = attr[1]

    def get_edge_attr(self, from_ID, to_ID, edge_id = None):
        self.op_cnt['get_edge_attr'] += 1
        if edge_id == None:
            return self.graph.get_edge_data(from_ID, to_ID)
        return self.graph[from_ID][to_ID][edge_id]

    def add_edges_from_list(self, edge_list):
        return self.graph.add_edges_from(edge_list)

    def add_edges_from_list_if_not_exist(self, edge_list):
        for e in edge_list:
            if len(e) != 3:
                self.logger.error("Length of the edge tuple {} is not 3".format(e))
                continue
            self.add_edge_if_not_exist(*e)

    def get_edges_by_type(self, edge_type):
        """
        return the edges with a specific type
        """
        subEdges = [edge for edge in self.graph.edges(data = True, keys=True) if edge[3]['type:TYPE'] == edge_type]
        return subEdges

    def get_edges_between(self, u, v, edge_type = None) -> dict:
        result = {}
        for key, edge_attr in self.graph[u][v].items():
            if not edge_type or edge_attr.get('type:TYPE') == edge_type:
                result[key] = edge_attr
        return result

    def remove_all_edges_between(self, u, v):
        while True:
            try:
                with self.graph_lock:
                    self.graph.remove_edge(u, v)
            except nx.NetworkXError:
                break

    def get_out_edges(self, node_id, data = True, keys = True, edge_type = None):
        assert node_id is not None
        self.op_cnt['get_edge'] += 1
        if edge_type is None:
            return self.graph.out_edges(node_id, data = data, keys = keys)
        edges = self.graph.out_edges(node_id, data = data, keys = keys)
        idx = 1
        if keys == True:
            idx += 1
        if data == True:
            idx += 1
        with self.graph_lock:
            res = [edge for edge in edges if 'type:TYPE' in edge[idx] and edge[idx]['type:TYPE'] == edge_type]
        return res

    def get_in_edges(self, node_id, data = True, keys = True, edge_type = None):
        assert node_id is not None
        self.op_cnt['get_edge'] += 1
        if edge_type == None:
            return self.graph.in_edges(node_id, data = data, keys = keys)
        edges = self.graph.in_edges(node_id, data = data, keys = keys)
        with self.graph_lock:
            edges = [edge for edge in edges]
        # print('get_in_edges: ', len(edges))
        idx = 2
        if keys == True:
            idx = 3
        with self.graph_lock:
            res = [edge for edge in edges if 'type:TYPE' in edge[idx] and edge[idx]['type:TYPE'] == edge_type]
        return res

    def get_sub_graph_by_edge_type(self, edge_type):
        """
        only keep edges with specific type
        return a sub graph
        """
        subEdges = self.get_edges_by_type(edge_type)
        return nx.MultiDiGraph(subEdges)

    def get_ancestors_in(self, node_id, edge_types, node_types=None,
        candidates=None, step=1):
        results = []
        if step > 1:
            _candidates = None
        else:
            _candidates = candidates
        for edge_type in edge_types:
            for e in self.get_in_edges(node_id, edge_type=edge_type):
                node = e[0]
                if _candidates is not None and node not in _candidates:
                    continue
                if node_types is not None and \
                    self.get_node_attr(node).get('type') not in node_types:
                    continue
                if step == 1:
                    results.append(node)
                else:
                    results.extend(self.get_ancestors_in(node, edge_types,
                        node_types, candidates, step - 1))
        return results

    # traversal

    def dfs_edges(self, source, depth_limit = None):
        """
        Iterate over edges in a depth-first-search (DFS).
        """
        return nx.dfs_edges(self.graph, source, depth_limit)

    def has_path(self, source, target):
        '''
        Return True if there is a path from source to target, False
        otherwise.
        '''
        return nx.algorithms.shortest_paths.generic.has_path(
            self.graph, source, target)

    # import/export

    def import_from_string(self, string):
        try:
            nodes, rels = string.split('\n\n')[:2]
        except ValueError as e:
            self.logger.error('AST generation failed!')
            raise e

        with io.StringIO(nodes) as fp:
            reader = csv.DictReader(fp, dialect=self.csv_dialect)
            for row in reader:
                if 'id:ID' not in row:
                    continue
                cur_id = row['id:ID']
                self.add_node(cur_id)
                for attr, val in row.items():
                    if attr == 'id:ID': continue
                    self.set_node_attr(cur_id, (attr, val))

        with io.StringIO(rels) as fp:
            reader = csv.DictReader(fp, dialect=self.csv_dialect)
            edge_list = []
            for row in reader:
                attrs = dict(row)
                try:
                    del attrs['start:START_ID']
                except:
                    continue
                del attrs['end:END_ID']
                edge_list.append((row['start:START_ID'], row['end:END_ID'], attrs))
            self.add_edges_from_list(edge_list)
        self.logger.info(sty.ef.inverse + sty.fg.white + "Finished Importing" + sty.rs.all)

        # self.relabel_nodes()
        # reset cur_id
        with self.cur_id_lock:
            self.cur_id = self.graph.number_of_nodes()

    def import_from_CSV(self, nodes_file_name, rels_file_name, offset=0):
        with open(nodes_file_name) as fp:
            reader = csv.DictReader(fp, dialect=self.csv_dialect)
            for row in reader:
                cur_id = row['id:ID']
                self.add_node(cur_id)
                for attr, val in row.items():
                    if attr == 'id:ID': continue
                    self.set_node_attr(cur_id, (attr, val))

        with open(rels_file_name) as fp:
            reader = csv.DictReader(fp, dialect=self.csv_dialect)
            edge_list = []
            for row in reader:
                attrs = dict(row)
                del attrs['start:START_ID']
                del attrs['end:END_ID']
                edge_list.append((row['start:START_ID'], row['end:END_ID'], attrs))
            self.add_edges_from_list(edge_list)
        self.logger.info(sty.ef.inverse + sty.fg.white + "Finished Importing" + sty.rs.all)
    
        # self.relabel_nodes()
        # reset cur_id
        with self.cur_id_lock:
            self.cur_id = self.graph.number_of_nodes()

    def export_to_CSV(self, nodes_file_name, rels_file_name, light = False):
        """
        export to CSV to import to neo4j
        """

        # store the really exported nodes
        exported_nodes = []
        if not os.path.exists("./exports"):
            os.mkdir("./exports")
        with open(nodes_file_name, 'w') as fp:
            headers = ['id:ID','labels:label','type','flags:string[]','lineno:int','code','childnum:int','funcid:int','classname','namespace','endlineno:int','name','doccomment', 'export', 'tainted']
            writer = csv.DictWriter(fp, dialect=self.csv_dialect, fieldnames=headers, extrasaction='ignore')
            writer.writeheader()
            nodes = list(self.graph.nodes(data = True))
            nodes.sort(key = lambda x: int(x[0]))
            for node in nodes:
                node_id, attr = node
                row = dict(attr)

                if light:
                    if 'export' not in row:
                        loggers.error_logger.error("Node " + str(attr) + \
                                " ID: " + node_id + 
                                " was not generated by Graph.add_node method")
                        continue
                    if not row['export']:
                        continue

                row['id:ID'] = node_id
                writer.writerow(row)
                exported_nodes.append(node_id)

        with open(rels_file_name, 'w') as fp:
            headers = ['start:START_ID','end:END_ID','type:TYPE','var','taint_src','taint_dst']
            writer = csv.DictWriter(fp, dialect=self.csv_dialect, fieldnames=headers, extrasaction='ignore')
            writer.writeheader()
            edges = list(self.graph.edges(data = True, keys = True))

            for edge in edges:
                edge_from, edge_to, _, attr = edge

                if edge_from not in exported_nodes or edge_to not in exported_nodes:
                    continue

                row = dict(attr)
                row['start:START_ID'] = edge_from
                row['end:END_ID'] = edge_to
                writer.writerow(row)

        self.logger.info("Finished Exporting to {} and {}".format(nodes_file_name, rels_file_name))

    def testing_benchmark_export_graph(self, file_path):
        """
        export graph to pickle format
        """
        nx.readwrite.write_gpickle(self.graph, file_path)
        
    def export_graph(self, file_path):
        """
        export graph to pickle format
        """
        self.relabel_nodes()
        nx.readwrite.write_gpickle(self.graph, file_path)

    def import_graph(self, file_path):
        """
        import a graph from a exported file
        """
        with open(file_path, 'r') as fp:
            dict_graph = json.load(fp)
        self.graph = nx.Graph(dict_graph)

    def recount_cur_id(self):
        with self.cur_id_lock:
            self.cur_id = 0
        for node in self.graph.nodes:
            node_id = int(self.get_node_attr(node).get('id:ID'))
            with self.cur_id_lock:
                if node_id >= self.cur_id:
                    self.cur_id = node_id + 1

    # AST & CPG

    def _get_childern_by_childnum(self, node_id):
        """
        helper function, get the childern nodeid of the node_id
        return a dict, with {childnum: node_id}
        """
        edges = self.get_out_edges(node_id, edge_type = "PARENT_OF")
        res = {}
        for edge in edges:
            node_attr = self.get_node_attr(edge[1])
            if 'childnum:int' not in node_attr:
                continue
            res[node_attr['childnum:int']] = edge[1]
        return res

    def get_ordered_ast_child_nodes(self, node_id):
        """
        return AST children of a node in childnum order
        """
        children = sorted(self._get_childern_by_childnum(node_id).items(),
                            key=lambda x: int(x[0]))
        if children:
            children = list(zip(*children))[1]

        return children

    def get_child_nodes(self, node_id, edge_type=None, child_name=None, child_type=None, 
        child_label=None):
        """
        return the children of node (with a specific edge type, name, or node type)
        """
        if edge_type is None and child_name is None and child_type is None \
            and child_label is None:
            return self.graph.successors(node_id)
        res = set()
        edges = self.get_out_edges(node_id, edge_type=edge_type)
        for edge in edges:
            flag = True
            aim_node_attr = self.get_node_attr(edge[1])
            if child_type is not None and aim_node_attr.get('type') != child_type:
                flag = False
            if child_name is not None and aim_node_attr.get('name') != child_name:
                flag = False
            if flag:
                res.add(edge[1])
        return list(res)

    def get_name_node_of_obj_node(self, nodeid):
        edges = self.get_in_edges(nodeid, edge_type='NAME_TO_OBJ')
        name_nodes = []
        for edge in edges:
            name_nodes.append(edge[0])
        return name_nodes

    get_successors = get_child_nodes

    def get_name_from_child(self, nodeid, max_depth = None):
        """
        try to find the name of a nodeid
        we have to use bfs strategy
        """
        bfs_queue = []
        visited = set()
        bfs_queue.append((nodeid, 0))

        while(len(bfs_queue)):
            cur_node, cur_depth = bfs_queue.pop(0)
            if max_depth and cur_depth > max_depth: break

            # if visited before, stop here
            if cur_node in visited:
                continue
            else:
                visited.add(cur_node)

            cur_attr = self.get_node_attr(cur_node)

            if 'type' not in cur_attr:
                continue
            if cur_attr['type'] == 'string':
                if cur_attr.get('name'):
                    return cur_attr['name']
                if cur_attr.get('code'):
                    return cur_attr['code']
            elif cur_attr['type'] == 'integer':
                return str(cur_attr['code'])

            out_edges = self.get_out_edges(cur_node, edge_type = 'PARENT_OF')
            out_nodes = [(edge[1], cur_depth + 1) for edge in out_edges]
            bfs_queue += out_nodes

        return None

    def is_statement(self, node_id):
        """
        Return wether a node is a statement node of not

        Args:
            node_id: the node_id
        """
        parent_edges = self.get_in_edges(node_id, edge_type = "PARENT_OF")
        if parent_edges is None or len(parent_edges) == 0:
            return False 
        parent_node = parent_edges[0][0]
        parent_node_attr = self.get_node_attr(parent_node)
        if parent_node_attr.get('type') in ["AST_STMT_LIST"]:
            return True
        return False


    def find_nearest_upper_CPG_node(self, node_id):
        """
        Return the nearest upper CPG node of the input node.
        
        A CPG node is defined as a child of a block node
        (AST_STMT_LIST).
        """
        # follow the parent_of edge to research the stmt node
        if node_id in self.nearest_upper_CPG_cache:
            return self.nearest_upper_CPG_cache[node_id]

        ori_node_id = node_id
        result = None
        while True:
            assert node_id is not None
            parent_edges = self.get_in_edges(node_id, edge_type = "PARENT_OF")
            if parent_edges is None or len(parent_edges) == 0:
                break
            parent_node = parent_edges[0][0]
            parent_node_attr = self.get_node_attr(parent_node)
            if parent_node_attr.get('type') in ["AST_STMT_LIST"]:
                result = node_id
                break
            node_id = parent_node

        self.nearest_upper_CPG_cache[ori_node_id] = result 
        return result

    def check_upper_toplevel(self, node_id):
        result = False
        parent_edges = self.get_in_edges(node_id, edge_type="PARENT_OF")
        if parent_edges is not None and len(parent_edges) > 0:
            parent_node = parent_edges[0][0]
            parent_node_attr = self.get_node_attr(parent_node)
            if parent_node_attr.get('type') in ["AST_TOPLEVEL"]:
                result = True
        return result

    def get_all_child_nodes(self, node_id, max_depth = None):
        """
        return a list of child node id, by bfs order
        Args:
            node_id: the node id of the start node

        Return:
            a list of node in bfs order
        """
        bfs_queue = []
        visited = set()
        bfs_queue.append((node_id, 0))

        while(len(bfs_queue)):
            cur_node, cur_depth = bfs_queue.pop(0)
            if max_depth and cur_depth > max_depth: break

            # if visited before, stop here
            if cur_node in visited:
                continue
            else:
                visited.add(cur_node)

            cur_attr = self.get_node_attr(cur_node)

            out_edges = self.get_out_edges(cur_node, edge_type = 'PARENT_OF')
            out_nodes = [(edge[1], cur_depth + 1) for edge in out_edges]
            bfs_queue += out_nodes

        # sort the set to make it deterministic
        return sorted(visited, key=lambda v: int(v))

    # Object graph
    # name nodes and object nodes

    def add_obj_node(self, ast_node=None, js_type='object', value=None):
        '''
        Add an object node (including literal).
        
        Args:
            ast_node (optional): The corresponding AST node.
                Defaults to None.
            js_type (str, optional): JavaScript type. Use None to avoid
                adding prototype (but type is still set to 'object').
                Use 'array' to quickly create an array (type is still
                'object'). Defaults to 'object'.
            value (str, optional): Value of a literal, represented by
                JavaScript code. Defaults to None.
        
        Returns:
            Added object node's node id.
        '''
        obj_node = str(self._get_new_nodeid())
        self.add_node(obj_node)
        self.set_node_attr(obj_node, ('labels:label', 'Object'))

        if ast_node is not None:
            self.add_edge(obj_node, ast_node, {"type:TYPE": "OBJ_TO_AST"})

        # Literals' constructors are immutable.
        # Even if you assigned another function to the constructors
        # (e.g. Object = function(){}), objects are still created with
        # original constructors (and prototypes).
        if js_type is None:
            js_type = 'object'
        elif js_type == "function":
            self.add_obj_as_prop("prototype", ast_node, "object",
                    parent_obj=obj_node)
            if self.function_prototype is not None:
                # prevent setting __proto__ before setup_object_and_function runs
                self.add_obj_as_prop(prop_name="__proto__", parent_obj=
                    obj_node, tobe_added_obj=self.function_prototype)
                self.add_obj_as_prop(prop_name="constructor", parent_obj=
                    obj_node, tobe_added_obj=self.function_cons)
        elif js_type == "object":
            if self.object_prototype is not None:
                # prevent setting __proto__ before setup_object_and_function runs
                self.add_obj_as_prop(prop_name="__proto__", parent_obj=
                obj_node, tobe_added_obj=self.object_prototype)
                self.add_obj_as_prop(prop_name="constructor", parent_obj=
                    obj_node, tobe_added_obj=self.object_cons)
                if self.check_proto_pollution and value == wildcard:
                    self.add_obj_as_prop(prop_name="constructor", parent_obj=
                    obj_node, tobe_added_obj=self.array_cons)
                    self.add_obj_as_prop(prop_name="constructor", parent_obj=
                    obj_node, tobe_added_obj=self.number_cons)
        elif js_type == "array":
            # js_type = 'object'     # don't change, keep 'array' type in graph
            if self.array_prototype is not None:
                self.add_obj_as_prop(prop_name="__proto__", parent_obj=
                obj_node, tobe_added_obj=self.array_prototype)
                self.add_obj_as_prop(prop_name="constructor", parent_obj=
                    obj_node, tobe_added_obj=self.array_cons)
        elif js_type == "string":
            if self.string_prototype is not None:
                # prevent setting __proto__ before setup_object_and_function runs
                self.add_obj_as_prop(prop_name="__proto__", parent_obj=
                obj_node, tobe_added_obj=self.string_prototype)
                self.add_obj_as_prop(prop_name="constructor", parent_obj=
                    obj_node, tobe_added_obj=self.string_cons)
            if value is None or value == wildcard:
                length = wildcard
            else:
                value = str(value)
                length = len(value)
            self.add_obj_as_prop(prop_name="length", parent_obj=
            obj_node, js_type='number', value=length)

        self.set_node_attr(obj_node, ('type', js_type))

        if value is not None:
            self.set_node_attr(obj_node, ('code', value))

        return obj_node
    
    def convert_wildcard_obj_type(self, obj_node, to_type='array'):
        """
        the wildcard obj maybe every type. If we found a wildcard obj is a special type
        we need to convert the obj into the specified type. 
        supported type: array
        """
        loggers.main_logger.info(f"convert obj {obj_node} type to {to_type}")
        self.set_node_attr(obj_node, ('type', to_type))

        if to_type == 'array':
            type_prototype = self.array_prototype
            type_constructor = self.array_cons

        proto_name_node = self.get_child_nodes(obj_node, child_name='__proto__')
        cons_name_node = self.get_child_nodes(obj_node, child_name='constructor')

        if len(proto_name_node) != 0:
            proto_name_node = proto_name_node[0]
            cur_proto_target = self.get_child_nodes(proto_name_node, 'NAME_TO_OBJ')
            if len(cur_proto_target) != 0:
                self.remove_all_edges_between(proto_name_node, cur_proto_target[0])
            self.add_edge_if_not_exist(proto_name_node, type_prototype,
                {'type:TYPE': "NAME_TO_OBJ"})
        else:
            self.add_obj_as_prop(prop_name="__proto__", parent_obj=
            obj_node, tobe_added_obj=type_prototype)
        
        if len(cons_name_node) != 0:
            cons_name_node = cons_name_node[0]
            cur_proto_target = self.get_child_nodes(cons_name_node, 'NAME_TO_OBJ')
            if len(cur_proto_target) != 0:
                self.remove_all_edges_between(proto_name_node, cur_proto_target[0])
            self.add_edge_if_not_exist(cons_name_node, type_constructor,
                {'type:TYPE': "NAME_TO_OBJ"})
        else:
            self.add_obj_as_prop(prop_name="constructor", parent_obj=
                obj_node, tobe_added_obj=type_constructor)
        
        if to_type == 'array':
            # if the type is array, we should add 
            num_added_sub = 3
            if len(self.get_prop_obj_nodes(obj_node, prop_name='0')) == 0:
                # no child under this array node
                for i in range(num_added_sub):
                    added_sub_obj = self.add_obj_as_prop(prop_name=str(i), parent_obj=obj_node)
                    self.set_node_attr(added_sub_obj, ('tainted', True))
                    self.set_node_attr(added_sub_obj, ('code', wildcard))
                    loggers.main_logger.info(f"Adding sub obj {added_sub_obj} {self.get_node_attr(added_sub_obj)} to array {obj_node}")
            self.add_obj_as_prop(prop_name='length', parent_obj=obj_node, value=str(num_added_sub))

    def add_name_node(self, name, scope=None):
        """
        helper function
        add a namenode to scope
        """
        cur_scope = self.mydata.cur_scope if self.thread_version else self.cur_scope
        if scope != None:
            cur_scope = scope 

        new_name_node = str(self._get_new_nodeid())
        self.add_node(new_name_node, {'labels:label': 'Name', 'name': name})
        self.add_edge(cur_scope, new_name_node, {"type:TYPE": "SCOPE_TO_VAR"})
        if self.client_side:
            window_obj = None
            if name!='window':
                if cur_scope == self.bg_scope:
                    window_obj = self.bg_window
                elif cur_scope in self.cs_scopes:
                    window_obj = self.cs_window[cur_scope]
            if window_obj!=None:
                self.add_edge_if_not_exist(window_obj, new_name_node, {"type:TYPE": "OBJ_TO_PROP"})
        """
        self.set_node_attr(new_name_node, ('labels:label', 'Name'))
        self.set_node_attr(new_name_node, ('name', name))
        """
        return new_name_node

    def add_prop_name_node(self, name, parent_obj):
        """
        Add an empty name node (without a corresponding object) as a
        property of another object.

        obj -> name node

        For left side of an assignment (such that no dummy object node
        is created).
        """
        new_name_node = str(self._get_new_nodeid())
        self.add_node(new_name_node)
        self.set_node_attr(new_name_node, ('labels:label', 'Name'))
        self.set_node_attr(new_name_node, ('name', name))
        self.add_edge_if_not_exist(parent_obj, new_name_node,
            {"type:TYPE": "OBJ_TO_PROP"})
        cs_windows = [self.cs_window[i] for i in self.cs_window]
        if self.client_side:
            if parent_obj == self.bg_window:
                self.add_edge_if_not_exist(self.bg_scope, new_name_node,
                                           {"type:TYPE": "SCOPE_TO_VAR"})
            elif parent_obj in cs_windows:
                cs_scope = [i for i in self.cs_window if self.cs_window[i]==parent_obj]
                self.add_edge_if_not_exist(cs_scope[0], new_name_node,
                                           {"type:TYPE": "SCOPE_TO_VAR"})
        return new_name_node

    def add_obj_as_prop(self, prop_name=None, ast_node=None, js_type='object', 
        value=None, parent_obj=None, tobe_added_obj=None, combined=True):
        """
        add (or put) an obj as a property of another obj
        parent_obj -> name node -> new obj / tobe_added_obj
        add edge from ast node to obj generation node
        """
        assert parent_obj is not None

        name_node = self.get_prop_name_node(prop_name, parent_obj)

        if name_node is None:
            name_node = self.add_prop_name_node(prop_name, parent_obj)

        if tobe_added_obj is None:
            tobe_added_obj = self.add_obj_node(ast_node, js_type, value)

        self.add_edge(name_node, tobe_added_obj, {"type:TYPE": "NAME_TO_OBJ"})

        cs_windows = [self.cs_window[i] for i in self.cs_window]
        if not self.client_side:
            if combined and parent_obj == self.BASE_OBJ:
                self.add_obj_to_scope(name=prop_name, scope=self.BASE_SCOPE,
                    tobe_added_obj=tobe_added_obj, combined=False)
        else:
            if combined and parent_obj in [self.bg_window]:
                if not self.thread_version:
                    tmp_scope = self.cur_file_scope
                else:
                    tmp_scope = self.mydata.cur_file_scope
                self.add_obj_to_scope(name=prop_name, scope=tmp_scope,
                                      tobe_added_obj=tobe_added_obj, combined=False)
            elif combined and parent_obj in cs_windows:
                if not self.thread_version:
                    tmp_scope = self.cur_file_scope
                else:
                    tmp_scope = self.mydata.cur_file_scope
                self.add_obj_to_scope(name=prop_name, scope=tmp_scope,
                                         tobe_added_obj=tobe_added_obj, combined=False)
        return tobe_added_obj

    def add_obj_to_scope(self, name=None, ast_node=None, js_type='object',
        value=None, scope=None, tobe_added_obj=None, combined=True):
        """
        add a obj to a scope, if scope is None, add to current scope
        return the added node id
        """
        if scope == None:
            scope = self.mydata.cur_scope if self.thread_version else self.cur_scope
        # check if the name node exists first
        name_node = self.get_name_node(name, scope=scope, follow_scope_chain=False)
        if name_node == None:
            self.logger.debug(f'{sty.ef.b}Add name node{sty.rs.all} {name} in scope {scope}')
            name_node = self.add_name_node(name, scope=scope)

        if tobe_added_obj == None:
            # here we do not add obj to current obj when add to scope
            # we just add a obj to scope
            tobe_added_obj = self.add_obj_node(ast_node, js_type, value)
        self.add_edge(name_node, tobe_added_obj, {"type:TYPE": "NAME_TO_OBJ"})

        if not self.client_side:
            if combined and scope == self.BASE_SCOPE:
                self.add_obj_as_prop(prop_name=name, parent_obj=self.BASE_OBJ,
                    tobe_added_obj=tobe_added_obj, combined=False)
        else:
            if combined and scope == self.bg_scope:
                self.add_obj_as_prop(prop_name=name, parent_obj=self.bg_window,
                    tobe_added_obj=tobe_added_obj, combined=False)
            elif combined and scope in self.cs_scopes:
                if not self.thread_version:
                    self.add_obj_as_prop(prop_name=name, parent_obj=self.cs_window[self.cur_file_scope],
                        tobe_added_obj=tobe_added_obj, combined=False)
                else:
                    self.add_obj_as_prop(prop_name=name, parent_obj=self.cs_window[self.mydata.cur_file_scope],
                          tobe_added_obj=tobe_added_obj, combined=False)
        return tobe_added_obj

    add_obj_to_name = add_obj_to_scope

    def add_obj_to_name_node(self, name_node, ast_node=None, js_type='object',
        value=None, tobe_added_obj=None):
        """
        Add a new object (or put a existing object) under a name node.

        name node -> new obj / tobe_added_obj
        """
        if tobe_added_obj is None:
            tobe_added_obj = self.add_obj_node(ast_node, js_type, value)

        self.add_edge(name_node, tobe_added_obj, {"type:TYPE": "NAME_TO_OBJ"})

        return tobe_added_obj

    def get_all_child_name_nodes(self, scope, follow_scope_chain=True, scope_type=None):
        """
        return all the name nodes of a under a scope node
        including only the name nodes that under scopes
        """
        res = set()
        scope_queue = [scope]

        while len(scope_queue) != 0:
            cur_scope = scope_queue.pop()
            var_edges = self.get_out_edges(cur_scope, data = True, keys = True, edge_type = "SCOPE_TO_VAR")
            for cur_edge in var_edges:
                res.add(cur_edge[1])
            if not follow_scope_chain:
                break
            scope_edges = self.get_out_edges(cur_scope, data=False, keys=False, edge_type = "PARENT_SCOPE_OF")
            scope_queue += [edge[1] for edge in scope_edges]
        return res 

    def get_name_node(self, var_name, scope = None, follow_scope_chain = True):
        """
        Get the name node of a name based on scope.
        """
        if scope == None:
            if self.thread_version:
                scope = self.mydata.cur_scope
            else:
                scope = self.cur_scope

        while True:
            var_edges = self.get_out_edges(scope, data = True, keys = True, edge_type = "SCOPE_TO_VAR")
            for cur_edge in var_edges:
                cur_var_attr = self.get_node_attr(cur_edge[1])
                if cur_var_attr['name'] == var_name:
                    return cur_edge[1]
            if not follow_scope_chain:
                break
            scope_edges = self.get_in_edges(scope, data = True, keys = True, edge_type = "PARENT_SCOPE_OF")
            if len(scope_edges) == 0:
                break
            scope = list(scope_edges)[0][0]
        return None

    def get_objs_by_name_node(self, name_node, branches=None):
        '''
        Get corresponding object nodes of a name node.
        
        Args:
            name_node: the name node.
            branches (BranchTagContainer, optional): branch information.
                Default to None.
        
        Returns:
            list: list of object nodes.
        '''
        if name_node is None:
            return []
        out_edges = self.get_out_edges(name_node, edge_type='NAME_TO_OBJ')
        objs = set([edge[1] for edge in out_edges])
        if branches:
            # initiate a dictionary that records if the object exists in the current branch
            has_obj = {}
            for obj in objs:
                has_obj[obj] = False
            # check edges without branch tag
            for _, obj, _, attr in out_edges:
                branch_tag = attr.get('branch')
                # for_tags = self.get_node_attr(obj).get('for_tags')
                if branch_tag is None:
                    has_obj[obj] = True
            # for each branch in branch history
            # we check from the oldest (shallowest) to the most recent (deepest)
            for branch in branches:
                # check which edge matches the current checking branch
                for _, obj, _, attr in out_edges:
                    tag = attr.get('branch')
                    if tag and tag.point == branch.point and tag.branch == branch.branch:
                        if tag.mark == 'A':
                            # if the object is added (assigned) in that branch
                             has_obj[obj] = True
                        elif tag.mark == 'D':
                            # if the object is removed in that branch
                            has_obj[obj] = False
                    for tag in self.get_node_attr(obj).get('for_tags', []):
                        if tag.point == branch.point:
                            if branch.branch is not None and \
                                tag.branch != branch.branch:
                                # if the object is used as the loop variable
                                # or created in another branch of that
                                # branching point
                                has_obj[obj] = False
                                break
            return list(filter(lambda x: has_obj[x], objs))
        else:
            return list(objs)

    get_obj_nodes = get_objs_by_name_node

    def get_objs_by_name(self, var_name, scope=None, branches=[]):
        '''
        Get object nodes by a variable name.
        
        Args:
            var_name (str): variable name.
            scope (optional): scope to find the variable in. Defaults to
                current scope.
            branches (list, optional): branch information.
        
        Returns:
            list: list of object nodes.
        '''
        # if var_name == 'this':    # "this" will be handled in handle_node
        #     return self.cur_objs
        name_node = self.get_name_node(var_name, scope)
        if name_node == None:
            return []
        res_objs = self.get_objs_by_name_node(name_node, branches)
        if var_name.startswith("source_hqbpillvul"):
            # built in source, mark as tainted
            for obj in res_objs:
                self.set_node_attr(obj, ("tainted", True))
                # self.set_node_attr(obj, ('taint_flow', [([obj],var_name)]))
        return res_objs

    def get_prop_names(self, parent_obj, exclude_proto=True):
        s = set()
        for name_node in self.get_prop_name_nodes(parent_obj):
            name = self.get_node_attr(name_node).get('name')
            if exclude_proto and name == '__proto__':
                continue
            if name is not None:
                s.add(name)
        return list(s)

    get_keys = get_prop_names

    def get_prop_name_nodes(self, parent_obj=None, user_defined_only = False ):
        name_nodes = self.get_child_nodes(parent_obj, edge_type='OBJ_TO_PROP')
        if user_defined_only:
            name_nodes = filter(
                lambda x: self.get_node_attr(x).get('name') not in
                          ['prototype', '__proto__', 'constructor', 'length'],
                name_nodes)
        return name_nodes

    def get_prop_name_node(self, prop_name, parent_obj=None):
        for name_node in self.get_prop_name_nodes(parent_obj):
            if self.get_node_attr(name_node).get('name') == prop_name:
                return name_node
        return None

    def get_prop_obj_nodes_recur(self, parent_obj, prop_name=None,
        branches: List[BranchTag]=[], exclude_proto=True,
        numeric_only=False):
        '''
        Descrpted !!!!!!!!!!
        Get object nodes of an object's property, recursively.
        
        Args:
            parent_obj (optional): Defaults to None (current object).
            prop_name (str, optional): Property name. Defaults to None,
                which means get all properties' object nodes.
            branches (List[BranchTag], optional): branch information.
                Defaults to [].
            exclude_proto (bool, optional): Whether exclude prototype
                and __proto__ when getting all properties.
                Defaults to True.
        
        Returns:
            list: object nodes.
        '''
        res = []
        cur_obj_nodes = self.get_prop_obj_nodes(parent_obj, prop_name=prop_name,
                branches=branches, exclude_proto=exclude_proto, numeric_only=numeric_only)
        res = res + cur_obj_nodes
        for node in cur_obj_nodes:
            res = res + self.get_prop_obj_nodes_recur(node, prop_name=prop_name,
                branches=branches, exclude_proto=exclude_proto, numeric_only=numeric_only)
        return res

    def get_prop_obj_nodes(self, parent_obj, prop_name=None,
        branches: List[BranchTag]=[], exclude_proto=True,
        numeric_only=False, user_defined_only = False):
        '''
        Get object nodes of an object's property.
        
        Args:
            parent_obj (optional): Defaults to None (current object).
            prop_name (str, optional): Property name. Defaults to None,
                which means get all properties' object nodes.
            branches (List[BranchTag], optional): branch information.
                Defaults to [].
            exclude_proto (bool, optional): Whether exclude prototype
                and __proto__ when getting all properties.
                Defaults to True.
        
        Returns:
            list: object nodes.
        '''
        s = set()
        if prop_name is None: # this caused inconsistent run results
            name_nodes = self.get_prop_name_nodes(parent_obj)
            if prop_name is None and exclude_proto:
                name_nodes = filter(
                    lambda x: self.get_node_attr(x).get('name') not in
                        ['prototype', '__proto__'],
                    name_nodes)
            if numeric_only:
                def is_name_int(node):
                    name = self.get_node_attr(node).get('name')
                    if name == wildcard:
                        return True
                    else:
                        try: # check if x is an integer
                            _ = int(name)
                        except ValueError:
                            return False
                        return True
                name_nodes = filter(is_name_int, name_nodes)
            if prop_name is None and user_defined_only:
                name_nodes = filter(
                    lambda x: self.get_node_attr(x).get('name') not in
                              ['prototype', '__proto__', 'constructor', 'length'],
                    name_nodes)
            for name_node in name_nodes:
                s.update(self.get_obj_nodes(name_node, branches))
        else:
            name_node = self.get_prop_name_node(prop_name, parent_obj)
            s.update(self.get_obj_nodes(name_node, branches))
        return list(s)

    def assign_obj_nodes_to_name_node(self, name_node, obj_nodes, multi=False,
        branches=BranchTagContainer()):
        '''
        Assign (multiple) object nodes to a name node.
        
        Args:
            name_node: where to put the objects.
            obj_nodes: objects to be assigned.
            multi (bool, optional):
                True: do NOT delete edges.
                False: delete existing edges.
                Defaults to False.
            branches (List[BranchTag], optional):
                List of branch tags. Defaults to [].
        '''
        branch = branches.get_last_choice_tag()
        # remove previous objects
        pre_objs = self.get_objs_by_name_node(name_node, branches)
        self.logger.debug(f'Assigning {obj_nodes} to {name_node}, ' + \
            f'pre_objs={pre_objs}, branches={branches}')
        if pre_objs and not multi:
            for obj in pre_objs:
                if branch:
                    # check if any addition (assignment) exists
                    # in current branch
                    flag = False
                    for key, edge_attr in self.get_edges_between(name_node, obj,
                        'NAME_TO_OBJ').items():
                        tag = edge_attr.get('branch', BranchTag())
                        if tag == BranchTag(branch, mark='A'):
                            # if addition exists, delete the addition edge
                            with self.graph_lock:
                                self.graph.remove_edge(name_node, obj, key)
                            flag = True
                    if not flag:
                        # if no addition, add a deletion edge
                        self.add_edge(name_node, obj,{'type:TYPE':
                        'NAME_TO_OBJ', 'branch': BranchTag(branch, mark='D')})
                else:
                    # do not use "remove_edge", which cannot remove all edges
                    self.remove_all_edges_between(name_node, obj)
                    self.logger.debug('  Remove ' + obj)
        # add new objects to name node
        for obj in obj_nodes:
            if branch:
                self.add_edge(name_node, obj, {"type:TYPE": "NAME_TO_OBJ",
                "branch": BranchTag(branch, mark='A')})
            else:
                self.add_edge(name_node, obj, {"type:TYPE": "NAME_TO_OBJ"})

    def get_obj_def_ast_node(self, obj_node, aim_type=None):
        """
        Find where in the AST an object (especially a function) is
        defined.
        
        The AST node is the successor of the object node via the
        OBJ_TO_AST edge.
        """
        aim_map = {
                'function': ['AST_FUNC_DECL', 'AST_CLOSURE', 'AST_METHOD'],
                }
        tmp_edge = self.get_out_edges(obj_node, data = True, keys = True,
            edge_type = "OBJ_TO_AST")
        if not tmp_edge:
            return None
        else:
            if aim_type is not None:
                for edge in tmp_edge:
                    cur_type = self.get_node_attr(edge[1]).get('type')
                    if cur_type in aim_map[aim_type]:
                        return edge[1]
            else:
                for edge in tmp_edge:
                    cur_type = self.get_node_attr(edge[1]).get('type')
                    if cur_type not in aim_map['function']:
                        return edge[1]

            return tmp_edge[0][1]

    def copy_obj(self, obj_node, ast_node=None, copied=None, deep=False, copy_user_defined_only = True):
        '''
        Copy an object and its properties.
        '''
        if copied is None:
            copied = set()
        # copy object node
        new_obj_node = str(self._get_new_nodeid())
        self.add_node(new_obj_node, self.get_node_attr(obj_node))
        attr = self.get_node_attr(new_obj_node)
        from src.plugins.internal.utils import copy_taint_flow
        if 'taint_flow' in attr:
            taint_flow = copy_taint_flow(attr['taint_flow'])
            for flow in taint_flow:
                flow[0].append(new_obj_node)
            self.set_node_attr(new_obj_node, ('taint_flow', taint_flow))
        # copy properties, copy only user defined properties
        for prop_name_node in self.get_prop_name_nodes(parent_obj=obj_node, user_defined_only=copy_user_defined_only):
        # for i in self.get_out_edges(obj_node, edge_type='OBJ_TO_PROP'):
            # copy property name node
            # prop_name_node = i[1]
            new_prop_name_node = str(self._get_new_nodeid())
            self.add_node(new_prop_name_node,self.get_node_attr(prop_name_node))
            # print("copying property name node ", self.get_node_attr(prop_name_node))
            self.add_edge(new_obj_node, new_prop_name_node,{'type:TYPE': 'OBJ_TO_PROP'})
            if self.get_node_attr(prop_name_node).get('name') == '__proto__':
                for j in self.get_out_edges(prop_name_node, edge_type='NAME_TO_OBJ'):
                    self.add_edge(new_prop_name_node, j[1],
                        {'type:TYPE': 'NAME_TO_OBJ'})
                continue
            # copy property object nodes
            for j in self.get_out_edges(prop_name_node, edge_type='NAME_TO_OBJ'):
                if deep:
                    # sometimes this loop may dead inside a graph with a circle
                    # check whether we copied this node before
                    if j[1] in copied:
                        continue
                    copied.add(j[1])
                    new_prop_obj_node = self.copy_obj(j[1], ast_node, copied, deep=deep)
                    # self.add_node(new_prop_obj_node, self.get_node_attr(j[1])) # ?
                    self.add_edge(new_prop_name_node, new_prop_obj_node,
                        {'type:TYPE': 'NAME_TO_OBJ'})
                else:
                    self.add_edge(new_prop_name_node, j[1],
                        {'type:TYPE': 'NAME_TO_OBJ'})
        # copy OBJ_DECL edges
        for e in self.get_out_edges(obj_node, edge_type='OBJ_DECL'):
            self.add_edge(new_obj_node, e[1], {'type:TYPE': 'OBJ_DECL'})
        if ast_node is not None:
            # assign new OBJ_TO_AST edges
            self.add_edge(new_obj_node, ast_node, {'type:TYPE': 'OBJ_TO_AST'})
        else:
            # copy OBJ_TO_AST edges
            for e in self.get_out_edges(obj_node, edge_type='OBJ_TO_AST'):
                self.add_edge(new_obj_node, e[1], {'type:TYPE': 'OBJ_TO_AST'})
        return new_obj_node


    def get_name_nodes_to_obj(self, obj_node):
        """
        return a list of name nodes that points to cur obj node
        """
        return [edge[0] for edge in self.get_in_edges(obj_node, edge_type='NAME_TO_OBJ')]

    # scopes

    def add_scope(self, scope_type, decl_ast=None, scope_name=None,
        decl_obj=None, caller_ast=None, func_name=None, parent_scope=None):
        """
        Add a new scope under current scope.

        If the scope already exists, return it without adding a new one.
        """
        new_scope_node = str(self._get_new_nodeid())
        self.add_node(new_scope_node, {'labels:label': 'Scope',
            'type': scope_type, 'name': scope_name})
        if decl_ast is not None:
            self.add_edge(new_scope_node, decl_ast,
                {'type:TYPE': 'SCOPE_TO_AST'})
        if parent_scope is None:
            if self.thread_version:
                tmp_scope = self.mydata.cur_scope
            else:
                tmp_scope = self.cur_scope
            if tmp_scope is not None:
                self.add_edge(tmp_scope, new_scope_node,
                    {'type:TYPE': 'PARENT_SCOPE_OF'})
            else:
                if self.thread_version:
                    self.mydata.cur_scope = new_scope_node
                else:
                    self.cur_scope = new_scope_node
        else:
            self.add_edge(parent_scope, new_scope_node,
                {'type:TYPE': 'PARENT_SCOPE_OF'})
        if decl_obj is not None:
            self.add_edge(decl_obj, new_scope_node,
                {'type:TYPE': 'OBJ_TO_SCOPE'})
        if caller_ast is not None:
            self.add_edge(new_scope_node, caller_ast,
                {'type:TYPE': 'SCOPE_TO_CALLER'})
        if func_name is not None:
            self.set_node_attr(new_scope_node, ('func_name', func_name))
        return new_scope_node

    def find_ancestor_scope(self, scope_types=['FUNC_SCOPE', 'FILE_SCOPE'],
        cur_scope=None):
        '''
        Find ancestor (file/function) scope from the current (block)
        scope.
        '''
        if cur_scope is None:
            if self.thread_version:
                cur_scope = self.mydata.cur_scope
            else:
                cur_scope = self.cur_scope
        while True:
            if self.get_node_attr(cur_scope).get('type') in scope_types:
                return cur_scope
            edges = self.get_in_edges(cur_scope, edge_type='PARENT_SCOPE_OF')
            if edges:
                cur_scope = edges[0][0]
            else:
                return None

    # functions and calls

    def get_cur_function_decl(self):
        """
        get current running function definition ast node 

        Return:
            the decl ast node of this function
        """
        # get the current running function scope
        cur_func_scope = self.find_ancestor_scope()
        cur_func_decl = self.get_out_edges(cur_func_scope,
                        edge_type='SCOPE_TO_AST')[0][1]
        return cur_func_decl

    def get_func_decl_objs_by_ast_node(self, ast_node, scope=None):
        objs = []
        edges = self.get_in_edges(ast_node, edge_type='OBJ_TO_AST')
        for edge in edges:
            # avoid function run objects
            if self.get_node_attr(edge[0]).get('type') == 'function':
                objs.append(edge[0])
        if scope is not None:
            objs = list(filter(lambda obj: self.has_path(scope, obj), objs))
            if len(objs) > 1:
                self.logger.warning('Function {} is declared as multiple objects in scope {}'
                    .format(ast_node, scope))
        return objs

    def get_func_scopes_by_obj_node(self, obj_node):
        if obj_node == None:
            return None
        scope_edges = self.get_out_edges(obj_node, edge_type = "OBJ_TO_SCOPE")
        return [edge[1] for edge in scope_edges]

    def add_blank_func_to_scope(self, func_name, scope=None, python_func:Callable=None):
        '''
        Add a blank function with object graph nodes to a scope.
        
        Args:
            func_name (str): function's name.
            scope (optional): where to add the function. Defaults to
                None, referring to the current scope.
            python_func (optional): a special Python function in lieu of
                the blank JS AST function. Defaults to None.
        '''
        func_obj = self.add_blank_func_with_og_nodes(func_name)
        self.add_obj_to_name(func_name, scope=scope, tobe_added_obj=func_obj)
        if python_func is not None:
            self.set_node_attr(func_obj, ('pythonfunc', python_func))
        return func_obj

    def add_blank_func_as_prop(self, func_name, parent_obj=None, python_func:Callable=None):
        '''
        Add a blank function with object graph nodes as a property of
        another object.
        
        Args:
            func_name (str): function's name.
            parent_obj (optional): function's parent object. Defaults to
                None, referring to the current object.
            python_func (optional): a special Python function in lieu of
                the blank JS AST function. Defaults to None.
        '''
        func_obj = self.add_blank_func_with_og_nodes(func_name)
        self.add_obj_as_prop(func_name, parent_obj=parent_obj,
                             tobe_added_obj=func_obj)
        if python_func is not None:
            self.set_node_attr(func_obj, ('pythonfunc', python_func))
        return func_obj

    def convert_obj_node_type_to_function(self, obj, func_ast=None):
        '''
        Convert an object node of any type to function.
        Function's prototype will also be added.

        Args:
            obj: The object node.
            func_ast (optional): Function's AST node. Default to None.
        '''
        # assert obj != self.undefined_obj
        # assert obj != self.null_obj
        if self.get_node_attr(obj).get('code') != wildcard:
            self.set_node_attr(obj, ('type', 'function'))
        self.add_obj_as_prop("prototype", func_ast, "object", 
                parent_obj=obj)
        if self.function_prototype is not None:
            # prevent setting __proto__ before setup_object_and_function runs
            self.add_obj_as_prop(prop_name="__proto__", parent_obj=obj,
            tobe_added_obj=self.function_prototype)

        """
        # for existing variable we do not need to remove obj to ast
            # remove old OBJ_TO_AST edges
        if func_ast is not None:
            edges = self.get_out_edges(obj, edge_type="OBJ_TO_AST")
            for edge in edges:
                self.graph.remove_edge(edge[0], edge[1])
        """

        if func_ast is not None:
            self.add_edge(obj, func_ast, {"type:TYPE": "OBJ_TO_AST"})

    def add_blank_func_with_og_nodes(self, func_name, func_obj=None):
        '''
        Add a blank function with object graph nodes (name node, function
        scope, and function declaration object node).
        
        Args:
            func_name (str): Function's name.
            func_obj (optional): Function's object node if known. Use it
                when you want to overwrite an existing object node.
                Default to None.
        '''
        ast_node = self.add_blank_func(func_name)
        if func_obj is None:
            func_obj = self.add_obj_node(ast_node, "function")
        else:
            self.convert_obj_node_type_to_function(func_obj, ast_node)
        return func_obj

    def add_blank_func(self, func_name):
        """
        add a blank func
        used for built-in functions
        we need to run the function after the define
        """
        self.logger.debug(sty.ef.inverse + sty.fg(179) + "Add blank function" + sty.rs.all + " name: {}".format(func_name))

        # add a function decl node first
        func_ast = self._get_new_nodeid()
        self.add_node(func_ast)
        # self.set_node_attr(func_ast, ('funcid', func_ast))
        self.set_node_attr(func_ast, ('type', "AST_CLOSURE"))
        self.set_node_attr(func_ast, ('labels:label', 'Artificial_AST'))

        # add a node as the name of the function
        namenode_id = self._get_new_nodeid()
        self.add_node(namenode_id)
        self.set_node_attr(namenode_id, ('type', 'string'))
        self.set_node_attr(namenode_id, ('name', func_name))
        self.set_node_attr(namenode_id, ('labels:label', 'Artificial_AST'))
        self.set_node_attr(namenode_id, ('childnum:int', 0))

        entry_id = self._get_new_nodeid()
        self.add_node(entry_id)
        self.set_node_attr(entry_id, ('funcid', func_ast))
        self.set_node_attr(entry_id, ('type', 'CFG_FUNC_ENTRY'))
        self.set_node_attr(entry_id, ('labels:label', 'Artificial'))

        exit_id = self._get_new_nodeid()
        self.add_node(exit_id)
        self.set_node_attr(exit_id, ('funcid', func_ast))
        self.set_node_attr(exit_id, ('type', 'CFG_FUNC_EXIT'))
        self.set_node_attr(exit_id, ('labels:label', 'Artificial'))

        params_id = self._get_new_nodeid()
        self.add_node(params_id)
        self.set_node_attr(params_id, ('funcid', func_ast))
        self.set_node_attr(params_id, ('type', 'AST_PARAM_LIST'))
        self.set_node_attr(params_id, ('labels:label', 'Artificial_AST'))
        self.set_node_attr(params_id, ('childnum:int', 1))

        # add edges
        self.add_edge(func_ast, entry_id, {'type:TYPE': "ENTRY"})
        self.add_edge(func_ast, exit_id, {'type:TYPE': "EXIT"})
        self.add_edge(func_ast, namenode_id, {'type:TYPE': "PARENT_OF"})
        self.add_edge(func_ast, params_id, {'type:TYPE': "PARENT_OF"})
        self.add_edge(entry_id, exit_id, {'type:TYPE': "FLOWS_TO"})

        # we need to run the function 
        return func_ast

    def get_self_invoke_node_by_caller(self, caller_id):
        """
        Deprecated

        get the closure of self invoke function by the caller id
        
        Args:
            caller_id: the node id of the caller
        """
        return self._get_childern_by_childnum(caller_id)['0']

    def get_cur_file_path(self, cur_scope=None):
        file_scope = self.find_ancestor_scope(cur_scope=cur_scope,
            scope_types=['FILE_SCOPE'])
        file_ast = self.get_out_edges(file_scope,
                        edge_type='SCOPE_TO_AST')[0][1]
        return self.get_node_attr(file_ast).get('name')

    # prototype

    def _get_upper_level_prototype(self, obj_node):
        """
        get the upper level of prototype
        used for a helper function to link __proto__ and prototype

        Args:
            obj_node: the child obj node
            relation: obj_node -OBJ_DECL-> AST_FUNC_DECL -OBJ_TO_AST-> 
            FUNC_DECL -OBJ_TO_PROP-> prototype -NAME_TO_OBJ-> PROTOTYPE
        """
        ast_upper_func_node = self.get_child_nodes(obj_node, 
                edge_type = "OBJ_DECL")[0]
        edges = self.get_in_edges(ast_upper_func_node,
                edge_type = "OBJ_TO_AST")
        func_decl_obj_node = None
        for edge in edges:
            if self.get_node_attr(edge[0])['type'] == "function":
                func_decl_obj_node = edge[0]
                break
        if func_decl_obj_node is None: # TODO: what is cause of this bug?
            self.logger.error('Cannot find function object node!')
            return []
        else:
            prototype_obj_nodes = self.get_prop_obj_nodes(
                parent_obj=func_decl_obj_node, prop_name='prototype')
            self.logger.debug(f'prototype obj node is {prototype_obj_nodes}')
            return prototype_obj_nodes
    
    def build_proto(self, obj_node):
        """
        build the proto strcture of a object node

        Args:
            obj_node: the obj node need to be build
        """
        upper_level_prototype_objs = self._get_upper_level_prototype(obj_node)
        for obj in upper_level_prototype_objs:
            self.add_obj_as_prop('__proto__', parent_obj=obj_node,
                                 tobe_added_obj=obj)

    def get_parent_object_def(self, node_id):
        """
        get the obj number and defination of the parent object 

        Args:
            node_id: current node id, means the child id
        Return:
            parent_obj: the list of parent obj node of current node id
            def_id: the list of statements that defines the parent object
        """
        parent_obj_nodes = []
        parent_obj_defs = []
        # get the name node first
        name_edges = self.get_in_edges(node_id, edge_type="NAME_TO_OBJ")
        for name_edge in name_edges:
            name_node = name_edge[0]

            parent_obj_edges = self.get_in_edges(name_node, edge_type="OBJ_TO_PROP")
            for parent_obj_edge in parent_obj_edges:
                def_edges = self.get_out_edges(parent_obj_edge[0], edge_type="OBJ_TO_AST")
                if len(def_edges) == 0:
                    continue

                parent_obj_nodes.append(parent_obj_edge[0])
                for def_edge in def_edges:
                    # we return the flatten array
                    # if one obj has multiple defs, defs can not match obj
                    parent_obj_defs.append(def_edge[1])

        return parent_obj_nodes, parent_obj_defs

    def generate_obj_graph_for_python_obj(self, py_obj=None, ast_node=None):
        if py_obj is None:
            return self.null_obj
        elif type(py_obj) in [int, float]:
            return self.add_obj_node(ast_node=ast_node, js_type='number',
                value=py_obj)
        elif type(py_obj) is str:
            return self.add_obj_node(ast_node=ast_node, js_type='string',
                value=py_obj)
        elif type(py_obj) is list:
            obj = self.add_obj_node(ast_node=ast_node, js_type='array',
                value=py_obj)
            for i, u in enumerate(py_obj):
                member = self.generate_obj_graph_for_python_obj(u)
                self.add_obj_as_prop(prop_name=i, tobe_added_obj=member,
                    parent_obj=obj)
            return obj
        elif type(py_obj) is dict:
            obj = self.add_obj_node(ast_node=ast_node, js_type='object',
                value=py_obj)
            for k, v in py_obj.items():
                member = self.generate_obj_graph_for_python_obj(v)
                self.add_obj_as_prop(prop_name=k, tobe_added_obj=member,
                    parent_obj=obj)
            return obj

    # Analysis

    def _dfs_upper_by_edge_type(self, source=None, edge_type='OBJ_REACHES', depth_limit=None):
        """
        dfs a specific type of edge upper from a node id

        Args:
            node_id: the start node id
            edge_types: we only consider some types of edge types
        Return:
            nodes: list, nodes on the pathes
            objs: dict, the objs on the edge, {str(from_to): [obj numbers]} 
        """
        G = self.graph
        pathes = []
        if source is None:
            # edges for all components
            nodes = G
        else:
            # edges for components with source
            nodes = [source]
        visited = set()
        if depth_limit is None:
            depth_limit = len(G)
        for start in nodes:
            # we do not have a global visited
            # each path, or stack should have a visited list but not global
            """
            if start in visited:
                continue
            visited.add(start)
            """

            edge_group = self.get_in_edges(start, edge_type=edge_type)
            nodes_group = [edge[0] for edge in edge_group]

            stack = [(start, depth_limit, iter(nodes_group))]
            while stack:
                parent, depth_now, children = stack[-1]
                try:
                    child = next(children)
                    if child not in [s[0] for s in stack]:
                        if child in visited:
                            continue
                        visited.add(child)
                        # incase deadloop
                        if depth_now > 1:
                            edge_group = self.get_in_edges(child, edge_type=edge_type)
                            nodes_group = [edge[0] for edge in edge_group]
                            stack.append((child, depth_now - 1, iter(nodes_group)))
                            if len(nodes_group) == 0:
                                new_path = [node[0] for node in stack]
                                str_pathes = [str(p) for p in pathes]
                                if str(new_path) not in str_pathes:
                                    pathes.append(new_path)
                except StopIteration:
                    stack.pop()
        return pathes

    def get_node_file_path(self, node_id):
        """
        get the file path of an AST node
        Args:
            node_id: node id
        """
        # it's a ast so a node only has one parent
        while True:
            node_attr = self.get_node_attr(node_id)
            if node_attr['type'] == "AST_TOPLEVEL":
                return node_attr['name']
            parent_edge = self.get_in_edges(node_id, 
                    edge_type = "PARENT_OF")
            if len(parent_edge) != 0:
                node_id = parent_edge[0][0]
            else:
                # should be built in
                return None 

    def get_node_line_code(self, node_id):
        """
        return the line code of a node
        """
        node_attr = self.get_node_attr(node_id)
        if "lineno:int" in node_attr:
            lineno = node_attr['lineno:int']
        else:
            lineno = None
        if lineno is not None:
            file_content = self.get_node_file_content(node_id)
            return "{}: {}".format(lineno, file_content[int(lineno)])
        return None

    def get_node_file_content(self, node_id):
        """
        find the file of a node
        return the dict with numbers and contents
        """
        file_name = self.get_node_file_path(node_id)
        if file_name is None:
            return None
        if file_name not in self.file_contents:
            content_dict = ['']
            with open(file_name, 'r') as fp:
                for file_line in fp:
                    content_dict.append(file_line)
            self.file_contents[file_name] = content_dict.copy()
        return self.file_contents[file_name]

    def check_signature_functions(self, func_names):
        """
        checking whether one of the func_names exist in the graph
        if not, we do not need to build the obj graph
        Args:
            func_names: the possible function names, if length is 0, return True
        Return:
            True for exist or False for not exist
        """
        if len(func_names) == 0:
            return True 
        func_nodes = self.get_node_by_attr('type', 'AST_METHOD_CALL')
        func_nodes += self.get_node_by_attr('type', 'AST_CALL')
        for func_node in func_nodes:
            func_name = self.get_name_from_child(func_node)
            if func_name in func_names:
                return True
        return False
    
    def get_covered_statements(self):
        """
        return the covered statements
        """
        return self.covered_stat

    def get_total_num_statements(self):
        """
        return the total number of statements of AST
        """
        if len(self.all_stat) != 0:
            return len(self.all_stat)

        all_nodes = self.get_all_nodes()
        for n in all_nodes:
            if 'type' in all_nodes[n]:
                if 'AST_' in all_nodes[n]['type'] and self.is_statement(n):
                    self.all_stat.add(n)
        # print('len(self.all_stat): ', len(self.all_stat))
        return len(self.all_stat)

    def get_all_stat(self):
        self.get_total_num_statements()
        return self.all_stat

    def get_header_num_statements(self):
        if len(self.header_stat) != 0:
            return len(self.header_stat)

        all_nodes = self.get_all_nodes()
        threshold = 0
        for n in all_nodes:
            if 'type' in all_nodes[n] and 'AST_' in all_nodes[n]['type'] and self.is_statement(n):
                filepath = self.get_node_file_path(n)
                # print("filepath: ", filepath)
                if "/bg.js" in filepath:
                    threshold = self.bg_header_lines
                elif "/cs" in filepath:
                    threshold = self.cs_header_lines
                cur_node_attr = self.get_node_attr(n)
                if cur_node_attr.get('lineno:int') is None:
                    continue
                else:
                    try:
                        line_num = int(cur_node_attr.get('lineno:int'))
                        if line_num < threshold:
                            self.header_stat.add(n)
                    except:
                        pass
        # print('len(self.all_stat): ', len(self.all_stat))
        return len(self.header_stat)

    def get_header_stat(self):
        self.get_header_num_statements()
        return self.header_stat

    def get_total_num_functions(self):
        """
        return the total number of statements of AST
        """
        if len(self.all_func) != 0:
            return len(self.all_func)

        all_nodes = self.get_all_nodes()
        for n in all_nodes:
            if 'type' in all_nodes[n]:
                if all_nodes[n]['type'] in ['AST_FUNC_DECL', 'AST_CLOSURE']:
                    if 'labels:label' in all_nodes[n] and \
                            all_nodes[n]['labels:label'] == 'Artificial_AST':
                        pass
                    else:
                        self.all_func.add(n)
        return len(self.all_func)

    def get_off_spring(self, node_id, print_nodes = False):
        """
        # get all the offsprings of a certain obj node
        # if we do not wish to include the length obj, we should exclude it
        :param G: graph
        :param node_id: node id
        :return: a set of objs which is the user_defined_only offspring of the obj
        """
        offspring = set()  # the set of all its offspring
        sons = set()  # the set of the next level offspring
        # print("get_off_spring", node_id)
        if self.get_cur_window_obj()==node_id:
            return set(node_id)
        if print_nodes:
            names = self.get_prop_name_nodes(node_id)
            for name in names:
                print(self.get_node_attr(name))
        sons.update(self.get_prop_obj_nodes(parent_obj=node_id, user_defined_only=True))
        while len(sons)!=0:
            item = sons.pop()
            offspring.add(item)
            item_sons = self.get_prop_obj_nodes(parent_obj=item, user_defined_only=True)
            offspring.update(item_sons)
            sons.update(item_sons)
            if print_nodes:
                names = self.get_prop_name_nodes(item)
                for name in names:
                    print(self.get_node_attr(name))
        return offspring

    def get_cur_window_obj(self):
        window_obj = None
        if self.thread_version:
            file_scope = self.mydata.cur_file_scope
        else:
            file_scope = self.cur_file_scope
        if self.client_side:
            if file_scope==self.bg_scope:
               window_obj = self.bg_window
            elif file_scope in self.cs_scopes:
                window_obj = self.cs_window[file_scope]
        return window_obj

    def get_cur_window_scope(self):
        if self.thread_version:
            file_scope = self.mydata.cur_file_scope
        else:
            file_scope = self.cur_file_scope
        return file_scope

    def get_parent_obj_from_property_name(self, name_node):
        parent_edges = self.get_in_edges(name_node, edge_type = "OBJ_TO_PROP")
        if parent_edges is None or len(parent_edges) == 0:
            parent_node =  None
        parent_node = parent_edges[0][0]

        return parent_node

    def debug_sink_in_graph(self, obj):
        print('debug code in graph: ', obj)
        tmp_objs = set()
        offsprings = self.get_off_spring(obj, print_nodes = True)
        tmp_objs.update(offsprings)
        tmp_objs.add(obj)
        print("sus_objs", tmp_objs)
        for obj in tmp_objs:
            print(obj)
            print(self.get_node_attr(obj))

    def get_AST_num(self, node_id):
        num = 0
        children = self.get_ordered_ast_child_nodes(node_id)
        if len(children)>0:
            for child in children:
                num += self.get_AST_num(child)
        # self add 1
        num += 1
        return num

    def get_code_cov(self):
        # print(self.get_total_num_statements())
        # print(self.get_total_num_statements() - self.get_header_num_statements())
        # print(len(self.covered_stat))
        whole_num = self.get_total_num_statements() - self.get_header_num_statements()
        if whole_num != 0:
            covered_stat_rate = 100 * len(self.covered_stat) / whole_num
        else:
            covered_stat_rate = 0
        return covered_stat_rate

    def get_all_but_header_stmt(self):
        header_stat = self.get_header_stat()
        all_stat = self.get_all_stat()
        return all_stat - header_stat


    def record_code_cov(self, code_cov):
        newline = "CODE_COV " + str(code_cov) + " " + str(time.time())
        package_id = self.package_name.split("/")[-1]
        code_cov_measure_file = self.package_name +'/opgen_generated_files/code_cov.txt'
        with open(code_cov_measure_file, "a") as f:
            f.write(newline + "\n")

    # ASToperators = [
    #                 'AST_ASSIGN': self.HandleAssign,
    #                 'AST_CALL': self.HandleASTCall,
    #                 'AST_METHOD_CALL': self.HandleASTCall,
    #                 'AST_METHOD': self.HandleMethod,
    #                 'AST_NEW': self.HandleASTCall,
    #                 'AST_CLOSURE': self.HandleFuncDecl,
    #                 'AST_UNARY_OP': self.HandleUnaryOp,
    #                 'AST_FOR': self.HandleFor,
    #                 'AST_WHILE': self.HandleWhile,
    #                 'AST_FOREACH': self.HandleForEach,
    #                 'AST_BREAK': self.HandleBreak,
    #                 'AST_EXPR_LIST': self.HandleExprList,
    #                 'AST_PRE_INC': self.HandleIncDec,
    #                 'AST_POST_INC': self.HandleIncDec,
    #                 'AST_PRE_DEC': self.HandleIncDec,
    #                 'AST_POST_DEC': self.HandleIncDec,
    #                 'AST_IF': self.HandleIf,
    #                 'AST_IF_ELEM': self.HandleIfElem,
    #                 'AST_CONDITIONAL': self.HandleConditional,
    #                 'AST_BINARY_OP': self.HandleBinaryOP,
    #                 'AST_RETURN': self.HandleReturn,
    #                 'AST_TRY': self.HandleTry,
    #                 'AST_CATCH_LIST': self.HandleCatchList,
    #                 'AST_CONTINUE': self.HandleContinue,
    #                 'AST_ASSIGN_OP': self.HandleAssignOP,
    # ]