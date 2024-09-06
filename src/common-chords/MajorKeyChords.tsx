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
            "https://mrclay.org/sequence/songs/v4,70,1,p43p28p34p3c-p40j28j34j43j3c-p41p26p35p38j3c-j26j35j38p3ej3cj41-p40p24p37p3cp34-j40j24j37j3cj34-j40j24j37j3cj34-",
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
            "https://mrclay.org/sequence/songs/v4,90,1,p41p39p29-j41j39j29p30-p41p38p29j30-j41j38j29p32-p40p37p24p34-j40j37j24p30-j40j24p2bj37-j24j40j2bj37-",
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
            "https://mrclay.org/sequence/songs/v4,90,1,p29p43p39p34-p29p41j39j34-p2cp43p3cp33-j2cp41j3cj33-p2bp43p35p3cp3e-p2bj43j35j3cj3e-p24p40p37j3c-j40j37p24j3c",
            <>
              {note("IV")}maj7 - <b>{note("bVI")}maj7</b> - {note("V")}7sus -{" "}
              {note("I")}
            </>
          ),
          f(
            "bVII 7",
            "https://mrclay.org/sequence/songs/v4,60,1,p30p34-p2fp37j34-p2dp34p3bp39-p2dj34p3cj39-p35p32p3ap22-j32j35j3ap3cp22-p29p35p39j3c-p29j35j39j3c",
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
            "https://mrclay.org/sequence/songs/v4,250,1,p40-j40-p3e-p3cp37p24-j3cj37j24-j3cj37j24-p34p30j24-j34j30j24-j34j30j24-p36p26p2dj30-j36j26j2dj30-j36j26j2dj30-p37p2bp2fp32-j37j2bj2fj32-j37j2bj2fj32-j37j2bj2fj32-j37j2bj2fj32---",
            <>
              {note("I")} - <b>{note("II")}7</b> - {note("V")}
            </>
          ),
          f(
            "V/vi 7",
            "https://mrclay.org/sequence/songs/v4,75,1,p34p24p30p37-j24j30j37j34-p38p28p34-p3bj28j38j34p32-p39p21p30j34-j39j21j30j34-j39j21j30j34-",
            <>
              {note("I")} - <b>{note("III")}7</b> - {note("vi")}m
            </>
          ),
          f(
            "V/ii 7",
            "https://mrclay.org/sequence/songs/v4,120,1,p40p24p37-j40j24j37p2b-p3ej24p35p30-p3dp2dp34-j3dj2dp31j34-p40j2dj3dp37p34-p41p26p35p39-j41j26j35j39p2d-j41j26j35j39p32-j41j26p35j39-j35-",
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
            "https://mrclay.org/piano/songs/C400C3adC37pC301bC2b5vD305xC2eahD2basC30cyD2ed5C33feD30frD33gsC30ifD40tiD3atnD30tpD37tt"
          ),
          f7(
            "IV 7",
            "https://mrclay.org/sequence/songs/v4,200,1,p24-p29p39p33p35-j29j33j39j35-j29j33j39j35-p24-p29p33p39p35p30-p29j30j33j35j39--p24p37p2bp30-j24j37j2bj30-j24j37j2bj30-",
            <>
              <b>{note("IV")}7</b> - {note("I")}5
            </>
          ),
          f7(
            "v m",
            "https://mrclay.org/sequence/songs/v4,190,1,p24p40p3cp37-p24p40p3cp37-p24p40p3cp37---p29p41p3cp39-p29p41p3cp39-j39j3cj41-p2bp43p3ep3a-p2bp43p3ep3a-p2bp43p3ep3a----",
            <>
              {note("I")} - {note("IV")} - <b>{note("v")}m</b>
            </>
          ),
          f7(
            "bVI 7",
            "https://mrclay.org/sequence/songs/v4,200,1,p30p3cp37-j30j3cj37-j30j3cj37-p2cp33p36p3c-j2cj33j36j3c-j2cj33j36j3cp3f-j2cj33j36j3cj3f-j2cj33j36j3fj3c-p29p3cp33p39-j29j3cj33p37-j29j3cj33j37-j29j33j3cp35-j29j33j3cj35-j29j33j3cj35-j29j33j3cj35-",
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
            "https://mrclay.org/sequence/songs/v4,80,1,p26p41p35p39p3e-j26j35j39j41j3e-p22p32p38p35p3c-j22j32j38j35j3c-p24p34p3bp3ep37-j24j34j3bj3ej37-j24j34j3bj3ej37-",
            <>
              {note("ii")}m - <b>{note("bVII")}9</b> - {note("I")}maj9
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
            "https://mrclay.org/piano/songs/C300C374C406D30bcD37bcD40biC2fc2C35ccC39ckC3ecmD35jiD39jmD3ejuD2fk5C34kiC38kmC3bkmD34scD38scD3bskC35tcC39teC3ctfD3514zD3c152D3915c",
            <>
              {note("I")} - <b>{note("vii")}ø7</b> - {note("III")} -{" "}
              {note("IV")}
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
            "https://mrclay.org/piano/songs/C300C37mC4016D3068D376oD4072C3076C387sC408aD30joD38kiC30kmD40koC39lkC3cluC40mmD39ziD3czqD30zuD40zw",
            <>
              {note("I")} - <b>{note("I")}+</b> - {note("vi")}m/{note("I")}
            </>
          ),
          f(
            "V/vi + /#V",
            "https://mrclay.org/piano/songs/C390C3c6C40sD396yD3c7cD407pC388nC3c93C409pD38ktD3ckxD40l7C37maC3cmjC40n1D37u5D3cudD40umC32v2C36vhC39vsC3cwdD3216rD3616xD39171D3c178",
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
            "https://mrclay.org/piano/songs/C300C374C3c6C408D3c87D308cD408jD378uC319kC379wC3aa0C40a2D37i2D31i4D3ai7D40ieC32jkC39joC3cjqC41jsD32twD39u0D41u1D3cu8",
            <>
              {note("I")} - <b>{note("#i")}°7</b> - {note("ii")}m7
            </>
          ),
          f7(
            "vii/V dim7",
            "https://mrclay.org/piano/songs/C350C392C3ceC41xD416oD357aC368aC3f8eD3ffuD39g8D3cgeD36goC37heC3chsC40i8D37qaC2dqeD3cqkD40quC34reC37ryC3ds8D37128D3412aD2d12iD3d12k",
            <>
              {note("IV")} - <b>{note("#iv")}°7</b> - {note("I")}/{note("V")} -{" "}
              {note("VI")}7
            </>
          ),
          f7(
            "vii/vi dim7",
            "https://mrclay.org/piano/songs/C300C375C4012D309xD37afC2cahD40ahC35avC3bbfC3ebtD2ckdD35kpD3bkvD3ekzC2dlfC34ltC39m5C3cmnD34y9D2dyfD39ylD3cyr",
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
            "https://mrclay.org/piano/songs/C300C37bC3bhC40nD304pD3b4rD404xD374zC335rC3a67C3e6fC436nD33d9D3edfD3advD43dxC2cerC33f1C3cfdC43fhD2ckqD3ckqD33kxD43l3C31lrC38m9C3cmhC41mjD31wlD3cwnD38wrD41xlC30y1C37yvC3byxC40z5D3718hD3b18lD3018rD4018r",
            <>
              {note("I")}maj7 - {note("bIII")}maj7 - {note("bVI")}maj7 -{" "}
              <b>{note("bII")}maj7</b> - {note("I")}maj7
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
              "https://mrclay.org/piano/songs/C300C379C3biC40pD4058C4062D4074C407vD30b0D37b6D3bboD40ccC2eceC35ciC39d0C3edfD3eizC3ejyD3eoaC41pmD2eroD35rqD39s1D41saC30slC37syC3btcC40tgD3013yD40141D3b142D37144",
              <>
                {note("I")}maj7 - <b>{note("bVII")}maj7</b> - {note("I")}maj7
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
