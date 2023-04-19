// wrapper around pyodide for easy interaction with python from javascript
var console = {log: console.log,
               warn: console.warn,
               error: console.error};

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
        print(message, {flush = false, prefix = "", is_error = false} = {}) {
            if (this.dom_id == null) {
                // default to console output
                console.log(message);
            } else {
                var output = document.getElementById(this.dom_id);
                var html = output.innerHTML;
                if (this.flush) {
                    html = ""
                }
                var new_html = "";
                var lines = (message + "").split("\n");
                lines.forEach(function (line) {
                    new_html += prefix + line + '<br>';
                });
                if (is_error) {
                    new_html = "<span style='color:red;'>" + new_html + "</span>";
                }
                output.innerHTML = html + new_html;
                output.scrollTo(0, output.scrollHeight);
                this.flush = flush;
            }
        }
        
        // return callback print function with proper object binding
        get_callback(options) {
            return function(message){
                return this.print(message, options);
            }.bind(this);
        }
        
        make_console(options) {
            console.log = this.get_callback(options);
        }
    };
    
    class PythonJS {
        constructor() {
            this.stdout = new TextOutput();
            //this.print = this.stdout.print;
        }
        
        // run a piece of python code; print result (default:true)
        // args:
        // script (str): python script to execute (can be multi-line string).
        // out (TextOutput): script and result output target.
        // auto_install (bool): install all modules found in import statements.
        run = async function(script, {print_script = false, 
                                      print_result = false, 
                                      flush = false, 
                                      out = this.stdout,
                                      auto_install = true} = {}) {
            if (print_script) {
                console.log(script, {prefix: ">>> "});
            }
            try {
                // parse script for "!pip install" and import statements
                var lines = (script + "").split("\n");
                var pip_installs = [];
                var imports = [];
                var py_script = "";
                const regex_pip = /\t*!pip install/;
                const regex_from = /\t*from/
                const regex_import = /\t*import/;
                lines.forEach(function(line) {
                    if (regex_pip.test(line)) {
                        //catch and install packages
                        var line = line.split("!pip install")[1];
                        var words = line.split(/, \t/);
                        pip_installs = pip_installs.concat(words);
                    } else if (regex_from.test(line)) {
                        var rest = line.split("from ")[1];
                        var module = rest.split(/[\s. \t]+/)[0];
                        imports.push(module);
                        py_script += line + "\n";
                    } else if (regex_import.test(line)) {
                        var rest = line.split("import ")[1];
                        var module = rest.split(/[\s. \t]+/)[0];
                        imports.push(module);
                        py_script += line + "\n";
                    } else {
                        py_script += line + "\n";
                    }
                });
                // install modules
                if (auto_install) {
                    pip_installs = pip_installs.concat(imports);
                }
                if (pip_installs.length > 0) {
                    await this.micropip.install(pip_installs);
                    console.log("--- installation complete ---");
                }

                // run python script
                const result = await this.pyodide.runPython(py_script);
                if (print_result) {
                    console.log(result, {flush: flush});
                }
                return result;
            } catch(err) {
                console.log(err.message, {flush: flush, is_error:true});
            }
        }
        
        // initialise python interface
        // stdout: DOM ID of stdout
        init = async function(stdout=null) {
            this.stdout.dom_id = stdout;
            this.stdout.make_console({prefix: "<python>"});
            console.log("Initializing python...", {flush: true});
            this.pyodide = await loadPyodide();
            await this.pyodide.loadPackage("micropip", {messageCallback: this.stdout.get_callback()});
            this.micropip = this.pyodide.pyimport("micropip");
            const default_script = `
                import sys
                sys.version
            `;
            await this.run(default_script, {auto_install:false, print_result: true});
        }
        
        get = function(var_name) {
            // split variable by '.' and do recursive access
            const objects = var_name.split(".");
            var output = this.pyodide.globals.get(objects[0]);
            for (let i=1; i < objects.length; i++) {
                output = output[objects[i]];
            }
            return output;
        }
        
        terminal(dom_id) {
            // input text area
            var input_dom = document.createElement("textarea");
            input_dom.id = dom_id + "_input";
            input_dom.rows = 8;
            input_dom.cols = 80;
            input_dom.style.fontFamily = "monospace";
            
            // status line
            var status_dom = document.createElement("span");
            status_dom.id = dom_id + "_status";
            const default_status = " or (Shift+Enter) to run your script.<br>";
            status_dom.innerHTML = default_status;
            
            // output area
            var output_dom = document.createElement("p");
            output_dom.id = dom_id + "_output";
            output_dom.style.fontFamily = "monospace";
            
            // load script button
            var file_dom = document.createElement("input");
            file_dom.type = "file";
            file_dom.onchange = function() {
                if (this.files && this.files[0]) {
                    var file = this.files[0];
                    var reader = new FileReader();
                    reader.addEventListener('load', function (event) {
                      input_dom.textContent = event.target.result;
                    });
                    reader.readAsBinaryString(file);
                }   
            };
            
            // output object
            var output = new TextOutput(output_dom.id);
            
            async function runScript() {
                status_dom.innerHTML = 'busy...<br>';
                output.make_console({flush:true});
                await this.run(input_dom.value, {print_script: false, print_result:true, flush: true, out: output});
                this.stdout.make_console();
                status_dom.innerHTML = default_status;
            }
            
            input_dom.onkeydown = function (event) {
                if (event.key === "Enter" && event.shiftKey) {
                    event.preventDefault();
                    runScript.bind(this)();
                };
            }.bind(this);
            
            // run button
            var run_dom = document.createElement("buttoN");
            run_dom.onclick = runScript.bind(this);
            run_dom.appendChild(document.createTextNode("Run"));
            
            document.getElementById(dom_id).appendChild(file_dom);
            document.getElementById(dom_id).appendChild(document.createElement("br"));
            document.getElementById(dom_id).appendChild(input_dom);
            document.getElementById(dom_id).appendChild(document.createElement("br"));
            document.getElementById(dom_id).appendChild(run_dom);
            document.getElementById(dom_id).appendChild(status_dom);
            document.getElementById(dom_id).appendChild(output_dom);
        }
    };
    
    // public
    return new PythonJS();
  })();