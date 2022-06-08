from src.core.graph import Graph
G = Graph()
G.import_from_CSV('exports/nodes.csv', 'exports/rels.csv')
# G.cur_scope =
# def new_get_name_node(G:Graph, name):
#     for node in G.graph

while True:
    a = input('command:\n')
    if a=='exit':
        break
    elif a=='\n':
        continue
    elif a.startswith('att'):
        num = a.split('att')[1]
        num = num.strip()
        print(G.get_node_attr(num))
    else:
        nodes = G.get_name_node(a, scope = '5213')
        for node in nodes:
            print(node)
