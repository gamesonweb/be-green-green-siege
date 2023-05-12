import data from '../assets/dialog.json';

class Dialog {
    private _dialog: any;
    private _lang: string;

    constructor() {
        this._lang = 'fr';
        this._dialog = data.fr;
    }

    public changeLang(): void {
        if (this._lang === 'en') {
            this._lang = 'fr';
            this._dialog = data.fr;
        } else {
            this._lang = 'en';
            this._dialog = data.en;
        }
    }

    public getLang(): string {
        return this._lang;
    }

    public get(key: string): string {
        return this._dialog.collection[key];
    }

    public getTuto(tuto: string): string {
        return this._dialog[tuto];
    }
}
const dialog = new Dialog();
export default dialog;
