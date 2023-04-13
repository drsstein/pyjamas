# Pyodide

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