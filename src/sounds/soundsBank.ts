export class SoundsBank {

    // ROOT
    private static readonly ROOT = "/assets/sound/";

    // Enemy sounds
    private static readonly PATH_ENEMY_BIP_BIP = this.ROOT + "bip_bip_bip.mp3";
    private static readonly PATH_ENEMY_EXPLOSION = this.ROOT + "explosion.mp3";

    public static readonly ENEMY_BIP_BIP = "bip_bip";
    public static readonly ENEMY_EXPLOSION = "explosion";

    public static getPathByName(name: string): string {
        switch(name) {
            case this.ENEMY_BIP_BIP:
                return this.PATH_ENEMY_BIP_BIP;
            case this.ENEMY_EXPLOSION:
                return this.PATH_ENEMY_EXPLOSION;
        }
        return "";
    }

}