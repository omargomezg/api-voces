/**
 * Enum for set source for sites tuvoz group
 */
export enum SourceEnum {
    PAILLACO,
    TU_VOZ
}

 export namespace SourceEnum {

    export function getDbName(source: SourceEnum): string {
        let dbName = '';
        switch (source) {
            case SourceEnum.PAILLACO:
                dbName = 'paillaco';
                break;
            default:
                dbName = 'tu_voz';
        }
        return dbName;
    }

    export function parse(val: any): SourceEnum {
        // @ts-ignore
        return SourceEnum[val];
    }
}

export default SourceEnum;