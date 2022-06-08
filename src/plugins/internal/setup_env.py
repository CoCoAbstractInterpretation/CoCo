from . import modeled_js_builtins, modeled_extension_builtins
import sty
from itertools import chain

def setup_opg(G):
    """
    setup a opg graph, including build related global values, 
    setup scopes, add build-in functions etc.

    Args:
        graph (Graph): the OPG itself
    """

    G.export_node = True
    # base scope is not related to any file
    G.BASE_SCOPE = G.add_scope("BASE_SCOPE", scope_name='Base')

    # if not G.client_side:
    G.BASE_OBJ = G.add_obj_to_scope(name='global',
                        scope=G.BASE_SCOPE, combined=False)
    if G.thread_version:
        G.mydata.cur_objs = [G.BASE_OBJ]
    else:
        G.cur_objs = [G.BASE_OBJ]
    # else:
    #    #  we will setup window objects when we run files
    #    pass

    # setup JavaScript built-in values
    G.null_obj = G.add_obj_to_scope(name='null', value='null',
                                          scope=G.BASE_SCOPE)

    G.true_obj = G.add_obj_node(None, 'boolean', 'true')
    G.add_obj_to_name('true', scope=G.BASE_SCOPE,
                         tobe_added_obj=G.true_obj)
    G.false_obj = G.add_obj_node(None, 'boolean', 'false')
    G.add_obj_to_name('false', scope=G.BASE_SCOPE,
                         tobe_added_obj=G.false_obj)

    G.export_node = False
    modeled_js_builtins.setup_js_builtins(G)
    G.export_node = True

    # setup JavaScript built-in values
    G.undefined_obj = G.add_obj_node(None, 'undefined',
                                            value='undefined')
    G.add_obj_to_name('undefined', scope=G.BASE_SCOPE,
                         tobe_added_obj=G.undefined_obj)
    G.infinity_obj = G.add_obj_node(None, 'number', 'Infinity')
    G.add_obj_to_name('Infinity', scope=G.BASE_SCOPE,
                         tobe_added_obj=G.infinity_obj)
    G.negative_infinity_obj = G.add_obj_node(None, 'number',
                                                   '-Infinity')
    G.nan_obj = G.add_obj_node(None, 'number', float('nan'))
    G.add_obj_to_name('NaN', scope=G.BASE_SCOPE,
                         tobe_added_obj=G.nan_obj)

    modeled_extension_builtins.setup_extension_builtins(G)

    G.internal_objs = {
        'undefined': G.undefined_obj,
        'null': G.null_obj,
        # 'global': G.BASE_OBJ,
        'infinity': G.infinity_obj,
        '-infinity': G.negative_infinity_obj,
        'NaN': G.nan_obj,
        'true': G.true_obj,
        'false': G.false_obj
    }
    if not G.client_side:
        G.internal_objs['global'] =  G.BASE_OBJ


    G.inv_internal_objs = {v: k for k, v in G.internal_objs.items()}
    G.logger.debug(sty.ef.inverse + 'Internal objects\n' +
        str(G.internal_objs)[1:-1] + sty.rs.all)

    G.builtin_prototypes = [
        G.object_prototype, G.string_prototype,
        G.array_prototype, G.function_prototype,
        G.number_prototype, G.boolean_prototype, G.regexp_prototype
    ]
    G.pollutable_objs = set(chain(*
        [G.get_prop_obj_nodes(p) for p in G.builtin_prototypes]))
    G.pollutable_name_nodes = set(chain(*
        [G.get_prop_name_nodes(p) for p in G.builtin_prototypes]))

def setup_opg_window(G, window_scope, window_obj):
    """
    setup a opg graph, including build related global values,
    setup scopes, add build-in functions etc.

    Args:
        graph (Graph): the OPG itself
    """

    # base scope is not related to any file

    if not G.client_side:
        if G.thread_version:
            G.mydata.cur_objs = [window_obj]
        else:
            G.cur_objs = [window_obj]
    else:
       pass

    # add_obj_to_scope(self, name=None, ast_node=None, js_type='object',
    #                  value=None, scope=None, tobe_added_obj=None, combined=True)
    """
    # setup JavaScript built-in values
    # 1
    new_null_obj = G.add_obj_to_scope(name='null', value='null', scope=window_scope)
    G.null_obj.append(new_null_obj)
    G.internal_objs_list.append(new_null_obj)
    # 2
    new_true_obj = G.add_obj_node(None, 'boolean', 'true')
    G.add_obj_to_name('true', scope=window_scope, tobe_added_obj=new_true_obj)
    G.true_obj.append(new_true_obj)
    G.internal_objs_list.append(new_true_obj)
    # 3
    new_false_obj = G.add_obj_node(None, 'boolean', 'false')
    G.add_obj_to_name('false', scope=window_scope, tobe_added_obj=new_false_obj)
    G.false_obj.append(new_false_obj)
    G.internal_objs_list.append(new_false_obj)

    G.export_node = False
    modeled_js_builtins.setup_js_builtins(G)
    G.export_node = True

    # setup JavaScript built-in values
    # 4
    new_undefined_obj = G.add_obj_node(None, 'undefined', value='undefined')
    G.add_obj_to_name('undefined', scope=window_scope, tobe_added_obj=new_undefined_obj)
    G.undefined_obj.append(new_undefined_obj)
    G.internal_objs_list.append(new_undefined_obj)
    # 5
    new_infinity_obj = G.add_obj_node(None, 'number', 'Infinity')
    G.add_obj_to_name('Infinity', scope=window_scope,tobe_added_obj=new_infinity_obj)
    G.infinity_obj.append(new_infinity_obj)
    G.internal_objs_list.append(new_infinity_obj)
    # 6
    new_negative_infinity_obj = G.add_obj_node(None, 'number','-Infinity')
    G.negative_infinity_obj.append(new_negative_infinity_obj)
    G.internal_objs_list.append(new_negative_infinity_obj)
    # 7
    new_nan_obj = G.add_obj_node(None, 'number', float('nan'))
    G.add_obj_to_name('NaN', scope=window_scope, tobe_added_obj=new_nan_obj)
    G.nan_obj.append(new_nan_obj)
    G.internal_objs_list.append(new_nan_obj)

    modeled_extension_builtins.setup_extension_builtins(G)

    G.internal_objs = {
        'undefined': G.undefined_obj,
        'null': G.null_obj,
        'infinity': G.infinity_obj,
        '-infinity': G.negative_infinity_obj,
        'NaN': G.nan_obj,
        'true': G.true_obj,
        'false': G.false_obj
    }
    internal_objs = [G.internal_objs[i] for i in G.internal_objs]
    G.internal_objs_list.extend(internal_objs)

    G.builtin_prototypes = [
        G.object_prototype, G.string_prototype,
        G.array_prototype, G.function_prototype,
        G.number_prototype, G.boolean_prototype, G.regexp_prototype
    ]
    G.pollutable_objs = set(chain(*
        [G.get_prop_obj_nodes(p) for p in G.builtin_prototypes]))
    G.pollutable_name_nodes = set(chain(*
        [G.get_prop_name_nodes(p) for p in G.builtin_prototypes]))

    """