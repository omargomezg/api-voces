/**
 * Enum for set source for sites tuvoz group
 */
export enum SourceEnum {PAILLACO,TU_VOZ}

 export namespace SourceEnum {

    export function getDbName(source: number): string {
        let dbName = 'wp_tuvoz';
        if (source === SourceEnum.PAILLACO) {
            dbName = 'paillaco';
        }
        return dbName;
    }
}

export default SourceEnum;
