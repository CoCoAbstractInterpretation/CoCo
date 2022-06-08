# for nodes only keep the AST nodes
with open("./nodes.csv", 'r') as fp:
    nodes = []
    for line in fp.readlines():
        elems = line.split("\t")
        if len(nodes) == 0 or elems[1] == 'AST':
            nodes.append(line)

with open("./fuzzing_nodes.csv", 'w') as fp:
    fp.write(''.join(nodes))

# for edges only keep the OBJ REACHES
with open("./rels.csv", 'r') as fp:
    df = set()
    cf = set()
    ast = set()
    for line in fp.readlines():
        elems = line.split("\t")
        if elems[2] == 'OBJ_REACHES':
            df.add(line)
        elif elems[2] == 'FLOWS_TO':
            cf.add(line)
        elif elems[2] == 'PARENT_OF':
            ast.add(line)

with open("./fuzzing_cfast.csv", 'w') as fp:
    fp.write(''.join(ast))
    fp.write(''.join(cf))

with open("./fuzzing_df.csv", 'w') as fp:
    fp.write(''.join(df))
