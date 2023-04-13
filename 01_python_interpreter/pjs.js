// wrapper around pyodide for easy interaction with python from javascript
var pjs = (function() {
    // private stuff
    
    // wrapper for dom element that displays python statements and output
    class TextOutput {
        cmd_prefix = ">>>"; //prefix for command prints
        
        constructor (dom_id=null) {
            this.dom_id = dom_id;
            this.flush = false;
        }
        // prints a message to the output DOM element
        // args:
        //   message (str): message to be printed; accepts multiple line 
        //                  separated by "\n"
        //   flush (bool):  clear output before printing the *next* message.
        //   prefix (str):  every printed row will start with this string.
        print(message, {flush = false, prefix = ""} = {}) {
            if (this.dom_id == null) {
                // default to console output
                console.log(message);
            } else {
                var output = document.getElementById(this.dom_id);
                var html = output.innerHTML;
                if (this.flush) {
                    html = ""
                }
                var lines = (message + "").split("\n");
                lines.forEach(function (line) {
                    html += prefix + line + '<br>';
                });
                output.innerHTML = html;
                this.flush = flush;
            }
        }
    };
    
    class PythonJS {
        constructor() {
            this.stdout = new TextOutput();
            //this.print = this.stdout.print;
        }
        
        print(message, params) {
            this.stdout.print(message, params);
        }
        
        // run a piece of python code; print result (default:true)
        // args:
        // script (str): python script to execute (can be multi-line string).
        run = async function(script, {print_script = false, print_result = true, flush = false, out = this.stdout} = {}) {
            if (print_script) {
                out.print(script, {prefix: ">>> "});
            }
            try {
                // separate !pip install lines from rest of code
                var lines = (script + "").split("\n");
                var modules = [];
                var py_script = "";
                lines.forEach(function(line) {
                    if (line.startsWith("!pip install")) {
                        //catch and install packages
                        var line = line.replace("!pip install ", "");
                        var words = line.split(" ");
                        modules = modules.concat(words);
                    } else {
                        py_script += line + "\n";
                    }
                });
                console.log(modules);
                for (let i in modules) {
                    await this.micropip.install(modules[i]);
                }
                // run python script
                const result = this.pyodide.runPython(py_script);
                if ((result != null) && (print_result)) {
                    out.print(result, {flush: flush});
                } else {
                    out.print("None", {flush: flush});
                }
                return result;
            } catch(err) {
                out.print(err.message, {flush: flush, prefix:'ERR:'});
            }
        }
        
        // initialise python interface
        // stdout: DOM ID of stdout
        init = async function(stdout=null) {
            this.stdout.dom_id = stdout;
            this.print("Initializing python...", {flush: true});
            this.pyodide = await loadPyodide();
            await this.pyodide.loadPackage("micropip");
            this.micropip = this.pyodide.pyimport("micropip");
            const script = `
                import sys
                sys.version
            `;
            await this.run(script);
        }
        
        terminal(dom_id) {
            var input_dom = document.createElement("textarea");
            input_dom.id = dom_id + "_input";
            input_dom.rows = 8;
            input_dom.cols = 80;
            input_dom.style.fontFamily = "monospace";
            
            var status_dom = document.createElement("div");
            status_dom.id = dom_id + "_status";
            const default_status = "<br>Press Shift+Enter to run your script.";
            status_dom.innerHTML = default_status;
            
            var output_dom = document.createElement("div");
            output_dom.id = dom_id + "_output";
            output_dom.style.fontFamily = "monospace";
            
            var output = new TextOutput(output_dom.id);
            input_dom.onkeydown = async function (event) {
                if (event.key === "Enter" && event.shiftKey) {
                    event.preventDefault();
                    status_dom.innerHTML = '<br>busy...';
                    await this.run(input_dom.value, {print_script: true, flush: true, out: output});
                    status_dom.innerHTML = default_status;
                };
            }.bind(this);
            document.getElementById(dom_id).appendChild(output_dom);
            document.getElementById(dom_id).appendChild(status_dom);
            document.getElementById(dom_id).appendChild(input_dom);
        }
    };
    
    // public
    return new PythonJS();
  })();