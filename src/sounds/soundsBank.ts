export class SoundsBank {

    // ROOT
    private static readonly ROOT = "/assets/sound/";

    // Enemy sounds
    private static readonly PATH_ENEMY_BIP_BIP = this.ROOT + "bip_bip_bip.mp3";
    private static readonly PATH_ENEMY_EXPLOSION = this.ROOT + "explosion.mp3";
    private static readonly PATH_ENEMY_FUCKIN = this.ROOT + "fuckin.mp3";
    private static readonly PATH_ENEMY_TOUCHED = this.ROOT + "enemy_touched.mp3";
    private static readonly PATH_ENEMY_SHOOT = this.ROOT + "enemy_shoot.mp3";

    // Gun sounds
    private static readonly PATH_GUN_SHOOT = this.ROOT + "shoot.mp3";
    private static readonly PATH_GUN_RELOAD = this.ROOT + "reload_gun.mp3";

    // level
    private static readonly PATH_MUSIC_LEVEL = this.ROOT + "music_level.mp3";

    public static readonly ENEMY_BIP_BIP = "bip_bip";
    public static readonly ENEMY_EXPLOSION = "explosion";
    public static readonly ENEMY_FUCKIN = "fuckin";
    public static readonly ENEMY_TOUCHED = "enemy_touched";
    public static readonly ENEMY_SHOOT = "enemy_shoot";

    public static readonly GUN_SHOOT = "shoot";
    public static readonly GUN_RELOAD = "reload_gun";

    public static readonly MUSIC_LEVEL = "music_level";

    public static getPathByName(name: string): string {
        let res: string;
        switch(name) {
            case this.ENEMY_BIP_BIP:
                res = this.PATH_ENEMY_BIP_BIP;
                break;
            case this.ENEMY_EXPLOSION:
                res = this.PATH_ENEMY_EXPLOSION;
                break;
            case this.ENEMY_FUCKIN:
                res = this.PATH_ENEMY_FUCKIN;
                break;
            case this.ENEMY_TOUCHED:
                res = this.PATH_ENEMY_TOUCHED;
                break;
            case this.ENEMY_SHOOT:
                res = this.PATH_ENEMY_SHOOT;
                break;
            case this.GUN_SHOOT:
                res = this.PATH_GUN_SHOOT;
                break;
            case this.GUN_RELOAD:
                res = this.PATH_GUN_RELOAD;
                break;
            case this.MUSIC_LEVEL:
                res = this.PATH_MUSIC_LEVEL;
                break;
        }
        return res;
    }

}