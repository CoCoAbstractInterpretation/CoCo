signature_lists = {
        'os_command': [
            'eval',
            "sink_hqbpillvul_execFile",
            'sink_hqbpillvul_exec',
            'sink_hqbpillvul_execSync',
            'sink_hqbpillvul_spawn',
            'sink_hqbpillvul_spawnSync',
            'sink_hqbpillvul_db'
            ],
        'xss': [
            'sink_hqbpillvul_http_write',
            'sink_hqbpillvul_http_setHeader'
            ],
        'proto_pollution': [
            'merge', 'extend', 'clone', 'parse'
            ],
        'code_exec': [
            'Function',
            'eval',
            "sink_hqbpillvul_execFile",
            'sink_hqbpillvul_exec',
            'sink_hqbpillvul_execSync',
            'sink_hqbpillvul_eval'
            ],
        'sanitation': [
            'parseInt'
            ],
        'path_traversal': [
            'pipe',
            'sink_hqbpillvul_http_write',
            'sink_hqbpillvul_http_sendFile',
            ],
        'depd': [
            'sink_hqbpillvul_pp',
            'sink_hqbpillvul_code_execution',
            'sink_hqbpillvul_exec'
            ],
        'chrome_data_exfiltration':[
            'postMessage'
        ],
        'chrome_API_execution':[
            'postMessage'
        ]
}

external_source_var_name = [
    'bg_chrome_runtime_MessageExternal_src'
]

crx_source_var_name = ['topSites_source',
                       'cookie_source',
                       'cookies_source',
                       'CookieStores_source',
                       'storage_sync_get_source',
                       'storage_local_get_source',
                       'HistoryItem_source',
                       'VisitItem_source',
                       'DownloadItem_source',
                       'iconURL_source',
                       'BookmarkTreeNode_source',
                        'jQuery_get_source',
                        'jQuery_post_source',
                       'jQuery_ajax_result_source',
                       'XMLHttpRequest_responseText_source',
                       'XMLHttpRequest_responseXML_source'
                       ]


crx_sink = [
        # jQuery sinks
        'jQuery_get_url_sink',
        'jQuery_post_data_sink',
        'jQuery_post_url_sink',
        'jQuery_ajax_url_sink',
        # XMLHttpRequest sinks
        'XMLHttpRequest_url_sink',
        'XMLHttpRequest_post_sink',
        # crx sinks
        'chrome_tabs_executeScript_sink',
        'chrome_tabs_create_sink',
        'chrome_tabs_update_sink',
        'chrome_cookies_set_sink',
        'chrome_cookies_remove_sink',
        'chrome_storage_sync_set_sink',
        'chrome_storage_sync_remove_sink',
        'chrome_storage_sync_clear_sink',
        'chrome_storage_local_set_sink',
        'chrome_storage_local_remove_sink',
        'chrome_storage_local_clear_sink',
        'chrome_history_addUrl_sink',
        'chrome_history_deleteUrl_sink',
        'chrome_history_deleteRange_sink',
        'chrome_history_deleteAll_sink',
        'chrome_downloads_download_sink', # added
        'chrome_downloads_pause_sink',
        'chrome_downloads_resume_sink',
        'chrome_downloads_cancel_sink',
        'chrome_downloads_open_sink',
        'chrome_downloads_show_sink',
        'chrome_downloads_showDefaultFolder_sink',
        'chrome_downloads_erase_sink',
        'chrome_downloads_removeFile_sink',
        'chrome_downloads_setShelfEnabled_sink',
        'chrome_downloads_acceptDanger_sink',
        'chrome_downloads_setShelfEnabled_sink',
        'eval'
]

ctrl_sink = [
        'chrome_browsingData_remove_sink',
        'chrome_storage_local_clear_sink',
        'chrome_storage_sync_clear_sink'
]

# change to sink_function
# user_sink = [
#     # to document
#     'JQ_obj_val_sink',
#     'JQ_obj_html_sink',
#     # to window
#     'window_postMessage_sink',
#     'sendResponseExternal_sink'
# ]



def get_all_sign_list():
    """
    return a list of all the signature functions
    """
    res = []
    for key in signature_lists:
        res += signature_lists[key]

    return res

