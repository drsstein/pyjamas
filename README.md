# Pyjamas (PJs)

Run python in the browser in no time! 

Pyjamas is a thin wrapper around `pyodide`.

# Getting started

Include `pjs.js` in your HTML file.

## Python Terminal

```
pjs.terminal(<DOM element id>)
```

## Script Execution

Write/ load your python script into a multi-line string.

```
pjs.run(<script string>)
```
Automatically installs required modules where the script contains any combination of the following:

```
# if you want to be explicit
!pip install numpy matplotlib tqdm 

# this is sufficient
import numpy 

# this also works
from matplotlib import pyplot as plt 
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
[Interactive animation](examples/02_interactive_visualisation/02_interactive_visualisation.html)

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