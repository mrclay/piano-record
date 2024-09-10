import React from "react";
import { ChordSet } from "./ChordSet";
import { Keyed } from "./Intro";
import { useRenderers } from "./renderers";
import { SeventhTeaser } from "./SeventhTeaser";
import { ClickToPlay } from "./ClickToPlay";

function MajorKeyChords({ musicKey, offset }: Keyed) {
  const { f, f7, rom, note } = useRenderers(musicKey, offset);

  return (
    <section>
      <ChordSet
        els={[
          f("I maj7"),
          f("ii m7"),
          f("iii m7"),
          f("IV maj7"),
          f("V 7"),
          f("vi m7"),
        ]}
        desc={
          <p>
            Many major key songs are made only from the first six{" "}
            <strong>diatonic chords</strong> (built solely with scale tones).
          </p>
        }
      />

      <ClickToPlay />

      <ChordSet
        els={[
          f(
            "ii m7b5",
            "https://mrclay.org/sequence/songs/v4,70,1,p43p3cp29p39-p40j43j3cj29j39-p41p26p38j3c-j26j38p3cj41-p40p24p37j3c-j40j24j37j3c-j40j24j37j3c-",
            <>
              {note("IV")}add9 - <b>{note("ii")}ø7</b> - {note("I")}
            </>
          ),
          f(
            "bIII maj7",
            "https://mrclay.org/sequence/songs/v4,80,1,p34p24p40p3c-j34j24p41j3c-p27p43p37p3ap3e-j27j37j3aj3ep41-p3cp29p39p43-j3cj29j39j43-j3cj29j39j43-",
            <>
              {note("I")} - <b>{note("bIII")}maj7</b> - {note("IV")}add9
            </>
          ),
          f(
            "iv m7",
            "https://mrclay.org/sequence/songs/v4,90,1,p41p39p29-j41j39j29p30-p41p38p29j30-j41j38j29p32-p40p37p24p34-j40j37j24j34-j40j24j37j34-j24j40j37j34-",
            <>
              {note("IV")} - <b>{note("iv")}m</b> - {note("I")}
            </>
          ),
          f(
            "v m7",
            "https://mrclay.org/sequence/songs/v4,100,1,p3cp34p24-j3cj34j24-p2bp3ap3ep35-j3aj3ej35j2b-p29p39p40p37-j39j40j29p35-j40j39j29j35p3c-j29j35j39j3cj40",
            <>
              {note("I")} - <b>{note("v")}m7</b> - {note("IV")}maj7
            </>
          ),
          f(
            "bVI maj7",
            "https://mrclay.org/sequence/songs/v4,90,1,p43p34p37p24-j34j37p24p3c-p2cp3cp33p3f-p2cp3cj33j3f-p3ep37p43p22-j3ep22j37j43-p43p37p3cp2cp3f-j43j37j3cp2cj3f",
            <>
              {note("I")} - <b>{note("bVI")}</b> - {note("v")}m/{note("bvii")} -{" "}
              <b>{note("bVI")}maj7</b>
            </>
          ),
          f(
            "bVII 7",
            "https://mrclay.org/sequence/songs/v4,60,1,p30p34p40p37-p2fj34p43j37-p2dp34p39p47-p2dj39p48j34p40-p35p32p22p46p3e-j32j35p22p48j3e-p29p35p45p3c-p29j35j45j3c",
            <>
              {note("I")} - {note("vi")}m - <b>{note("bVII")}</b> - {note("IV")}
            </>
          ),
        ]}
        desc={
          <>
            <p>
              These are <strong>borrowed chords</strong> from the parallel minor
              (aeolian) mode.
            </p>
            <p>
              {note("bVII")} and {note("v")}m are also often borrowed in the
              mixolydian mode.
            </p>
          </>
        }
      />

      <ChordSet
        els={[
          f7(
            "V/IV 7",
            "https://mrclay.org/sequence/songs/v4,60,1,p24p3cp34-j24p3ap30p37j34-p29p39p35j30-j35j29j30j39",
            <>
              {note("I")} - <b>{note("I")}7</b> - {note("IV")}
            </>
          ),
          f(
            "V/V 7",
            "https://mrclay.org/sequence/songs/v4,60,0p25,p40-j40-p3e-p3cp37p24-j3cj37j24-j3cj37j24-p34p30j24-j34j30j24-j34j30j24-p36p26p2dj30-j36j26j2dj30-j36j26j2dj30-p37p2bp2fp32-j37j2bj2fj32-j37j2bj2fj32-j37j2bj2fj32-j37j2bj2fj32---",
            <>
              {note("I")} - <b>{note("II")}7</b> - {note("V")}
            </>
          ),
          f(
            "V/vi 7",
            "https://mrclay.org/sequence/songs/v4,75,1,p34p24p37-j24j37j34-p38p28p32j34-j28j38p34j32-p39p21p30j34-j39j21j30j34-j39j21j30j34-",
            <>
              {note("I")} - <b>{note("III")}7</b> - {note("vi")}m
            </>
          ),
          f(
            "V/ii 7",
            "https://mrclay.org/sequence/songs/v4,60,0p5,p40p24p37-j40j24j37p2b-p3ej24p35p30-p3dp2dp34-j3dj2dp31j34-p40j2dj3dp37p34-p41p26p35p39-j41j26j35j39p2d-j41j26j35j39p32-p30p24p2dp35p3c-p24j2dj30j35p39-j24j2dj30p35j39",
            <>
              {note("I")} - <b>{note("VI")}7</b> - {note("ii")}m - {note("IV")}/
              {note("I")}
            </>
          ),
        ]}
        desc={
          <>
            <p>
              These are <strong>secondary dominants</strong> of the {rom("IV")},{" "}
              {rom("V")}, {rom("vi")} and {rom("ii")} chords.
            </p>
            <p>
              The secondary dominant of {rom("iii")}, {note("V/iii")}7, is
              pretty rarely used.
            </p>
          </>
        }
      />

      <ChordSet
        els={[
          f7(
            "I 7",
            "https://mrclay.org/piano/songs/C3a0C3c9C40jC43lC24vC275qD245vC287pD277rC2b94D2898C30b2D2bb5C2ed5D30daC30isD2eiuD43spD3aspD30srD3cstD40su"
          ),
          f7(
            "II 7",
            "/sequence/songs/v4,55,0p25,p40p24p34p37p3c-j40j24-p34p37p3cj24j40-j24j40-p32p2bp37p3cj40-p34p2bp37p3c-p43j2bj34j37j3c-p3ej2bj34j37j3c-j3ep26p39p32p36-j26-p39p32p36j26-j26-p2dp39p30p36-p2dp39p32p36-j2dj39j32j36-j39j36p30p3cp28-p29p35p3ep39-j35j3ep2dj39-j35j3ep30j39-p24p37p34p3c-j24j37j34j3c-j24j37j34p40-j24j37j34p3c-j24j37j34j3c"
          ),
          f7(
            "IV 7",
            "https://mrclay.org/sequence/songs/v4,100,0p5,p2b-p29p39p33p35-j29j33j39j35-j29j33j39j35-p2b-p29p33p39p35p30-p29j30j33j35j39--p24p37p30p3c-j24j37j30j3c-j24j37j30j3c-",
            <>
              <b>{note("IV")}7</b> - {note("I")}5
            </>
          ),
          f7(
            "v m",
            "https://mrclay.org/sequence/songs/v4,110,0p5,p24p40p3cp37-p24p40p3cp37-p24p40p3cp37---p29p41p3cp39-p29p41p3cp39-j39j3cj41-p2bp43p3ep3a-p2bp43p3ep3a-p2bp43p3ep3a----",
            <>
              {note("I")} - {note("IV")} - <b>{note("v")}m</b>
            </>
          ),
          f7(
            "bVI 7",
            "https://mrclay.org/sequence/songs/v4,100,0p5,p3cp37p24-p30j3cj37j24-j30j3cj37j24-p2cp33p36p3c-j2cj33j36j3c-j2cj33j36j3cp3f-j2cj33j36j3cj3f-j2cj33j36j3fj3c-p29p3cp33p39-j29j3cj33p37-j29j3cj33j37-j29j33j3cp35-j29j33j3cj35-j29j33j3cj35-j29j33j3cj35-",
            <>
              {note("I")}5 - <b>{note("bVI")}7</b> - {note("IV")}7
            </>
          ),
          f7(
            "bVII 7",
            "https://mrclay.org/sequence/songs/v4,190,1,p40p30p3cp37-j40j30j3cj37-p43p30p3cj37-j43j30j3cj37-p44p2ep3ep38-j44j2ej3ej38-p41p2ep3ej38-p3fj2ej3ej38-j3fp29p3cp39p30-j3fj29j3cj39j30-j3fp29j3cp39p30-j3cj3fj29j39j30",
            <>
              {note("I")} - <b>{note("bVII")}7</b> - {note("IV")}7
            </>
          ),
        ]}
        desc={
          <p>
            These are often used in rock &amp; blues with the 7th notes just for
            color rather than serving a dominant function.
          </p>
        }
      />

      <ChordSet
        els={[
          f7(
            "bVII 9",
            "https://mrclay.org/sequence/songs/v4,40,0p5,p24p47p3bp40-j24p43j3bj40p2b-j24j43j3bp40j2bp34-p22p38p40-j22j38p3cp29j40-j22j38j3cj29p32j40",
            <>
              {note("I")}maj7 - <b>{note("bVII")}9#11</b>
            </>
          ),
        ]}
        desc={
          <p>
            The {rom("bVII9")} chord combines the sound of the {rom("bVII")} and{" "}
            borrowed {rom("iv")} triads. Because the {note("iv")} and{" "}
            {note("bVI")} notes want to resolve down to {note("iii")} and{" "}
            {note("v")}, jazz players often call this chord the "backdoor V",
            moving to {rom("I")}.
          </p>
        }
      />

      <ChordSet
        els={[
          f7(
            "#iv m7b5",
            "https://mrclay.org/piano/songs/C2b0C349C39dC3crC409bD40asC40beD34e5D39e6D2beaD3cecD40ejC2afaC34fbC39fcC3cfuC45g1C43lrD45lzC40piD43pnC3ersD40s0D34uoD2auqD39uxD3cuxD3ev1C29vvC30w3C39w9C3cwjD3c158C3c16mC3e18sD3c190C3c1aqD3e1auC3e1ciD3c1ctD301drD391dsD291dtD3e1egC301euC341ewC371exC401eyD401nrD371nsD301nsD341nt",
            <>
              {note("vi")}m7/{note("V")} - <b>{note("#iv")}ø7</b> - {note("IV")}{" "}
              - {note("I")}
            </>
          ),
        ]}
        desc={
          <p>
            This chord can be thought of as the {note("vi")}m triad with a tense{" "}
            {note("#iv")} bass note beneath. Usually the {note("#iv")} bass
            falls to {note("IV")} in the {rom("IV")} chord.
          </p>
        }
      />

      <ChordSet
        els={[
          f(
            "vii m7b5",
            "https://mrclay.org/sequence/songs/v4,70,1,p30p40p37-p30j40j37-p3ep35p39p23-p28j3ep38p34p3b-p34p39p3cp2d-j34j39j3cp2bj2d-p29p35p3ap30-j29p39j35j30",
            <>
              {note("I")} - <b>{note("vii")}ø7</b> - {note("III")}7 -{" "}
              {note("vi")}m - {note("IV")}sus {note("IV")}
            </>
          ),
        ]}
        desc={
          <p>
            The 7th diatonic chord is far less popular and generally only used
            for leading into {rom("V/vi")} ({note("III")}7).
          </p>
        }
      />

      <ChordSet
        els={[
          f(
            "I +",
            "https://mrclay.org/sequence/songs/v4,90,0p5,p24p37p40p34p43-p24j37j40j34j43-p24j37j40j34j43-p24p38p40p34-p24j38j40j34-p24j38j40j34-p24p39p34p3c-p24j39j34j3c-p24j39j34j3c-p24j39j34j3c-p24j39j34j3c-p24j39j34j3c",
            <>
              {note("I")} - <b>{note("I")}+</b> - {note("vi")}m/{note("I")}
            </>
          ),
          f(
            "V/vi + /#V",
            "https://mrclay.org/piano/songs/C2d0C342C3c2D2d63D3467D3c6bC2c74C3475C3c76D3cd8D34d9D2cdgC2bekC34elC3celD2bmcD3cmfD34moC26nxC36nyC39nyC3cnzC3eo4D3914mD3614nD2614nD3e14xD3c14y",
            <>
              {note("vi")}m -{" "}
              <b>
                {note("III")}+/{note("#V")}
              </b>{" "}
              - {note("I")}/{note("V")} - {note("II")}7
            </>
          ),
        ]}
        desc={
          <p>
            These are often used as passing chords between {note("I")} and{" "}
            {note("vi")}m to harmonize the note {note("#v")}.
          </p>
        }
      />

      <ChordSet
        els={[
          f7(
            "vii/ii dim7",
            "https://mrclay.org/sequence/songs/v4,40,1,p40p3cp34p24p37-p25p40p3ap37-p26p3ep35p39p3c-p35p2bp3bp3f",
            <>
              {note("I")} - <b>{note("#i")}°7</b> - {note("ii")}m7 - {note("V")}
              7+
            </>
          ),
          f7(
            "vii/V dim7",
            "https://mrclay.org/sequence/songs/v4,65,0p5,p29p41p39p3c-j29j41j39j3c-p2ap3fp3cp39-j2aj3fj3cj39-p2bp40p3cp37p34-j2bj3cp3ej37j34-p2dp3dp37p41j34-j2dj3dj37p40j34-p26p36p32p3cp40-j26j36j32j3cj40-p2bp3bp35p40-p24p3cp34-j24j3cj34-j24j3cj34-j24j3cj34",
            <>
              {note("IV")} - <b>{note("#iv")}°7</b> - {note("I")}/{note("V")} -{" "}
              {note("VI")}7 - {note("II")}9 - {note("V")}13 - {note("I")}
            </>
          ),
          f7(
            "vii/vi dim7",
            "https://mrclay.org/sequence/songs/v4,80,2,p40p30p37-p3ep2cp35p3b-p3cp2dp39p34-",
            <>
              {note("I")} - <b>{note("#v")}°7</b> - {note("vi")}m
            </>
          ),
        ]}
        desc={
          <>
            <p>
              These are <strong>secondary leading-tone diminished</strong>{" "}
              chords naturally leading to the chords {rom("ii")}, {rom("V")},
              and {rom("vi")}.
            </p>
            <p>
              {note("#ii")}dim7 is sometimes called a "passing-tone" diminished
              7th with {note("ii")} passing to {note("iii")}
              —or vice versa—but it may be clearer to think of it as an
              inversion of {note("#iv")}dim7.
            </p>
          </>
        }
      />

      <ChordSet
        els={[
          f(
            "bII maj7",
            "https://mrclay.org/sequence/songs/v4,50,0p5,p40p3bp2bp30p34-j40j3bj2bj30j34-p43p3ep28p3bp2f-j43j3ej28j3bj2f-p26p43p39p3cp30-j26j43j39j3cj30p32-p25p38p35p3cp41-j25j38j35j3cj41-j25j38j35j3cj41p37-j25j38p35j3cj41j37",
            <>
              {note("I")}maj7/{note("v")} - {note("iii")}m7 - {note("ii")}m7 -{" "}
              <b>{note("bII")}maj7</b>
            </>
          ),
        ]}
        desc={
          <p>
            Borrowed from phrygian, {rom("bII")} most often appears following{" "}
            {rom("V/V")}, {rom("ii")}, or {rom("bVI")} and often goes to{" "}
            {rom("I")} or {rom("V")}. In classical music, it often appears in
            1st inversion ({note("bII")}/{note("iv")}) as a substitute for the{" "}
            {rom("iv")} chord.
          </p>
        }
      />

      <SeventhTeaser>
        <ChordSet
          els={[
            f7(
              "bVII maj7",
              "https://mrclay.org/piano/songs/C300C3cdC40uC431fC471sC2ba0D2bgfD30gwD3cheD40hgD43hmD47hrC22i0C39ilC3aj3C3ejhC41k0C45k8D3910wD3a10zD3e10zD4111aD2211fD4511g",
              <>
                {note("I")}maj7 - <b>{note("bVII")}maj7</b>
              </>
            ),
          ]}
          desc={
            <p>
              This is borrowed from the mixolydian mode due to the presence of
              the note {note("vi")}.
            </p>
          }
        />

        <ChordSet
          els={[
            f7(
              "V 7b9",
              "https://mrclay.org/sequence/songs/v4,60,2,p45p41p3cp39p26-p44p2bp41p3bp35-p43p24p34p40p37-j43j24j34j37j40",
              <>
                {note("ii")}m7 - <b>{note("V")}7b9</b> - {note("I")}
              </>
            ),
            f7(
              "vii dim7",
              "https://mrclay.org/piano/songs/C300C378C3cdC40kC485fC477jD487qC489pD47a3D37ajD30aqD3carD40azD48b9C2fbkC35btC38bxC3ec8C4ac9C41fdD4afhC43hhD41hpC44kpD43kzD35pdD2fpfD38plD3epsD44qqC30qrC37qxC3cr2C40rfD37111D3c114D40114D30115",
              <>
                {note("I")} - <b>{note("vii")}°7</b> - {note("I")}
              </>
            ),
          ]}
          desc={
            <p>
              These are from the harmonic minor mode, and usually go to{" "}
              {rom("I")}.
            </p>
          }
        />

        <ChordSet
          els={[
            f7(
              "bVII 7#11",
              "https://mrclay.org/piano/songs/C320C35cC39rC3c16C415wC3e91D4194D35a9D32aaD39alD3cayD3ebcC2ebnC35bzC38c0C3ackC40d2C3eliD40ltD2emhD35mkD38moD3amzC30o6D3eo8C34oaC37odC3cosD3010wD3c10zD37110D34112",
              <>
                {note("ii")}m7 - <b>{note("bVII")}7#11</b> - {note("I")}
              </>
            ),
            f7(
              "iv mMaj7",
              "https://mrclay.org/sequence/songs/v4,75,0p5,p30-p34j30-p3cp37j30j34-p3ej30j34j37-p40p29p38-j40j29j38p30-j40j29j38p35j30-p3ej29j38j35j30-p3cp24p37p34-j3cj24j37j34-j3cj24j37j34-j24j34j37j3c",
              <>
                {note("I")} - <b>{note("iv")}m(maj7)</b> - {note("I")}
              </>
            ),
          ]}
          desc={
            <p>
              The notes {note("bVI")} and {note("iii")} in these chords help
              evoke the altered mode <em>mixolydian b6</em>, which is basically
              aeolian but with a distinctive major 3rd.
            </p>
          }
        />

        <ChordSet
          els={[
            f7(
              "subV/V 7",
              "https://mrclay.org/piano/songs/C300C3750C3c65C406tD30bbD37buD3cc0C2cc6D40cbC36cyC3cczC3fdhC42dsD2cpzD36q3D3cqdD3fqfD42qnC2br3C35rhC3brlC3eskC43szD2b18hD3e19bD3b19dD3519hD431b0",
              <>
                {note("I")} - <b>{note("bVI")}7</b> - {note("V")}
              </>
            ),
            f7(
              "subV 7",
              "https://mrclay.org/piano/songs/C320C39vC3cyC411gD3293D3996D3c9gC319uD41a0C38agC3bayC41bgD38lmD31loD3bmaC30mkD41muC37ngC3bnwC40oaD3011eD3711eD3b11gD4011u",
              <>
                {note("ii")}m7 - <b>{note("bII")}7</b> - {note("I")}maj7
              </>
            ),
            f7(
              "subV/IV 7",
              "https://mrclay.org/sequence/songs/v4,60,0p5,p30p40p43p3b-j30j40j43p37j3b-j40j43p2bj3b-p2ap40p46p3c-j2aj40j46j3cp34-j2aj40j46p3a-p29p40p45p39-j29j40j45p30j39-j29j40j45p37-p2ep44p3ep38-p2ej44j3ep3a-p2ej44j3ep3c",
              <>
                {note("I")}maj7 - <b>{note("bV")}7b5</b> - {note("IV")}maj7 -{" "}
                {note("bVII")}7
              </>
            ),
          ]}
          desc={
            <p>
              These are <strong>tritone substitutes</strong> for the chords{" "}
              {rom("V/V")}, {rom("V")}, and {rom("V/IV")} typically resolving a
              step down (to {rom("V")}, {rom("I")}, and {rom("IV")}). In sheet
              music you may find the 7th notated as an augmented 6th.
            </p>
          }
        />

        <ChordSet
          els={[
            f(
              "ii/ii m7b5",
              "https://mrclay.org/sequence/songs/v4,60,1,p40p30p37p3c-j40j30j37j3c-p43p28p3ep3a-p40p2dp3dp37-p41p32p35p3e-j41j32j35j3e-j41j32j35j3e-j41j32j35j3e",
              <>
                {note("I")} - <b>{note("iii")}ø7</b> - {note("VI")}7/
                {note("#i")} - {note("ii")}m
              </>
            ),
            f(
              "ii/IV m7b5",
              "https://mrclay.org/sequence/songs/v4,60,0p5,p40p30p37p3b-j40j30j37j3b-j40j30j37j3b-p43j40j3bj37j30-p3dp41p2bp3a-j3dj41j2bj3a-p3ap30p3cp40-j3aj30j3cj40-p39p3cp40p29-j39j3cj40j29-j39j3cj40j29-j39j3cj40j29",
              <>
                {note("I")} - <b>{note("v")}ø7</b> - {note("I")}7 - {note("IV")}
                maj7
              </>
            ),
            f(
              "ii/vi m7",
              "https://mrclay.org/sequence/songs/v4,85,0p5,p3cp24-p30j24j3cp34-p30j24j3cp34-j24j3cj30j34-p24j3cj30j34-j24p30j3cp34-j24j3cp30p34-j24j3cj30j34-p23-j23p32p36p39-p40j23p32p36p39-p42j23j32j36j39-p44p28-p45j28p38p34p3e-p47j28p38p34p3e-p48j28j38j34j3e-p47p2d-j47j2dp39p3cp34-p45j2dp39p3cp34-p45j2dj39j3cj34-j45j2dj39j3cj34-j45j2dj39j3cj34-j45j2dj39j3cj34---",
              <>
                {note("I")} - <b>{note("vii")}m7</b> - {note("III")}7 -{" "}
                {note("vi")}m
              </>
            ),
          ]}
          desc={
            <p>
              These sometimes function as "secondary predominants", appearing
              before secondary dominants {rom("V/ii")}, {rom("V/IV")}, or{" "}
              {rom("V/vi")} (or before their equivalent secondary leading-tone
              diminished chords).
            </p>
          }
        />

        <ChordSet
          els={[
            f(
              "V/ii 7#9",
              "https://mrclay.org/piano/songs/C300C37mC40uC437gC45b0D43bgD30byD37c0D40c4D45d6C2ddbC34dgC37dsC3decC48ehC46liD48lqD34ogD2dohD37omD3donD46poC45q9C32rqC39s0C41soD3915bD4515fD4115gD3215g",
              <>
                {note("I")} - <b>{note("VI")}7#9</b> - {note("ii")}m
              </>
            ),
            f(
              "subV 7b5",
              "https://mrclay.org/piano/songs/C320C39jC3clC4113D32b1D39baD3cbhC31c2D41c3C37cnC3bd1C41dhD31ooD37osD3bp3D41peC30prC37qjC3bqrC40roD3b12sD3712zD30132D40133",
              <>
                {note("ii")}m7 - <b>{note("bII")}7b5</b> - {note("I")}maj7
              </>
            ),
          ]}
          desc={
            <p>
              Just a couple examples of dominant 7th chords that have been
              "altered" with their 5th and/or 9th chord tones lowered or raised.
              Commonly done in jazz.
            </p>
          }
        />

        <ChordSet
          els={[
            f7(
              "VII 7",
              "https://mrclay.org/piano/songs/C2b0C344C37gC3cyC4082D34byD37ciD2bclD3cctC2ae0D40e5C33e6C36eiC3besC45f8D45hsC45irD2aq7D36qeD33qfD3bqmD45riC28s1C37s9C3csdC40spC48taC47wdD48wnC45y0D47y5C43zqD45zzD431b6D371b8D401b9D281b9D3c1be",
              <>
                {note("I")}/{note("V")} -{" "}
                <b>
                  {note("VII")}7/{note("#iv")}
                </b>{" "}
                - {note("I")}/{note("iii")}
              </>
            ),
          ]}
          desc={
            <p>
              {note("VII")}7 is often used as a smoother substitute for{" "}
              {note("#iv")}dim7, often inverted as {note("VII")}7/{note("#iv")}.
            </p>
          }
        />
      </SeventhTeaser>
    </section>
  );
}

export default MajorKeyChords;
