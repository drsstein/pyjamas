# Pyjamas

A `pyodide` wrapper for interactive server-less python in the browser.

What's there
  - a simple interactive python interpreter with `!pip install` support.
  
What's planned
  - a hello world interactive example using mousemove to control a dynamical system in python, whose state is displayed using d3.js.

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