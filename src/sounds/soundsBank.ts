export class SoundsBank {

    // ROOT
    private static readonly ROOT = "/assets/sound/";

    // Enemy sounds
    private static readonly PATH_ENEMY_BIP_BIP = this.ROOT + "bip_bip_bip.mp3";
    private static readonly PATH_ENEMY_EXPLOSION = this.ROOT + "explosion.mp3";
    private static readonly PATH_GUN_SHOOT = this.ROOT + "shoot.mp3";
    private static readonly PATH_GUN_RELOAD = this.ROOT + "reload_gun.mp3";

    public static readonly ENEMY_BIP_BIP = "bip_bip";
    public static readonly ENEMY_EXPLOSION = "explosion";
    public static readonly GUN_SHOOT = "shoot";
    public static readonly GUN_RELOAD = "reload_gun";

    public static getPathByName(name: string): string {
        let res: string;
        switch(name) {
            case this.ENEMY_BIP_BIP:
                res = this.PATH_ENEMY_BIP_BIP;
                break;
            case this.ENEMY_EXPLOSION:
                res = this.PATH_ENEMY_EXPLOSION;
                break;
            case this.GUN_SHOOT:
                res = this.PATH_GUN_SHOOT;
                break;
            case this.GUN_RELOAD:
                res = this.PATH_GUN_RELOAD;
                break;
        }
        return res;
    }

}