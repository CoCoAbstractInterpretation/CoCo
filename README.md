CoCo
=======

CoCo is a tool that utilizes Coverage-guided,
Concurrent Abstract Interpretation to analyze JavaScript code, specifically, browser extension code, to find vulnerabilities.

## Installation
CoCo requires Python 3.7+ and Node.js 12+. To set up the environment, simply
run `install.sh`.

## Command line arguments
Use the following arugments to run the tool:

```bash
./single_run.sh [input_file] [-pq] [-thread_stmt]
```

| Argument | Description |
| -------- | ----------- |
| `input_file` | The extension file. |
|  `-pq` | Run CoCo concurrent version |
| `-thread_stmt` | Run CoCo with sequential timeout |

## Examples
We provide some examples in the `demos/` directory. To run, simply:
```shell
$ ./single_run.sh demos/exec_code
```
To run with concurrent version:
```shell
$ ./single_run.sh demos/exec_code -pq
```
Or add any arguments you like.

You can try edit your own code to test, just modify the content in `demos/test` and
```shell
$ ./single_run.sh demos/test
```

## Results
Results are stored in `extension_dir/opgen_generated_files/res.txt`

