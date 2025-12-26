import React from 'react';
import { useContext } from 'react';

import { gamedat_ids, gamedat_object_ids, gamedat_routine_names } from './gamedat';
import { ZObject } from '../visi/zstate';

import { ReactCtx } from '../visi/context';
import { ObjPageLink, Commentary } from '../visi/widgets';

export function AboutPage()
{
    let rctx = useContext(ReactCtx);
    let zstate = rctx.zstate;

    let lastupdate = '__VISIZORKDATE__';
        
    let curroom = '???';
    let firstobj = '';

    let map: Map<number, ZObject> = new Map();
    for (let tup of zstate.objects) {
        map.set(tup.onum, tup);
    }
    
    let advroom: number = gamedat_ids.ADVENTURER;
    while (true) {
        let tup = map.get(advroom);
        if (!tup || tup.parent == 0 || tup.parent == gamedat_ids.ROOMS)
            break;
        advroom = tup.parent;
    }

    if (advroom != gamedat_ids.ADVENTURER) {
        let obj = gamedat_object_ids.get(advroom);
        if (obj) {
            curroom = obj.name;
        }

        let child = map.get(advroom)!.child;
        if (child && child == gamedat_ids.ADVENTURER) {
            child = map.get(child)!.sibling;
        }

        if (child) {
            let cobj = gamedat_object_ids.get(child);
            if (cobj) {
                firstobj = cobj.desc.toUpperCase();
            }
        }
        else if (obj && obj.scenery && obj.scenery.length) {
            let cobj = gamedat_object_ids.get(obj.scenery[0]);
            if (cobj) {
                firstobj = cobj.desc.toUpperCase();
            }
        }
    }
    
    function evhan_click_tab(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, tab: string) {
        ev.preventDefault();
        rctx.setTab(tab);
    }
    
    function evhan_click_routine(ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, rtn: string) {
        ev.preventDefault();
        let funcdat = gamedat_routine_names.get(rtn);
        if (funcdat) {
            rctx.setLoc(funcdat.sourceloc, false);
        }
    }
    
    return (
        <div className="ScrollContent">
            <div className="AboutPage">
                <h2>What's going on?</h2>
                <p>
                    You are playing Zork 2, the classic Infocom text adventure.
                    And you are watching the Z-machine execute the game,
                    live, as you play.
                </p>
            </div>
        </div>
    );
}

function ExtWebLink({ url, text }: { url:string, text:string })
{
    return (
        <a className="External" target="_blank" href={ url }>{ text }</a>
    );
}
