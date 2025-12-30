import React from 'react';
import { useState, useContext, createContext } from 'react';

import { ZObject } from '../visi/zstate';
import { ObjectData, GlobalData } from './gamedat';
import { gamedat_ids, gamedat_distances, gamedat_object_treesort } from './gamedat';

export function contains_label(obj: ObjectData) : string
{
    if (!obj.isroom) {
        if (obj.onum == gamedat_ids.ADVENTURER || obj.onum == gamedat_ids.WIZARD || obj.onum == gamedat_ids.GENIE || obj.onum == gamedat_ids.UNICORN || obj.onum == gamedat_ids.ROBOT)
            return 'carries';
        else
            return 'contains'
    }
    return '';
}

export function sorter_for_key(key: number) : (roots:ZObject[], map:Map<number, ZObject>) => void
{
    let originobj: number = gamedat_ids.ADVENTURER;

    return function(roots: ZObject[], map: Map<number, ZObject>) {
        let advroom = originobj;

        while (true) {
            let tup = map.get(advroom);
            if (!tup || tup.parent == 0 || tup.parent == gamedat_ids.ROOMS)
                break;
            advroom = tup.parent;
        }
        
        if (!gamedat_distances[advroom])
            advroom = gamedat_ids.STARTROOM;
        let distmap = gamedat_distances[advroom];

        roots.sort((o1, o2) => {
            let sort1 = gamedat_object_treesort.get(o1.onum) ?? 0;
            let sort2 = gamedat_object_treesort.get(o2.onum) ?? 0;
            if (sort1 != sort2)
                return sort1 - sort2;
            if (sort1 == 1 && distmap !== undefined)
                return distmap[o1.onum] - distmap[o2.onum];
            return (o1.onum - o2.onum);
        });
    }
}

export function ObjListSorter({ followKey, setFollowKey } : { followKey:number, setFollowKey:(v:number)=>void })
{
    return (
        <div>
            (Following Adventurer)
        </div>
    );
}

const spellconstmap: string[] = [
    '(no spell)',
    'FEEBLE',
    'FUMBLE',
    'FEAR',
    'FILCH',
    'FREEZE',
    'FALL',
    'FERMENT',
    'FIERCE',
    'FLOAT',
    'FIREPROOF',
    'FENCE',
    'FANTASIZE',
];

export function global_value_display(tag: string, value: number, glo: GlobalData) : JSX.Element|null
{
    if (tag == 'SPELLCONST') {
        if (value == 0) {
            return (
                <i>no spell</i>
            );
        }
        let name = spellconstmap[value];
        if (!name) {
            return (
                <i>??? { value }</i>
            );
        }
        return (
            <code>S-{ name }</code>
        );
    }
    
    return null;
}
