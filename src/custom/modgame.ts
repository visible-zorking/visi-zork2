import { gamedat_routine_names, gamedat_global_names, gamedat_string_map, unpack_address } from './gamedat';
import { spellconstmap } from './cwidgets';
import { GnustoEngine } from '../visi/zstate';

export function show_commentary_hook(topic: string, engine: GnustoEngine): string|null
{
    if (topic == 'BATTERIES') {
        refresh_batteries(engine);
        return null;
    }
    if (topic == 'TRY-SPELL') {
        if (!wizard_timer_active(engine)) {
            return 'TRY-SPELL-TOO-LATE';
        }
        return null;
    }
    if (topic == 'TRY-SPELL-FLUORESCE') {
        if (global_always_lit(engine)) {
            return 'TRY-SPELL-FLUORESCE-ALREADY';
        }
        set_always_lit(engine);
        return null;
    }
    if (topic == 'TRY-SPELL-FLUORESCE-END') {
        unset_always_lit(engine);
        return null;
    }
    if (topic.startsWith('TRY-SPELL-')) {
        if (!wizard_timer_active(engine)) {
            return 'TRY-SPELL-TOO-LATE';
        }
        let spell = topic.slice(10);
        let pos = spellconstmap.indexOf(spell);
        if (pos <= 0) {
            console.log('BUG: no such spell:', spell);
            return 'TRY-SPELL-FAIL';
        }
        rig_wizard_spell(pos, engine);
        return null;
    }

    return null;
}

/* A terrible hack: dig into the VM and overwrite the I-LANTERN timer
   entry with 5000!
*/
function refresh_batteries(engine: GnustoEngine)
{
    // This should be the same as the last report we got this turn.
    let report = engine.get_vm_report();

    // Locate the timer entry for I-LANTERN.
    let I_LANTERN = gamedat_routine_names.get('I-LANTERN');
    if (!I_LANTERN)
        return;

    let C_TABLE = gamedat_global_names.get('C-TABLE');
    if (!C_TABLE)
        return;

    let C_INTS = gamedat_global_names.get('C-INTS');
    if (!C_INTS)
        return;

    let pos = report.globals[C_INTS.num];
    let countpos = 0;
    while (pos+5 < report.timertable.length) {
        let addr = report.timertable[pos+4] * 0x100 + report.timertable[pos+5];
        if (unpack_address(addr) == I_LANTERN.addr) {
            let ctableaddr = report.globals[C_TABLE.num];
            countpos = ctableaddr+pos+2;
            break;
        }
        pos += 6;
    }

    if (!countpos) {
        console.log('BUG: could not find I-LANTERN timer');
        return;
    }

    engine.setWord(5000, countpos);

    // But now we have to trigger the generation of a new report,
    // so that the Timers UI updates. This is a hack; it leaves the
    // Activity tab looking bare. Sorry! You want new batteries, you
    // gotta put up with some jank.
    
    engine.reset_vm_report();
    window.dispatchEvent(new Event('zmachine-update'));
}

/* Another hack: determine whether the I-WIZARD timer is running.
 */
function wizard_timer_active(engine: GnustoEngine): boolean
{
    // This should be the same as the last report we got this turn.
    let report = engine.get_vm_report();

    // Locate the timer entry for I-WIZARD.
    let I_WIZARD = gamedat_routine_names.get('I-WIZARD');
    if (!I_WIZARD)
        return false;

    let C_INTS = gamedat_global_names.get('C-INTS');
    if (!C_INTS)
        return false;

    let pos = report.globals[C_INTS.num];
    let flag = false;
    while (pos+5 < report.timertable.length) {
        let addr = report.timertable[pos+4] * 0x100 + report.timertable[pos+5];
        if (unpack_address(addr) == I_WIZARD.addr) {
            if (report.timertable[pos+0] || report.timertable[pos+1])
                flag = true;
            break;
        }
        pos += 6;
    }

    return flag;
}

/* Rig the random number generator so that on the Wizard's next appearance,
   he casts a given spell on you, if possible.

   (There are several situations in which he *won't* cast a spell: if
   you're dead, if you're holding the black sphere, etc. We don't check
   any of that stuff here. The numbers will fall where they may.)
*/
function rig_wizard_spell(spellnum: number, engine: GnustoEngine)
{
    // L3458: <PROB 10>: The Wizard appears at all
    engine.rig_vm_random(0x10CDB, 0);
    // L3478: <PROB 20>: The Wizard mutters into his beard and vanishes without casting a spell
    engine.rig_vm_random(0x10E13, 99);
    // L3494: <PROB .CAST-PROB>: The Wizard is not put off by your spheres
    //   (chance of continuing is 80% minus 20% per sphere you hold)
    engine.rig_vm_random(0x10E9E, 0);
    // L3496: <RANDOM ,SPELLS>: Select a spell
    engine.rig_vm_random(0x10EAA, spellnum);
    // L3501: <PROB 75>: The Wizard casts audibly, rather than whispering
    engine.rig_vm_random(0x10ED1, 0);
}

function global_always_lit(engine: GnustoEngine): boolean
{
    // This should be the same as the last report we got this turn.
    let report = engine.get_vm_report();

    let ALWAYS_LIT = gamedat_global_names.get('ALWAYS-LIT');
    if (!ALWAYS_LIT)
        return false;

    if (report.globals[ALWAYS_LIT.num])
        return true;
    return false;
}

function set_always_lit(engine: GnustoEngine)
{
    // The Wizard's FLUORESCE effect sets both LIT and ALWAYS-LIT to true.
    
    let ALWAYS_LIT = gamedat_global_names.get('ALWAYS-LIT');
    if (!ALWAYS_LIT)
        return false;

    let LIT = gamedat_global_names.get('LIT');
    if (!LIT)
        return false;

    engine.setWord(1, engine.m_vars_start+ALWAYS_LIT.num*2);
    engine.setWord(1, engine.m_vars_start+LIT.num*2);

    // But now we have to trigger the generation of a new report,
    // so that the Globals UI updates. This is a hack; it leaves the
    // Activity tab looking bare. Sorry!
    
    engine.reset_vm_report();
    window.dispatchEvent(new Event('zmachine-update'));
}

function unset_always_lit(engine: GnustoEngine)
{
    let ALWAYS_LIT = gamedat_global_names.get('ALWAYS-LIT');
    if (!ALWAYS_LIT)
        return false;

    engine.setWord(0, engine.m_vars_start+ALWAYS_LIT.num*2);

    // But now we have to trigger the generation of a new report,
    // so that the Globals UI updates. This is a hack; it leaves the
    // Activity tab looking bare. Sorry!
    
    engine.reset_vm_report();
    window.dispatchEvent(new Event('zmachine-update'));
}
