
/* Return the initial sourceloc to display. */
export function sourceloc_start() : string
{
    return 'J:78:1:101:0';  // 'gverbs.zil', lines 78-100
}

// Presentation order. Filenames must match game-info!
export const sourcefile_presentation_list: string[] = [
    'zork2.zil',
    '2actions.zil',
    '2dungeon.zil',
    'gmain.zil',
    'gmacros.zil',
    'gglobals.zil',
    'gparser.zil',
    'gsyntax.zil',
    'gverbs.zil',
    'gclock.zil',
    'crufty.zil',
];
