
const console = document.getElementById("debugConsole") as HTMLDivElement;
const maxhistory = 24;

let currentHistory = 0;

export default class Logger {

    static log(message: string) {
        let entry = document.createElement("div");
        entry.className = "consoleEntry";
        entry.innerHTML = message;

        if (currentHistory === 0) {
            console.appendChild(entry);
        }
        else if (currentHistory >= maxhistory) {
            console.removeChild(console.lastChild);
            console.insertBefore(entry, console.firstChild);
        }
        else {
           console.insertBefore(entry, console.firstChild);
        }
        currentHistory++;

    }

}

