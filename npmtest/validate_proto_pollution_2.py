#!/usr/bin/env python3
import re
import subprocess
import os
from subprocess import TimeoutExpired

checked = 0
success = 0
failed = 0
for line in open('npmsuccess.log').readlines():
    checked += 1
    # if checked < 367:
    #     continue
    match = re.match(r'^(.*) successfully found in (.*)$', line)
    if match:
        path = match.group(2)
        print(path)
        if not os.path.exists(f"{path}/node_modules"):
            print('Installing dependency modules')
            os.system(f'cd "{path}" && sudo npm install > /dev/null 2>&1')
        successful = False
        proc = subprocess.Popen(['node', '../../../projs/prototype-pollution-nsec18/find-vuln/find-vuln.js', path], text=True,
            stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            stderr=subprocess.PIPE)
        try:
            stdout, stderr = proc.communicate(timeout=10)
            print(stdout)
            # print(stderr)
        except TimeoutExpired as e:
            print(e)
        if len(stderr) > 0:
            pass
            # print('An error occurred, failed.')
        else:
            output_match = re.search(r'^Detected : .*$', stdout, flags=re.MULTILINE)
            if output_match:
                success += 1
                successful = True
        if not successful:
            failed += 1
        print(f'{checked} checked, {success} success, {failed} failed')