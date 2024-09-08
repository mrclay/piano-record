import React from "react";
import { ChordSet } from "./ChordSet";
import { Keyed } from "./Intro";
import { getRenderers } from "./renderers";
import { SeventhTeaser } from "./SeventhTeaser";
import { ClickToPlay } from "./ClickToPlay";

function MajorKeyChords({ musicKey, offset }: Keyed) {
  const { f, f7, rom, note } = getRenderers(musicKey, offset);

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
      />
      <p>
        Many major key songs are made only from the first six{" "}
        <strong>diatonic chords</strong> (built solely with scale tones).
      </p>

      <ClickToPlay />

      <ChordSet
        els={[
          f(
            "ii m7b5",
            "https://mrclay.org/sequence/songs/v4,70,1,p43p3cp29p39-p40j43j3cj29j39-p41p26p38j3c-j26j38p3cj41-p40p24p37j3c-j40j24j37j3c-j40j24j37j3c-",
            <>
              {note("I")}/{note("iii")} - <b>{note("ii")}ø7</b> - {note("I")}
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
            "https://mrclay.org/sequence/songs/v4,90,1,p43p34p37p24-j34j37p24p3e-p2cp3cp33p3f-p2cp3cj33j3f-p3ep37p43p22-j3ep22j37j43-p43p37p3cp2cp3f-j43j37j3cp2cj3f",
            <>
              {note("I")} - <b>{note("bVI")}</b> - {note("v")}m/{note("bvii")} -{" "}
              <b>{note("bVI")}maj7</b>
            </>
          ),
          f(
            "bVII 7",
            "https://mrclay.org/sequence/songs/v4,60,1,p30p34p40p37-p2fj34p43j37-p2dp34p39p47-p2dj39p48j34p40-p35p32p22p46p3e-j32j35p22p48p40-p29p35p45p3c-p29j35j45j3c",
            <>
              {note("I")} - {note("vi")}m - <b>{note("bVII")}</b> - {note("IV")}
            </>
          ),
        ]}
      />

      <p>
        These are <strong>borrowed chords</strong> from the parallel minor
        (aeolian) mode.
      </p>
      <p>
        {note("bVII")} and {note("v")}m are also often borrowed in the
        mixolydian mode.
      </p>

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
            "https://mrclay.org/sequence/songs/v4,60,0p5,p40p24p37-j40j24j37p2b-p3ej24p35p30-p3dp2dp34-j3dj2dp31j34-p40j2dj3dp37p34-p41p26p35p39-j41j26j35j39-j41j26j35j39-j41j26j39j35--",
            <>
              {note("I")} - <b>{note("VI")}7</b> - {note("ii")}m
            </>
          ),
        ]}
      />

      <p>
        These are <strong>secondary dominants</strong> of the {rom("IV")},{" "}
        {rom("V")}, {rom("vi")} and {rom("ii")} chords.
      </p>
      <p>
        The secondary dominant of {rom("iii")}, {note("V/iii")}7, is pretty
        rarely used.
      </p>

      <ChordSet
        els={[
          f7(
            "I 7",
            "https://mrclay.org/piano/songs/C3a0C3c9C40jC43lC24vC275qD245vC287pD277rC2b94D2898C30b2D2bb5C2ed5D30daC30isD2eiuD43spD3aspD30srD3cstD40su"
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
              {note("I")}7 - <b>{note("bVI")}7</b> - {note("IV")}7
            </>
          ),
          f7(
            "bVII 7",
            "https://mrclay.org/sequence/songs/v4,190,1,p40p30p3cp37-j40j30j3cj37-p43p30p3cj37-j43j30j3cj37-p44p2ep3ep38-j44j2ej3ej38-p41p2ep3ej38-p3fj2ej3ej38-j3fp29p3cp39p30-j3fj29j3cj39j30-j3fp29j3cp39p30-j3cj3fj29j39j30",
            <>
              {note("I")}7 - <b>{note("bVII")}7</b> - {note("IV")}7
            </>
          ),
        ]}
      />

      <p>
        These are often used in rock &amp; blues with the 7th notes just for
        color rather than serving a dominant function.
      </p>

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
      />

      <p>
        The {rom("bVII9")} chord combines the sound of the {rom("bVII")} and{" "}
        borrowed {rom("iv")} triads. Because the {note("iv")} and {note("bVI")}{" "}
        notes want to resolve down to {note("iii")} and {note("v")}, jazz
        players often call this chord the "backdoor V", moving to {rom("I")}.
      </p>

      <ChordSet
        els={[
          f7(
            "#iv m7b5",
            "https://mrclay.org/piano/songs/C2b0C34iC37tC3c1fC407jD409eC40a4D2bczD34d6D37dcD3cdhD40e6C2aedC34eqC39etC3cf1C45f8D45kdC43llD43oqC40puD40rfC3es9D34v0D2av1D39vaD3cveD3evnC29woC34wpC39wuC3cx1D391bfD3c1bfD341bgD291bh",
            <>
              {note("I")}6/{note("V")} - <b>{note("#iv")}ø7</b> - {note("IV")}
              maj7
            </>
          ),
        ]}
      />

      <p>
        This chord can be thought of as the {note("vi")}m triad with a tense{" "}
        {note("#iv")} bass note beneath. Usually the {note("#iv")} bass falls to{" "}
        {note("IV")} in the {rom("IV")} chord.
      </p>

      <ChordSet
        els={[
          f(
            "vii m7b5",
            "https://mrclay.org/sequence/songs/v4,70,1,p30p40p37-p30j40j37-p3ep35p39p23-p28j3ep38p34p3b-p34p39p3cp2d-j34j39j3cp2bj2d-p29p35p3ap30-j29p39j35j30-j29j39j35j30-",
            <>
              {note("I")} - <b>{note("vii")}ø7</b> - {note("III")}7 -{" "}
              {note("vi")}m - {note("IV")}sus {note("IV")}
            </>
          ),
        ]}
      />

      <p>
        The 7th diatonic chord is far less popular and generally only used for
        leading into {rom("V/vi")} ({note("III")}7).
      </p>

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
      />

      <p>
        These are often used as passing chords between {note("I")} and{" "}
        {note("vi")}m to harmonize the note {note("#v")}.
      </p>

      <ChordSet
        els={[
          f7(
            "vii/ii dim7",
            "https://mrclay.org/sequence/songs/v4,40,1,p40p3cp39p34p24-p25p40p3ap37-p26p3ep35p39p3c-p35p2bp3bp3f",
            <>
              {note("I")}6 - <b>{note("#i")}°7</b> - {note("ii")}m7 -{" "}
              {note("V")}7+
            </>
          ),
          f7(
            "vii/V dim7",
            "https://mrclay.org/sequence/songs/v4,60,0p5,p29p41p39p3c-j29j41j39j3c-p2ap3fp3cp39-j2aj3fj3cj39-p2bp40p3cp37-j2bj40j3cp32-p2dp3dp37p35-j2dj3dj37p34-j2dj3dj37j34p31-j2dj3dj37j34j31-j2dj3dj37j34j31",
            <>
              {note("IV")} - <b>{note("#iv")}°7</b> - {note("I")}/{note("V")} -{" "}
              {note("VI")}7
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
      />

      <p>
        These are <strong>secondary leading-tone diminished</strong> chords
        naturally leading to the chords {rom("ii")}, {rom("V")}, and {rom("vi")}
        .
      </p>
      <p>
        {note("#ii")}dim7 is sometimes called a "passing-tone" diminished 7th
        with {note("ii")} passing to {note("iii")}
        —or vice versa—but it may be clearer to think of it as an inversion of{" "}
        {note("#iv")}dim7.
      </p>

      <ChordSet
        els={[
          f(
            "bII maj7",
            "https://mrclay.org/sequence/songs/v4,50,0p5,p40p3bp37p2bp30-j40j3bj37j2bj30-p43p3ep28p3bp2f-j43j3ej28j3bj2f-p26p43p39p3cp30-j26j43j39j3cj30p32-p25p38p35p3cp41-j25j38j35j3cj41-j25j38j35j3cj41p37-j25j38j35j3cj41j37-j25j38j35j3cj41j37-",
            <>
              {note("I")}/{note("v")} - {note("iii")}m7 - {note("ii")}m7 -{" "}
              <b>{note("bII")}maj7</b>
            </>
          ),
        ]}
      />

      <p>
        Borrowed from phrygian, {rom("bII")} most often appears following{" "}
        {rom("V/V")}, {rom("ii")}, or {rom("bVI")} and often goes to {rom("I")}{" "}
        or {rom("V")}. In classical music, it often appears in 1st inversion (
        {note("bII")}/{note("iv")}) as a substitute for the {rom("iv")} chord.
      </p>

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
        />

        <p>
          This is borrowed from the mixolydian mode due to the presence of the
          note {note("vi")}.
        </p>

        <ChordSet
          els={[
            f7(
              "V 7b9",
              "https://mrclay.org/piano/record/C320C39hC3cjC4111C4517D3c9hD329xD39ahD41ajD45apC2bavC32bdC3bbjC41c0C44chD2bmnD32mwD3bn9D41nfD44nlC30o3C37ojC40oxC43p5D40x9D37xdD43xdD30xj",
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
        />

        <p>
          These are from the harmonic minor mode, and usually go to {rom("I")}.
        </p>

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
              "https://mrclay.org/piano/songs/C300C34eC3718C3c7yC3eakD3cb2D34c4D30c6D37c8D3ecwC35d4C38diC3cdsC40eiC3eo8D40ogD38q0D35q1D3cqaC34rcC37rgD3eroC3cs8D3c12bD3412qD3712r",
              <>
                {note("I")} - <b>{note("iv")}m(maj7)</b> - {note("I")}/
                {note("iii")}
              </>
            ),
          ]}
        />

        <p>
          The notes {note("bVI")} and {note("iii")} in these chords help evoke
          the altered mode <em>mixolydian b6</em>, which is basically aeolian
          but with a distinctive major 3rd. The {rom("bVII")}7 chord is
          sometimes called the <strong>backdoor V</strong>, as it resolves
          nicely to the tonic.
        </p>

        <ChordSet
          els={[
            f7(
              "subV/V 7",
              "https://mrclay.org/piano/songs/C300C37kC3coC40xD307oD3c7wD3782D408kC2c8nC3399C3c9aC429lD2ch0D33hcD3ci2C2bi5D42i9C32iuC3bj7C43jnD32s4D3bs5D2bsaD43sh",
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
              "https://mrclay.org/piano/songs/C300C37gC3b14C401iD306mD3770D3b7cD407mC2a7yC3a88C3c8xC409bD40h6C3eieD2ajtD3akfD3ckgD3ekgC29kuC39lcC3cluC40mgD39xyD3cy4D29y8D40yb",
              <>
                {note("I")}maj7 - <b>{note("bV")}7b5</b> - {note("IV")}maj7
              </>
            ),
          ]}
        />

        <p>
          These are <strong>tritone substitutes</strong> for the chords{" "}
          {rom("V/V")}, {rom("V")}, and {rom("V/IV")} typically resolving a step
          down (to {rom("V")}, {rom("I")}, and {rom("IV")}). In sheet music you
          may find the 7th notated as an augmented 6th.
        </p>

        <ChordSet
          els={[
            f(
              "ii/ii m7b5",
              "https://mrclay.org/piano/songs/C300C37cC40uD30asD37b2D40b8C34c2C3acqC3ed0C43dmD34j0D3ajgD3ejqD43k0C31k8C37kmC39l4C40loD31raD37rmD39rsD40s4C32siC39t0C3eteC41tyD3917wD32180D3e182D41186",
              <>
                {note("I")} - <b>{note("iii")}ø7</b> - {note("VI")}7/
                {note("#i")} - {note("ii")}m
              </>
            ),
            f(
              "ii/IV m7b5",
              "https://mrclay.org/piano/songs/C300C378C40kC43ayD37bkD30ciD40cqD43d8C37dsC3ae4C3dekC41eyD37jyD3ajyD3dkiD41koC30l6C3alkC3clwC40mmD30scD3aseD3cstD40t4C35t8C39tuC3cu3C40ugD39150D3c158D3515bD4015c",
              <>
                {note("I")} - <b>{note("v")}ø7</b> - {note("I")}7 - {note("IV")}
                maj7
              </>
            ),
            f(
              "ii/vi m7",
              "https://mrclay.org/piano/songs/C300C345C37vC3czD30ddD34dlD3ce4D37f1C2ffeC36fqC39g0C3eg8C40lbD3elsC42o1D40ocD2fphD36plD39pvD42qfC34qnC38qtC3er5C44rqC45uhD44v2C47xhD45xvC4810lD4710vD3811qD3411rD3e11xC39137C3c13dD4813fC4013vC4714nC451bhD471bqD401gdD3c1gxD391h0D451h1",
              <>
                {note("I")} - <b>{note("vii")}m7</b> - {note("III")}7 -{" "}
                {note("vi")}m
              </>
            ),
          ]}
        />

        <p>
          These sometimes function as "secondary predominants", appearing before
          secondary dominants {rom("V/ii")}, {rom("V/IV")}, or {rom("V/vi")} (or
          before their equivalent secondary leading-tone diminished chords).
        </p>

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
        />

        <p>
          Just a couple examples of dominant 7th chords that have been "altered"
          with their 5th and/or 9th chord tones lowered or raised. Commonly done
          in jazz.
        </p>

        <ChordSet
          els={[
            f7(
              "VII 7",
              "https://mrclay.org/piano/songs/C370C3cgC4016C481cC4c8eD488mD37dsD3cdyD40e2D4ceyC36f2C39fcC3bfqC3ffyC51geD51jaC51k8D3bsaD39scD36sgD3fsoD51tmC34tsC37u4C3cuaC40umC54v0C53yiD54ysC5110aD5310iC4f124D5112eD401a2D341a4D371a6D3c1a6D4f1a8",
              <>
                {note("I")}/{note("V")} -{" "}
                <b>
                  {note("VII")}7/{note("#iv")}
                </b>{" "}
                - {note("I")}/{note("iii")}
              </>
            ),
          ]}
        />

        <p>
          {note("VII")}7 is often used as a smoother substitute for{" "}
          {note("#iv")}dim7, often inverted as {note("VII")}7/{note("#iv")}.
        </p>
      </SeventhTeaser>
    </section>
  );
}

export default MajorKeyChords;
