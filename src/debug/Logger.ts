
const console = document.getElementById("debugConsole") as HTMLDivElement;
const maxhistory = 100;

let currentHistory = 0;

export default class Logger {

    static log(message: string) {
        let entry = document.createElement("div");
        entry.className = "consoleEntry";
        let date = new Date();
        entry.innerHTML = "["+ date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()+ "]" + " - " + message;

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

