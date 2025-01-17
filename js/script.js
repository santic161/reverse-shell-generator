
// Element selectors
const ipInput = document.querySelector("#ip");
const portInput = document.querySelector("#port");
const listenerSelect = document.querySelector("#listener-selection");
const fileNameDiv = document.querySelector("#fileName")
const filePathDiv = document.querySelector("#filePath")
const fileInput = document.querySelector("#fileInput")
const pathInput = document.querySelector("#filePathInput")
const shellSelect = document.querySelector("#shell");
// const secondCommandDiv = document.querySelector("#Transfer-command-2")
// const autoCopySwitch = document.querySelector("#auto-copy-switch");
const encodingSelect = document.querySelector('#encoding');
const listenerCommand = document.querySelector("#listener-command");
const reverseShellCommand = document.querySelector("#reverse-shell-command");
const bindShellCommand = document.querySelector("#bind-shell-command");
const msfVenomCommand = document.querySelector("#msfvenom-command");

const TransferCommand = document.querySelector("#Transfer-command");
const TransferCommand2 = document.querySelector("#Transfer-command-2");

const FilterType = {
    'All': 'all',
    'Windows': 'windows',
    'Linux': 'linux',
    'Mac': 'mac'
};
const UdFilterType = {
    'All': 'all',
    'Upload': 'upload',
    'Download': 'download'
}

document.querySelector("#os-options").addEventListener("change", (event) => {
    const selectedOS = event.target.value;
    rsg.setState({
        filter: [selectedOS, rsg.filter[1]],
    });
});
document.querySelector("#os-options-transfer").addEventListener("change", (event) => {
    const selectedOS = event.target.value;
    rsg.setState({
        filter: [selectedOS, rsg.filter[1]],
    });
});
document.querySelector("#options-ud-transfer").addEventListener("change", (event) => {
    const selectedUD = event.target.value;  // Selected Upload/Download
    rsg.setState({
        filter: [rsg.filter[0] ,selectedUD],
    });
});

document.querySelector("#reverse-tab").addEventListener("click", () => {
    fileNameDiv.style.display = "none"
    // filePathDiv.style.display = "none"
    rsg.setState({
        commandType: CommandType.ReverseShell,
    });
})

document.querySelector("#bind-tab").addEventListener("click", () => {
    rsg.setState({
        commandType: CommandType.BindShell,
        encoding: "None"
    });
})

document.querySelector("#bind-tab").addEventListener("click", () => {
    document.querySelector("#bind-shell-selection").innerHTML = "";
    fileNameDiv.style.display = "none"
    // filePathDiv.style.display = "none"
    rsg.setState({
        commandType: CommandType.BindShell

    });
})

document.querySelector("#msfvenom-tab").addEventListener("click", () => {
    document.querySelector("#msfvenom-selection").innerHTML = "";
    fileNameDiv.style.display = "none"
    // filePathDiv.style.display = "none"
    rsg.setState({
        commandType: CommandType.MSFVenom,
        encoding: "None"
    });
});

document.querySelector("#Transfer-tab").addEventListener("click", () => {
    document.querySelector("#Transfer-selection").innerHTML = "";
    fileNameDiv.style.display = "block"
    // filePathDiv.style.display = "block"
    rsg.setState({
        commandType: CommandType.Transfer,
        encoding: "None"
    });
});

var rawLinkButtons = document.querySelectorAll('.raw-listener');
for (const button of rawLinkButtons) {
    button.addEventListener("click", () => {
        const rawLink = RawLink.generate(rsg);
        window.location = rawLink;
    });
}

const filterCommandData = function (data, { commandType, filter }) {
    return data.filter(item => {
        
        if (!item.meta.includes(commandType)) {
            return false;
        }
        if (!filter) {
            return true;
        }

        if (filter[0] === FilterType.All && filter[1] === UdFilterType.All) {
            return true;
        }
        if (filter[0] === FilterType.All) {
            return item.meta.includes(filter[1])
        }
        if (filter[1] === UdFilterType.All) {
            return item.meta.includes(filter[0])
        }

        //Ambas partes del array tienen que retornar true, de ser asi significa que es el meta correcto
        let BoolFiltered = [item.meta.includes(filter[0]), item.meta.includes(filter[1])]
        if (BoolFiltered[0] && BoolFiltered[1]) {
            return true;
        }
        //Si no existe el meta que necesitamos devolvemos un False
        return false;
    });
}

const query = new URLSearchParams(location.hash.substring(1));

const rsg = {
    ip: query.get('ip') || localStorage.getItem('ip') || '10.10.10.10',
    fileInput: query.get('fileInput') || localStorage.getItem('fileInput') || 'id_rsa',
    pathInput: query.get('pathInput') || localStorage.getItem('pathInput') || './',
    port: query.get('port') || localStorage.getItem('port') || 9001,
    payload: query.get('payload') || localStorage.getItem('payload') || 'windows/x64/meterpreter/reverse_tcp',
    shell: query.get('shell') || localStorage.getItem('shell') || rsgData.shells[0],
    listener: query.get('listener') || localStorage.getItem('listener') || rsgData.listenerCommands[0][1],
    encoding: query.get('encoding') || localStorage.getItem('encoding') || 'None',
    selectedValues: {
        [CommandType.ReverseShell]: filterCommandData(rsgData.reverseShellCommands, { commandType: CommandType.ReverseShell })[0].name,
        [CommandType.BindShell]: filterCommandData(rsgData.reverseShellCommands, { commandType: CommandType.BindShell })[0].name,
        [CommandType.MSFVenom]: filterCommandData(rsgData.reverseShellCommands, { commandType: CommandType.MSFVenom })[0].name,
        [CommandType.Transfer]: filterCommandData(rsgData.reverseShellCommands, { commandType: CommandType.Transfer })[0].name,
    },
    commandType: CommandType.ReverseShell,
    filter: [FilterType.All, UdFilterType.All],

    uiElements: {
        [CommandType.ReverseShell]: {
            listSelection: '#reverse-shell-selection',
            command: '#reverse-shell-command'
        },
        [CommandType.BindShell]: {
            listSelection: '#bind-shell-selection',
            command: '#bind-shell-command',
        },
        [CommandType.MSFVenom]: {
            listSelection: '#msfvenom-selection',
            command: '#msfvenom-command'
        },
        [CommandType.Transfer]: {
            listSelection: '#Transfer-selection',
            command: '#Transfer-command'
        },

    },

    copyToClipboard: (text) => {
        if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(text)
            $('#clipboard-toast').toast('show')
        } else if (window?.clipboardData?.setData) {
            window.clipboardData.setData('Text', text);
            $('#clipboard-toast').toast('show')
        } else {
            $('#clipboard-failure-toast').toast('show')
        }
    },

    escapeHTML: (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),

    getIP: () => rsg.ip,

    getPort: () => Number(rsg.port),

    getShell: () => rsg.shell,

    getFileName: () => rsg.fileInput,

    getFilePath: () => rsg.pathInput,

    getEncoding: () => rsg.encoding,

    getSelectedCommandName: () => {
        return rsg.selectedValues[rsg.commandType];
    },

    getReverseShellCommand: () => {
        const reverseShellData = rsgData.reverseShellCommands.find((item) => item.name === rsg.getSelectedCommandName());
        return reverseShellData.command;
    },

    getPayload: () => {
        if (rsg.commandType === 'MSFVenom') {
            let cmd = rsg.getReverseShellCommand();
            // msfvenom -p windows/x64/meterpreter_reverse_tcp ...
            let regex = /\s+-p\s+(?<payload>[a-zA-Z0-9/_]+)/;
            let match = regex.exec(cmd);
            if (match) {
                return match.groups.payload;
            }
        }

        return 'windows/x64/meterpreter/reverse_tcp'

    },

    generateReverseShellCommand: () => {
        let command

        if (rsg.getSelectedCommandName() === 'PowerShell #3 (Base64)') {
            const encoder = (text) => text;
            const payload = rsg.insertParameters(rsgData.specialCommands['PowerShell payload'], encoder)
            command = "powershell -e " + btoa(toBinary(payload))
            function toBinary(string) {
                const codeUnits = new Uint16Array(string.length);
                for (let i = 0; i < codeUnits.length; i++) {
                    codeUnits[i] = string.charCodeAt(i);
                }
                const charCodes = new Uint8Array(codeUnits.buffer);
                let result = '';
                for (let i = 0; i < charCodes.byteLength; i++) {
                    result += String.fromCharCode(charCodes[i]);
                }
                return result;
            }
        } else {
            command = rsg.getReverseShellCommand()
        }

        const encoding = rsg.getEncoding();
        if (encoding === 'Base64') {
            command = rsg.insertParameters(command, (text) => text)
            command = btoa(command)
        } else {
            function encoder(string) {
                return (encoding === 'encodeURI' || encoding === 'encodeURIComponent') ? window[
                    encoding](string) : string
            }

            command = rsg.escapeHTML(command);
            command = rsg.insertParameters(
                rsg.highlightParameters(
                    encoder(command), encoder),
                encoder
            )
        }

        return command;
    },

    highlightParameters: (text, encoder) => {
        const parameters = ['{ip}', '{port}', '{shell}', '{filePath}', '{fileName}', encodeURI('{ip}'), encodeURI('{port}'),
            encodeURI('{shell}'), encodeURI('{filePath}'), encodeURI('{fileName}')];

        parameters.forEach((param) => {
            if (encoder) param = encoder(param)
            text = text.replaceAll(param, `<span class="highlighted-parameter">${param}</span>`)
        })
        return text
    },

    init: () => {
        rsg.initListenerSelection()
        rsg.initShells()
    },

    initListenerSelection: () => {
        rsgData.listenerCommands.forEach((listenerData, i) => {
            const type = listenerData[0];
            const command = listenerData[1];

            const option = document.createElement("option");

            option.value = command;
            option.selected = rsg.listener === option.value;
            option.classList.add("listener-option");
            option.innerText = type;

            listenerSelect.appendChild(option);
        })
    },

    initShells: () => {
        rsgData.shells.forEach((shell, i) => {
            const option = document.createElement("option");
            option.selected = rsg.shell === shell;
            option.classList.add("shell-option");
            option.innerText = shell;

            shellSelect.appendChild(option);
        })
    },

    // Updates the rsg state, and forces a re-render
    setState: (newState = {}) => {
        Object.keys(newState).forEach((key) => {
            const value = newState[key];
            rsg[key] = value;
            localStorage.setItem(key, value)
        });
        Object.assign(rsg, newState);

        rsg.update();
    },

    insertParameters: (command, encoder) => {
        return command
            .replaceAll(encoder('{ip}'), encoder(rsg.getIP()))
            .replaceAll(encoder('{port}'), encoder(String(rsg.getPort())))
            .replaceAll(encoder('{shell}'), encoder(rsg.getShell()))
            .replaceAll(encoder('{fileName}'), encoder(rsg.getFileName()))
            .replaceAll(encoder('{filePath}'), encoder(rsg.getFilePath()))
    },

    update: () => {
        rsg.updateListenerCommand()
        rsg.updateTabList()
        rsg.updateReverseShellCommand()
        rsg.updateValues()
    },

    updateValues: () => {
        const listenerOptions = listenerSelect.querySelectorAll(".listener-option");
        listenerOptions.forEach((option) => {
            option.selected = rsg.listener === option.value;
        });

        const shellOptions = shellSelect.querySelectorAll(".shell-option");
        shellOptions.forEach((option) => {
            option.selected = rsg.shell === option.value;
        });

        const encodingOptions = encodingSelect.querySelectorAll("option");
        encodingOptions.forEach((option) => {
            option.selected = rsg.encoding === option.value;
        });

        ipInput.value = rsg.ip;
        portInput.value = rsg.port;
    },

    updateTabList: () => {
        const data = rsgData.reverseShellCommands;
        const filteredItems = filterCommandData(
            data,
            {
                filter: rsg.filter,
                commandType: rsg.commandType
            }
        );

        const documentFragment = document.createDocumentFragment()
        filteredItems.forEach((item, index) => {
            const {
                name,
                command
            } = item;
            // if(command){
            //     if(command.includes("{separar}")) {
            //         secondCommandDiv.style.display = "block"
            //         command.replaceAll("{separar}", "")
            //     }
            // }
            const selectionButton = document.createElement("button");

            if (rsg.getSelectedCommandName() === item.name) {
                selectionButton.classList.add("active");
            }

            const clickEvent = () => {
                rsg.selectedValues[rsg.commandType] = name;
                rsg.update();

                // if (document.querySelector('#auto-copy-switch').checked) {
                //     rsg.copyToClipboard(reverseShellCommand.innerText)
                // }
            }

            selectionButton.innerText = name;
            selectionButton.classList.add("list-group-item", "list-group-item-action");
            selectionButton.addEventListener("click", clickEvent);

            documentFragment.appendChild(selectionButton);
        })

        const listSelectionSelector = rsg.uiElements[rsg.commandType].listSelection;
        document.querySelector(listSelectionSelector).replaceChildren(documentFragment)
    },

    updateListenerCommand: () => {
        const privilegeWarning = document.querySelector("#port-privileges-warning");
        let command = listenerSelect.value;
        command = rsg.highlightParameters(command)
        command = command.replace('{port}', rsg.getPort())
        command = command.replace('{ip}', rsg.getIP())
        command = command.replace('{payload}', rsg.getPayload())
        command = command.replace('{filePath}', rsg.getFilePath())
        command = command.replace('{fileName}', rsg.getFileName())
        if (rsg.getPort() < 1024) {
            privilegeWarning.style.visibility = "visible";
            command = `<span class="highlighted-warning">sudo</span> ${command}`
        } else {
            privilegeWarning.style.visibility = "hidden";
        }

        listenerCommand.innerHTML = command;
    },

    updateReverseShellSelection: () => {
        document.querySelector(".list-group-item.active")?.classList.remove("active");
        const elements = Array.from(document.querySelectorAll(".list-group-item"));
        const selectedElement = elements.find((item) => item.innerText === rsg.currentCommandName);
        selectedElement?.classList.add("active");
    },

    updateReverseShellCommand: () => {
        const command = rsg.generateReverseShellCommand();
        const commandSelector = rsg.uiElements[rsg.commandType].command;
        document.querySelector(commandSelector).innerHTML = command;
    },

    updateSwitchStates: () => {
        $('#listener-advanced').collapse($('#listener-advanced-switch').prop('checked') ? 'show' :
            'hide')
        $('#revshell-advanced').collapse($('#revshell-advanced-switch').prop('checked') ? 'show' :
            'hide')
    }
}

/*
    * Init
    */
rsg.init();
rsg.update();

/*
    * Event handlers/functions
    */
ipInput.addEventListener("input", (e) => {
    rsg.setState({
        ip: e.target.value
    })
});

portInput.addEventListener("input", (e) => {
    rsg.setState({
        port: Number(e.target.value)
    })
});

fileInput.addEventListener("input", (e) => {
    rsg.setState({
        fileInput: String(e.target.value)
    })
});
// pathInput.addEventListener("input", (e) => {
//     rsg.setState({
//         pathInput: String(e.target.value)
//     })
// });

listenerSelect.addEventListener("change", (e) => {
    rsg.setState({
        listener: e.target.value
    })
});

shellSelect.addEventListener("change", (e) => {
    rsg.setState({
        shell: e.target.value
    })
});

encodingSelect.addEventListener("change", (e) => {
    rsg.setState({
        encoding: e.target.value
    })
});

document.querySelector('#inc-port').addEventListener('click', () => {
    rsg.setState({
        port: rsg.getPort() + 1
    })
})

document.querySelector('#listener-advanced-switch').addEventListener('change', rsg.updateSwitchStates);
document.querySelector('#revshell-advanced-switch').addEventListener('change', rsg.updateSwitchStates);

setInterval(rsg.updateSwitchStates, 500) // fix switch changes in rapid succession

document.querySelector('#copy-listener').addEventListener('click', () => {
    rsg.copyToClipboard(listenerCommand.innerText)
})

document.querySelector('#copy-reverse-shell-command').addEventListener('click', () => {
    rsg.copyToClipboard(reverseShellCommand.innerText)
})

document.querySelector('#copy-bind-shell-command').addEventListener('click', () => {
    rsg.copyToClipboard(bindShellCommand.innerText)
})

document.querySelector('#copy-msfvenom-command').addEventListener('click', () => {
    rsg.copyToClipboard(msfVenomCommand.innerText)
})
document.querySelector('#copy-Transfer-command').addEventListener('click', () => {
    rsg.copyToClipboard(TransferCommand.innerText)
})
// document.querySelector('#copy-Transfer-command-2').addEventListener('click', () => {
//     rsg.copyToClipboard(TransferCommand2.innerText)
// })

var downloadButton = document.querySelectorAll(".download-svg");
for (const Dbutton of downloadButton) {
    Dbutton.addEventListener("click", () => {
        var element = document.createElement('a');
        const rawLink = RawLink.generate(rsg);
        element.setAttribute('href', rawLink);
        element.setAttribute('download', rsg.getSelectedCommandName());
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    });
}

// autoCopySwitch.addEventListener("change", () => {
//     setLocalStorage(autoCopySwitch, "auto-copy", "checked");
// });

// Popper tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});

// TODO: add a random fifo for netcat mkfifo
//let randomId = Math.random().toString(36).substring(2, 4);
