# Pyjamas (PJs)

Run python in the browser in no time! 

Pyjamas is a thin wrapper around `pyodide`.

# Getting started

Include `pjs.js` in your HTML file.

## Create a Python terminal
```
pjs.terminal(<str: dom_id>)
```

## Execute scripts stored in multi-line strings
```
pjs.run(<str: script>)
```

It automatically installs required modules where the script contains any combination of the following:

```
# if you want to be explicit
!pip install numpy matplotlib tqdm 

# this is sufficient
import numpy 

# this also works
from matplotlib import pyplot as plt 
```

## Execute hosted script files
```
pjs.fetch_and_run(<str: script_url>)
```

## Variables access in JavaScript

```
pjs.get('<variable>');
```

```
# global variable of base type
pjs.run('x = 3');
pjs.get('x');

# object casting
pjs.run('x = np.array([0, 1])');
pjs.get('x').toJs();

# also resolves nesting
pjs.get('parent.child.child_of_child.var')
```

## Access Pyodide

```
pjs.pyodide
```

# Examples
[A python interpreter in the browser](examples/01_python_interpreter/01_python_interpreter.html)

[An interactive animation with dynamics in python](examples/02_interactive_visualisation/02_interactive_visualisation.html)

# Pyodide Cheatsheet

#### Initialization

```
pyodide = await loadPyodide(); # in javascript
```

#### Library Installation
```
await pyodide.loadPackage("matplotlib"); # in javascript
```

#### Code Execution
```
code = `
    import sys
    sys.version
`
pyodide.runPython(code); # in javascript
```



- in python, call a function `display` that renders the `_repr_()` output to a DOM element.
- the DOM element could be set in some config/ init of the module.