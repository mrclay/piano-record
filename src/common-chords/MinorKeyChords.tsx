import React from "react";
import { ChordSet } from "./ChordSet";
import { Keyed } from "./Intro";
import { getRenderers } from "./renderers";
import { ClickToPlay } from "./ClickToPlay";

function MinorKeyChords({ musicKey, offset }: Keyed) {
  const { f, f7, rom, note } = getRenderers(musicKey, offset);

  return (
    <section>
      <ChordSet
        els={[
          f("i m7"),
          f("bIII maj7"),
          f("iv m7"),
          f("v m7"),
          f("bVI maj7"),
          f("bVII 7"),
        ]}
        desc={
          <p>
            Many minor key songs are made only from the these six{" "}
            <strong>diatonic chords</strong> (built solely with scale tones).
          </p>
        }
      />

      <ClickToPlay />

      <ChordSet
        els={[
          f(
            "V 7",
            "https://mrclay.org/sequence/songs/v4,110,0p5,p43p30p3f-j43p33j30j3f-p37j30j33-p43p3cj30j33j37p3f-p43p2bp3bp3e-p41j2bp35j3ej3b-j41j2bp32j3ej3bj35-p3fp3cp24p30p37-j3fj3cj24j30j37-j3fj3cj24j30j37-j3fj3cj24j30j37-j3fj3cj24j30j37",
            <>
              {note("i")}m - <b>{note("V")}7</b> - {note("i")}m
            </>
          ),
          f7(
            "vii dim7",
            "https://mrclay.org/sequence/songs/v4,75,0p5,p24p37p3fp43-j24p4fj37j3fj43-j24p53j37j3fj43-j24p54j37j3fj43-p26p53p41p47p38-j26p50j41j47j38-j26p4fj41j47j38-j26p4aj41j47j38-p27p4bp48p43p3c-j27j3cj43j48j4b-j27j3cj43j48j4b-j27j3cj43j48j4b-j27j3cj43j48j4b-",
            <>
              {note("i")}m -{" "}
              <b>
                {note("vii")}°7/{note("ii")}
              </b>{" "}
              - {note("i")}m/
              {note("biii")}
            </>
          ),
        ]}
        desc={
          <>
            <p>
              The <strong>dominant</strong> chord ({rom("V")}) is very commonly
              used and was nearly always used instead of {rom("v")} in classical
              music.
            </p>
            <p>
              The leading-tone diminished chord has three chord tones in common
              with {note("V")}7, and so has a similar sound.
            </p>
          </>
        }
      />

      <ChordSet
        els={[
          f(
            "ii m7",
            "https://mrclay.org/sequence/songs/v4,80,0p5,p3cp33p37p30-j3cj33j37j30-j3cj33j37j30-p3bj33j37p30-p3cp2bj33j37-p3ej2bj33j37-p3fj33j37p24-p41j33j37j24-p43p26p35p39p30-j43j26j35j39j30-j43j26j35j39j30-j43p26j35j39j30-j43p2bp3bp35p37-j43j2bj3bj35j37-j43j3bj35p2fj37-j35j3bj43j2fj37",
            <>
              {note("i")}m - <b>{note("ii")}m7</b> - {note("V")}7
            </>
          ),
          f(
            "IV 7",
            "https://mrclay.org/sequence/songs/v4,90,0p5,p30p3fp3cp3a-j30p4aj3fj3cj3a-j30p48j3fj3cj3a-j30p46j3fj3cj3aj48-p29p45p39p3cp3fj48-j29p46j39j3cj3fj48-j29p41j39j3cj3fj48-p43p3ap37j48p33p30-j43j3aj37j48j33j30-j43j3aj37j48j33j30-p24j43j3aj37j48j33-j3aj37j33",
            <>
              {note("i")}m7 - <b>{note("IV")}7</b> - {note("i")}m7
            </>
          ),
        ]}
        desc={
          <p>
            These are two <strong>borrowed chords</strong> from the dorian mode.
          </p>
        }
      />

      <ChordSet
        els={[
          f(
            "bII maj7",
            "https://mrclay.org/piano/songs/C430C421vD432bC303cD423nC373rC3c49C3f4dC434hC42c1D43cbC43elD42erD3fhtC3fhuD43i1D30kdD37khD3ckhD3fkjC31lnC35lvC38m8C3cmjC41mtD41w5C41xbC40zfD31znD35zrD41ztD38zxD3czzC2b113C3211fD4011hC3511jC3b121C41125C3e181D4118gC411abD3e1ahC3e1c9D411crD2b1dlD321dnD351dvD3b1dzC301etD3e1fdC371ffC3c1ffC3f1fnD3f1pxD3c1qbD301qbD371qf",
            <>
              {note("i")}7 - <b>{note("bII")}maj7</b> - {note("V")}7 -{" "}
              {note("i")}m
            </>
          ),
          f(
            "bvii m7",
            "https://mrclay.org/sequence/songs/v4,80,0p5,p4ap30p37p3cp3f-j4aj30j37j3cj3f-p48j30j37j3cj3f-j48j30j37j3cj3f-p48p2ep3dp3ap35-p46j2ej35j3aj3d-p43j2ej35j3aj3d-p41j2ej35j3aj3d-p43p2cp3fp3cp37-j43j2cj3fj3cj37-j43j2cj3fj3cj37-p41j2cj3fj3cj37-p43p2bp3ep3cp37-j43j2bj3ej3cj37-j43p2fj3ep3bj37-j43j2fj3ej3bj37",
            <>
              {note("i")}m - <b>{note("bvii")}m</b> - {note("bVI")}maj7 -{" "}
              {note("V")}sus {note("V")}
            </>
          ),
        ]}
        desc={<p>Two more borrowed chords from the phrygian mode.</p>}
      />

      <ChordSet
        els={[
          f(
            "ii m7b5",
            "https://mrclay.org/sequence/songs/v4,80,2,p43p3fp30p3c-p41p29p38p3ep3c-p3ep3bp2bp37-p3cp3fp30p37",
            <>
              {note("i")}m -{" "}
              <b>
                {note("ii")}ø/{note("iv")}
              </b>{" "}
              - {note("V")} - {note("i")}m
            </>
          ),
        ]}
        desc={
          <p>
            The 2nd diatonic chord is uncommon in pop music, but in classical
            and jazz commonly leads to the {rom("V")}.
          </p>
        }
      />

      <ChordSet
        els={[
          f(
            "V/iv 7",
            "https://mrclay.org/sequence/songs/v4,40,0p25,p43p30p40p3ap37-j43j30j40j3aj37-j43j30j40j3aj37-p42j30j40j3aj37-p43p26j40p37p3cp3a-p46j26j40j37j3cj3a-p44p28j40j37j3aj3c-p43j28j40j37j3aj3c-p41p29p38p35-j41j29j38j35-j41j29j38j35-j41j29j38j35--",
            <>
              <b>{note("I")}7</b> - {note("iv")}m
            </>
          ),
          f(
            "V/V 7",
            "https://mrclay.org/sequence/songs/v4,45,0p25,p3f-p42p24-j42j24-p43j24p33p37p3c-j43j24j33j37j3c-j43j24j33j37j3c-p47j24j33j37j3c-p48p26-j26-j26p36p39p3c-j26j36j39j3c-j26j36j39j3c-j26j36j39j3cp4a-p2bp47j4a-j2bj47j4a-j2bp35p3bp3ej47j4a-j2bj35j3bj3ej47j4a-j2bj35j3bj3ej47j4ap41-j2bj35j3bj3ej41j47j4a-p3fp24-j3fj24-j3fj24-j3fj24-",
            <>
              {note("i")}m - <b>{note("II")}7</b> - {note("V")}7 - {note("i")}m
            </>
          ),
          f7(
            "V/bVI 7",
            "https://mrclay.org/piano/songs/C300C3c7C3ffC43pD432aC432tD3cc1D3fc4D30c8D43drC27e8C37edC3aelC3dexC48mtC46opD48ouC43qlD46qmD43skC41slD27twD3au2D3du4D37u5D41v2C2cv3C33vaC3cvcC3fvfD2c16jD3c16sD3f16sD3316u",
            <>
              {note("i")}m - <b>{note("bIII")}7</b> - {note("bVI")}
            </>
          ),
        ]}
        desc={
          <p>
            These are <strong>secondary dominants</strong> of the {rom("iv")},{" "}
            {rom("V")}, and {rom("bVI")} chords.
          </p>
        }
      />

      <ChordSet
        els={[
          f(
            "I 7",
            "https://mrclay.org/sequence/songs/v4,80,1,p2cp37p3cp33-p2cj33j37j3c-p35p37p22p3e-j35j37p22j3e-p24p3ap41p37-p24j3aj41j37-p3ap40p24p34-j40p24j34p3c",
            <>
              {note("bVI")}maj7 - {note("bVII")}6 - {note("I")}7sus -{" "}
              <b>{note("I")}7</b>
            </>
          ),
          f(
            "I maj7",
            "https://mrclay.org/piano/songs/C300C37cC3aeC3fmD304lD3a4yD3753D3f55C2e5sC3568C376aC3e6eD2ecfD35cpD37cuD3ecvC2cdvC33e6C37ecC3ceeD3co3C3bq3D2cskD37swD3bt3D33t6C24tqC34uaC37ubC3bulD24102D34103D37103D3b104C22111C35112C39112C3c11kD3c14nC3f15lD2218iD3518mD3f18rD3918uC2919gC3819nC3c19oC4319uD3c1llD431ltD381lyD291ly",
            <>
              {note("i")}m7 - {note("bVII")} - {note("bVI")}maj7 -{" "}
              <b>{note("I")}maj7</b> - {note("bVII")}add9 - {note("iv")}m(add9)
            </>
          ),
        ]}
        desc={
          <p>
            The parallel major tonic is sometimes used not as secondary
            dominant, but just because it sounds surprising but familiar.
          </p>
        }
      />

      <ChordSet
        els={[
          f(
            "V + vii",
            "https://mrclay.org/piano/songs/C240C30wC33yC371hC3e87D3789C3fabD3eaeC41cbD3fcjD24d6D33dhD30djD41eaC23emC3bezC3ff7C43feC41n5D43ngD23pjD3bpkD3fptD41qkC22qsC37r4C3arjC3frzC3exmD3fxpC3fzlD3ezyC4111vD3f126D2212iD3712oD3a12pC2913zC35147C3914sC3c14tD4114xD3c1gaD391gjD351glD291gl",
            <>
              {note("i")}m -{" "}
              <b>
                {note("V")}+/{note("vii")}
              </b>{" "}
              - {note("bIII")}/{note("bVII")} - {note("IV")}
            </>
          ),
        ]}
        desc={
          <p>
            This commonly follows the tonic triad, harmonizing the leading-tone
            bass note while keeping the other tones ({note("biii")} and{" "}
            {note("v")}) static.
          </p>
        }
      />

      <ChordSet
        els={[
          f7(
            "i m6",
            "https://mrclay.org/piano/songs/C460C2433C373jD463lC3f3xC454kC41hbD24i1D37i3D3fibD45ifC3ckeC3ekuD41l2C41lbC43m0C3bttD3b13yD3c13zD3e141D41149D4314eC30155C3315fC3715pC39161C3c16pD3c1hpD301igD371ijD391ijD331io",
            <>
              <b>{note("i")}m6</b> - {note("V")}7sus/{note("i")} - {note("V")}7/
              {note("vii")} - <b>{note("i")}m6</b>
            </>
          ),
          f7(
            "i mMaj7",
            "https://mrclay.org/sequence/songs/v4,55,0p5,p47p30p3bp37p33-j47j30j37j3bj33-p48j30j37j3bj33-p41j37j3bj33p2ej48-p43p2cp3fp38p3cj48-j43p2bj38j3cj3fj48-j43p29j38j3cj3f-j43j29j38j3cj3f-",
            <>
              <b>{note("i")}m(maj7)</b> - {note("bVI")}maj7 - {note("iv")}m9
            </>
          ),
          f(
            "i m6 VI",
            "https://mrclay.org/sequence/songs/v4,60,0p5,p43p30p3cp3f-j43p30j3cj3f-j43p30j3cj3f-p41p2ej3cj3f-p43p2dp3cp3f-j43p2dj3cj3f-j43p2dj3cj3f-p41p2dj3cj3f-p43p2cp3cp37p33-j43p2cj37j3cj33-j43p2cj37j3cj33-p2cj43j37j3cj33",
            <>
              {note("i")}m -{" "}
              <b>
                {note("i")}m6/{note("vi")}
              </b>{" "}
              - {note("iv")}m9
            </>
          ),
        ]}
        desc={
          <p>
            Added maj6 and maj7 extensions are common on minor chords in jazz
            and noir music.
          </p>
        }
      />

      <ChordSet
        els={[
          f7(
            "vii/V dim7",
            "https://mrclay.org/piano/songs/C300C377C3c7C3f9D3758D3059D3f5aD3c5dC336pC376qC3c6qC436rD3ch7D33i8D43ibD37ieC2ajeC33joC39jqC3cjrC42jwD42stD2at1D3ctbD39tcD33teC2bulC3cuuC3fuvC43uwD3c12uD43131D3f13hC3b14fC3e14gC4314hD3b1ikD3e1ivD2b1iwD431iy",
            <>
              {note("i")}m - {note("i")}m/
              {note("biii")} - <b>{note("#iv")}°7</b> - {note("i")}m/{note("V")}{" "}
              - {note("V")}
            </>
          ),
          f7(
            "vii/iv dim7",
            "https://mrclay.org/sequence/songs/v4,70,0p5,p24p3cp33-j24j3cj33-j24p48p37j3c-j24j48j37j3c-p28p46p3ap3dj37-j28p44j3aj3dj37-j28p43j3aj3dj37-j28p41j3aj3dj37-p29p44p3cp38-j29j44j3cj38-j29j44j3cj38-j29j44j3cj38--",
            <>
              {note("i")}m - <b>{note("iii")}°7</b> - {note("iv")}m
            </>
          ),
        ]}
        desc={
          <p>
            These are <strong>secondary leading-tone diminished</strong> chords
            naturally leading to the chords {rom("V")} and {rom("iv")}.
          </p>
        }
      />

      <ChordSet
        els={[
          f7(
            "subV/V 7",
            "https://mrclay.org/piano/songs/C300C335wC3769C3c6pC3f73D30atD33b1D37b2D3cbfD3fbuC24bwC38cuC3ccuC3fdbC42dqD24myD3cn8D38neD3fnmD42o4C2bobC37oxC3bp1C3epcC43puD3710aD3b10bD3e10iD2b10oD4310q",
            <>
              {note("i")}m -{" "}
              <b>
                {note("bVI")}7/{note("i")}
              </b>{" "}
              - {note("V")}
            </>
          ),
          f7(
            "subV 7",
            "https://mrclay.org/piano/songs/C300C3c26C3f53C4357D3093D3ca4D3fa6D43adC32ahC39dmC3cghC42gjD32l3D39ljD3clkD42lxC31mtC38myC3bnkC41nxD31xtD38y8D3byfD41ysC30z8C37zsC3c10aC3f10cD3719gD3c19jD3019kD3f19r",
            <>
              {note("i")}m - {note("V/V")}7 - <b>{note("bII")}7</b>
              {" - "}
              {note("i")}m
            </>
          ),
        ]}
        desc={
          <p>
            These are <strong>tritone substitutes</strong> for the chords{" "}
            {rom("V/V")} and {rom("V")} typically resolving to {rom("V")} and{" "}
            {rom("i")}. In sheet music you may find the 7th notated as an
            augmented 6th.
          </p>
        }
      />

      <ChordSet
        els={[
          f7(
            "V 7#9",
            "https://mrclay.org/piano/songs/C300C3f2rC432sC482sD3069D3f69D486aD436jC2b85C3b87C4188C4688D46d6C44dwD44gxC43i3D2bkoD3bl1D41l3D43l5C2bm9C30maC33mcD3010mD3310oD2b113",
            <>
              {note("i")}m - <b>{note("V")}7#9</b> - {note("i")}m/{note("v")}
            </>
          ),
          f7(
            "subV 7b5",
            "https://mrclay.org/piano/songs/C300C3774C3c76C3f80C438jD30ecD37f0D3cfaD3ffoD43fwC26gbC38hfC3chsC41hzD38ptD26qaD3cqcD41quC25rbC37rhC3bs1C41s8D25115C2413vD37149D3b14nD41162C3316bC3718kC3b1b7C3e1duC431gpD371tmD3b1tnD331tqD241twD431twD3e1tw",
            <>
              {note("i")}m - {note("ii")}ø7 - <b>{note("bII")}7b5</b> -{" "}
              {note("i")}m(maj9)
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
          f(
            "bI",
            "https://mrclay.org/piano/songs/C240C37zC3c1dC3f1vC432fD437fC438rD43asC44bgD44e6C43ezD43hdC41iqD24koD37l9D3cm8C23mgD3fmkD41n7C36n9C3bniC3fogD3612tD3b13dD3f13hD2313o",
            <>
              {note("i")}m - <b>{note("bI")}</b>
            </>
          ),
        ]}
        desc={
          <p>
            A borrowed chord from {note("bIII")} minor, the parallel minor mode
            of the relative major. It usually follows the tonic {note("i")}m to
            provide a mysterious change.
          </p>
        }
      />
    </section>
  );
}

export default MinorKeyChords;
