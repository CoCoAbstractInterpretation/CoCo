import csv
result = ''

def find_node(node, nodes):
    x = [i for i in nodes if i[0]==node]
    global result 
    result += str(x) +'\n'


def main():
    global result
    nodes_file = open('nodes.csv')
    rels_file = open('rels.csv')

    rels_reader = csv.reader(rels_file, delimiter='\t')
    reaches_list = []
    for row in rels_reader: 
        # if row[2] =='OBJ_REACHES':
        if row[2] =='PARENT_SCOPE_OF':
            reaches_list.append([row[0], row[1]])
    # print(reaches_list)

    nodes = []
    nodes_reader = csv.reader(nodes_file, delimiter='\t')
    for row in nodes_reader: 
        nodes.append(row)

    for x in reaches_list:
        result += str(x) +'\n'
        find_node(x[0], nodes)
        find_node(x[1], nodes)
        result += '\n'

    with open('see_reaches.txt', 'w') as out:
        out.write(result)


main()


def see_tained():
    nodes_file = open('nodes.csv')
    nodes=[]
    nodes_reader = csv.reader(nodes_file, delimiter='\t')
    for row in nodes_reader: 
        nodes.append(row)
    print(nodes[0])
    for node in nodes:
        # pass
        if node[5]=='document_element':
            print(node[5])
        # if node[-1] == 'True':
        #     print(node)

# see_tained()




