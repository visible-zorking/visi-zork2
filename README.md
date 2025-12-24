# The Visible Zorker 2: an interactive fiction visualizer

- Designed by Andrew Plotkin <erkyrath@eblong.com>
- Web site: https://eblong.com/infocom/visi-zork2/

This is a web app that plays Zork 2, and simultaneously displays the code that runs Zork 2 under the hood. It allows you to explore the implementation of Zork in the same way that you explore the game world. Call it an exercise in exploratory coding.


```
python3 visiterp/pyana/parse.py --game zork2-r48-s840904 -z gamesrc/zork1.zil --obj --dict --txd --gamedat
python3 visiterp/pyana/parse.py --game zork2-r48-s840904 -z gamesrc/zork1.zil --src
python3 visiterp/pyana/comgen.py gamedat/commentary
```
