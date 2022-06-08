# img_viewer.py

import PySimpleGUI as sg
import os
import subprocess
import threading
import sys
from src.core.options import options
from src.core.opgen import OPGen

sg.theme('LightBrown12')
# remove the result tmp log 
# First the window layout in 2 columns
vul_type_list = [
        'os_command',
        'path_traversal',
        'proto_pollution'
        ]

file_list_column = [
    [
        sg.Text("Package Path"),
        sg.In(size=(50, 1), enable_events=True, key="-FOLDER-"),
        sg.FileBrowse(),
    ],
    [
        sg.Text("Vul Type: "),
        sg.Radio('os command', 'vul_type', key='os_command'),
        sg.Radio('path traversal', 'vul_type', key='path_traversal'),
        sg.Radio('prototype pollution', 'vul_type', key='proto_pollution')
    ],
    [
        sg.Text("Options: "),
        sg.Checkbox('module', key='option_module'),
        sg.Checkbox('gc', key='option_gc'),
        sg.Button('start', key='-START-'),
    ],
    [sg.HorizontalSeparator()],[sg.Text("Results: "), sg.Button('clear', key='-CLEAR-')],
    [
        sg.Multiline(size=(None, 30), key='result_box', font=("Helvetica", 20))
    ]
]

# For now will only show the name of the file that was chosen
image_viewer_column = [
    [sg.Text("Realtime log: ")],
    [
        sg.Output(size=(None, 40), font=("Helvetica", 12))
    ],
]

# ----- Full layout -----
layout = [
    [
        sg.Column(file_list_column),
        sg.VSeperator(),
        sg.Column(image_viewer_column),
    ]
]

window = sg.Window("OPGen", layout, resizable=True, font='Courier 12')
OPGen_command = "python generate_opg.py -m -t"
vul_type = None
output = []

def run_cmd(cmd, window):
    """
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output = ''
    for line in p.stdout:
        line = line.decode(encoding=sys.stdout.encoding,
                                    errors='replace' if (sys.version_info) < (3, 5)
                                    else 'backslashreplace').rstrip()
        log.info(line)
        output += line

    """
    process = subprocess.run(cmd, stderr=sys.stderr, stdout=sys.stdout, shell=True)

def show_results(window):
    """
    show the results from results.log to the window 
    """
    result_text = None
    try:
        with open("./results_tmp.log", 'r') as fp:
            result_text = fp.read()
        window['result_box'].update(result_text, text_color_for_value='Green')
    except Exception as e:
        window['result_box'].update('')
        print(e)


# Run the Event Loop
while True:
    event, values = window.read()
    if event == "Exit" or event == sg.WIN_CLOSED:
        break
    # Folder name was filled in, make a list of files in the folder
    if event == "-FOLDER-":
        folder = values["-FOLDER-"]
        try:
            # Get list of files in folder
            file_list = os.listdir(folder)
        except:
            file_list = []

        fnames = [
            f
            for f in file_list
        ]
    elif event == '-START-':
        for vul in vul_type_list:
            if vul in values and values[vul]:
                options.vul_type = vul
        options.module = values['option_module'] 
        options.gc = values['option_gc']
        options.input_file = folder

        opg = OPGen()
        try:
            opg.run()
        except Exception as e:
            print(e)

        show_results(window)
    elif event == '-CLEAR-':
        try:
            with open("./results_tmp.log", 'w') as fp:
                fp.write("")
        except Exception as e:
            print(e)

        show_results(window)


window.close()
