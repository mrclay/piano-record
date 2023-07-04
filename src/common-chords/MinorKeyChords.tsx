import React from "react";
import { ChordSet } from "./ChordSet";
import { Keyed } from "./Intro";
import { getRenderers } from "./renderers";

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
      />

      <p>
        Many minor key songs are made only from the these six{" "}
        <strong>diatonic chords</strong> (built solely with scale tones).
      </p>

      <ChordSet
        els={[
          f(
            "V 7",
            "http://mrclay.org/piano/songs/C300C37eC3cqC3fsD3084D3f8cD378gD3c8wC2c90C339qC3c9rC3f9yD2ciwD33j2D3cjjD3fjnC2bk2C32kkC3bkoC41l1C43qdD2bv6D3bvcD32vkD43voD41vqC30weC37wgC3cwqD37178D3017dD3c17g",
            <>
              {note("i")}m - {note("bVI")} - <b>{note("V")}7</b> - {note("i")}m
            </>
          ),
          f7(
            "vii dim7",
            "http://mrclay.org/piano/songs/C300C37iC3fmC43uC4f3eC5365D4f6eC5492D539cD309yD37a4D3faaD43aiC32b6D54beC38biC41bmC47byC53coC50faD53fmD50i0C4fi0C4akyD4fl6D32n0D38n8D41naD47ncC33o8D4aogC3comC43ouC48p2C4bpwD33zqD3czsD48zuD43zwD4bzy",
            <>
              {note("i")}m - <b>{note("vii")}°7</b> - {note("i")}m/
              {note("biii")}
            </>
          ),
        ]}
      />

      <p>
        The <strong>dominant</strong> chord ({rom("V")}) is very commonly used
        and was nearly always used instead of {rom("v")} in classical music.
      </p>
      <p>
        The leading-tone diminished chord has three chord tones in common with{" "}
        {note("V")}7, and so has a similar sound.
      </p>

      <ChordSet
        els={[
          f(
            "ii m7",
            "http://mrclay.org/piano/songs/C300C37kC3f10C4826C47amD48asC48diD47doC4aggD48giC4bjaD4ajiC4dmcD4bmiD37n2D30n8D3fncD4dooC32oqC39ouC3cowC41piC4fpsD39ysD32z4D3czdD41zoC3710kC3e112C41114C4711cD471c8D3e1caD411ccD371cgD4f1ck",
            <>
              {note("i")}m - <b>{note("ii")}m7</b> - {note("V")}7
            </>
          ),
          f(
            "IV 7",
            "http://mrclay.org/piano/songs/C300C37oC3auC3f14C4a6mC489fD4a9nC46c8D48cbD37d3D30d8D3ad9D3fdgC35ekD46elC39erC3ceuC3ff7C45fiC46i3D45idC41kzD46l4D35mvD39mzD3cn3D3fn4D41n6C30nlC37nxC3anyC3fnzC43o1D4311hD3a11pD3f11qD3711rD3011x",
            <>
              {note("i")}m7 - <b>{note("IV")}7</b> - {note("i")}m7
            </>
          ),
        ]}
      />

      <p>
        These are two <strong>borrowed chords</strong> from the dorian mode.
      </p>

      <ChordSet
        els={[
          f(
            "bII maj7",
            "http://mrclay.org/piano/songs/C430C421vD432bC303cD423nC373rC3c49C3f4dC434hC42c1D43cbC43elD42erD3fhtC3fhuD43i1D30kdD37khD3ckhD3fkjC31lnC35lvC38m8C3cmjC41mtD41w5C41xbC40zfD31znD35zrD41ztD38zxD3czzC2b113C3211fD4011hC3511jC3b121C41125C3e181D4118gC411abD3e1ahC3e1c9D411crD2b1dlD321dnD351dvD3b1dzC301etD3e1fdC371ffC3c1ffC3f1fnD3f1pxD3c1qbD301qbD371qf",
            <>
              {note("i")}7 - <b>{note("bII")}maj7</b> - {note("V")}7 -{" "}
              {note("i")}m
            </>
          ),
          f(
            "bvii m7",
            "http://mrclay.org/piano/songs/C300C378C3cgC3fyC4a16C487yD4a84D30c8D37cbD3ccdD3fcgD48dgC2edmC35doC3adqC3de8C48emC46h6D48heC43jqD46jwC41m6D43mgD2eneD35ngD3anqD3dnyC2cowC33p2C3cp8D41peC43pwC41116D4311oD3c12oD3312wD2c134D4113uC37144C3b145C3e147C4314sD431hbD3e1hqD371hsD3b1hu",
            <>
              {note("i")}m - <b>{note("bvii")}m</b> - {note("bVI")}maj7 -{" "}
              {note("V")}
            </>
          ),
        ]}
      />

      <p>Two more borrowed chords from the phrygian mode.</p>

      <ChordSet
        els={[
          f(
            "ii m7b5",
            "http://mrclay.org/piano/songs/C300C37sC3fuC431aD308kD3f92D379aC359iD439kC38a4C3eaeC41ayD35jiD38juD3ek6D41keC2bkkC37l8C3bliC3em2D2bvaD37vwD3bvyD3ewaC30wcC37x8C3cxgC3fy6D3c1auD3f1avD301ayD371ay",
            <>
              {note("i")}m -{" "}
              <b>
                {note("ii")}°/{note("iv")}
              </b>{" "}
              - {note("V")} - {note("i")}m
            </>
          ),
        ]}
      />

      <p>
        The 2nd diatonic chord is uncommon in pop music, but in classical and
        jazz commonly leads to the {rom("V")}.
      </p>

      <ChordSet
        els={[
          f(
            "V/iv 7",
            "http://mrclay.org/piano/songs/C300C37hC3ahC4016C431dC428qD438uC43b6D42bcC46djD43dkC44g4D46gbC43iyD44j7D30l0D40l4D3al6D37l8C35mgD43miC38n1C3cnmC41o0D3c10eD3510iD3810iD4110j",
            <>
              <b>{note("I")}7</b> - {note("iv")}m
            </>
          ),
          f(
            "V/V 7",
            "http://mrclay.org/piano/songs/C3f0C3026C422bD305wC337eC377jC3c7kC437nD427uD3f7vC47f5D3cfbD37fdD43fjD33fmC32hdC48hhD47hpC36m5C39mbC3cmdD48mlC4atiD36tnD39tvD32tyD3cu6C37vzC47w0D4awbC3b119C3e11bC4111dD3711jD471a2D411a3D3b1a5D3e1a6",
            <>
              {note("i")}m - <b>{note("II")}7</b> - {note("V")}7
            </>
          ),
          f7(
            "V/bVI 7",
            "http://mrclay.org/piano/songs/C300C37mC3fqC43sD432eC4333D37duD30dvD3fe3C33flC37fwC3agcC3dggD43moC48osC46qtD48r2C43ssD46suC41ueD43ukD37vgD33viD3avmD3dvwD41wcC2cwoC33wvC38wwC3cwyC3fx8D2c188D3818aD3f18bD3318eD3c18q",
            <>
              {note("i")}m - <b>{note("bIII")}7</b> - {note("bVI")}
            </>
          ),
        ]}
      />

      <p>
        These are <strong>secondary dominants</strong> of the {rom("iv")},{" "}
        {rom("V")}, and {rom("bVI")} chords.
      </p>

      <ChordSet
        els={[
          f(
            "I 7",
            "http://mrclay.org/piano/songs/C2c0C33gC37kC3coD2c5oD375uD3364D3c67C2e6uC3576C3778C3c7hD2eegD37emD35euD3ceyC30foC37g0C3ag1C41geD41nqC40p6D37xsD30xuD3axvD40xw",
            <>
              {note("bVI")}maj7 - {note("bVII")}6 - {note("I")}7sus -{" "}
              <b>{note("I")}7</b>
            </>
          ),
          f(
            "I maj7",
            "http://mrclay.org/piano/songs/C300C379C3aeC3fpD375yD3a60D3066D3f68C2e76C3578C3a7aC3e7rD35drD2edsD3advD3ee6C2cf5C33f6C37feC3cfgD3cozC3bqaD2csyD37t6D33t8D3btcC30u0C34ubC37ufC3bukD3011eD3b11oD3711qD3411sC2e12fC3212iC3512sC3c136D3c174C3f17nD3f1azD2e1b0D351baD321beC351byC381c0C3c1c2C431c5D381pqD3c1puD351pwD431q2",
            <>
              {note("i")}m7 - {note("bVII")} - {note("bVI")}maj7 -{" "}
              <b>{note("I")}maj7</b> - {note("bVII")}add9 - {note("iv")}m(add9)
            </>
          ),
        ]}
      />

      <p>
        The parallel major tonic is sometimes used not as secondary dominant,
        but just because it sounds surprising but familiar.
      </p>

      <ChordSet
        els={[
          f(
            "V + vii",
            "http://mrclay.org/piano/songs/C300C33gC37yC3e80C3f9iD3e9oC41b6D30b8D3fbaD33biD37bwC2fd0C33d4D41d8C37dqC43eeC41kgD43kqC3eo2D41o6D2fpwD33qaD37qmC2er8D3ercC33rkC37ruC3fsoC41ysD3fz8D2e14uD33152D37156C2d162D4116aC3516eC3916oC3c178D391iwD3c1iyD351jcD2d1je",
            <>
              {note("i")}m -{" "}
              <b>
                {note("V")}+/{note("vii")}
              </b>{" "}
              - {note("bIII")}/{note("bVII")} - {note("IV")}/{note("vi")}
            </>
          ),
        ]}
      />

      <p>
        This commonly follows the tonic triad, harmonizing the leading-tone bass
        note while keeping the other tones ({note("biii")} and {note("v")})
        static.
      </p>

      <ChordSet
        els={[
          f7(
            "i m6",
            "http://mrclay.org/piano/songs/C460C301wD4624C372mC3f2yC453qD45hqC41jcD30laD37loD3fmiD41mkC3cmoC3en8C41nqC43o4D3ct6C3bveD3b126D4112qD3e12uD4312wC3013qC3313sC3714cC3914pC3c14uD371kcD391keD3c1kgD301kiD331ko",
            <>
              <b>{note("i")}m6</b> - {note("V")}7sus/{note("i")} - {note("V")}7/
              {note("vii")} - <b>{note("i")}m6</b>
            </>
          ),
          f7(
            "i mMaj7",
            "http://mrclay.org/piano/songs/C300C37jC3bzC3f11C471nC4893D47ahD48anC41bhD3befD41ehD30enD37evD3ff1C38g1C3cg3C3fgbC43gxC37knD37ofC35pcD3815sD3c15tD3515wD43160D3f163",
            <>
              <b>{note("i")}m(maj7)</b> - {note("bVI")}maj7 - {note("iv")}m9
            </>
          ),
          f(
            "i m6 VI",
            "http://mrclay.org/piano/songs/C300C37hC3cpC3frC43tD439lC41bcD41c7D37d7D3cdbD30ddD3fdfC2depC37evC3cezC3ff7C43ffD43nuC41qmD41shD37sjD3cskD2dslD3fsrC35ttC38u5C3cufC3fuhC43upD3c18tD3518vD38193D3f19bD4319n",
            <>
              {note("i")}m -{" "}
              <b>
                {note("i")}m6/{note("vi")}
              </b>{" "}
              - {note("iv")}m9
            </>
          ),
        ]}
      />

      <p>
        Added maj6 and maj7 extensions are common on minor chords in jazz and
        noir music.
      </p>

      <ChordSet
        els={[
          f7(
            "vii/V dim7",
            "http://mrclay.org/piano/songs/C300C37mC3cvC3fvC4314D306wD3c72D3774D3f7bD437oC337uC378hC3c8hC3f8uC4392D33giD37goD3cgxD3fh6D43hiC36i0C39iqC3ciuC3fj0C42jbD39qjD3cquD3fqwD36r2D42r6C37rxC3cs6C3fsgC43syD3cwcD3fweC3bxoC3exqD3e18qD3b18sD3718yD4318z",
            <>
              {note("i")}m - {note("i")}m/
              {note("biii")} - <b>{note("#iv")}°7</b> - {note("i")}m/{note("V")}{" "}
              - {note("V")}
            </>
          ),
          f7(
            "vii/iv dim7",
            "http://mrclay.org/piano/songs/C300C3754C3c5eC3f6aC436eC4870D37boD30bwD3cc0D3fc8D43cmD48cwC34d2C37d6C3adkC3ddsC46eqC44hmD46hyC43k8D44koC41mjD43msD37npD3anxD34o2D3do4C35osC38ozC3cp0D41p4C41pgC44pxD4413qD4113uD3513wD3813yD3c140",
            <>
              {note("i")}m - <b>{note("iii")}°7</b> - {note("iv")}m
            </>
          ),
        ]}
      />

      <p>
        These are <strong>secondary leading-tone diminished</strong> chords
        naturally leading to the chords {rom("V")} and {rom("iv")}.
      </p>

      <ChordSet
        els={[
          f7(
            "subV/V 7",
            "http://mrclay.org/piano/songs/C300C334uC3756C3c5yC3f67D33awD37b7D3cbcD3fbgC38caC3ccqC3fd9C42doD30ooD3cosD38owD3fpcD42pcC37pyC3bqhC3eqqC43r1D3714dD3b14eD3e14iD4314m",
            <>
              {note("i")}m -{" "}
              <b>
                {note("bVI")}7/{note("i")}
              </b>{" "}
              - {note("V")}
            </>
          ),
          f7("subV 7", ""),
        ]}
      />

      <p>
        These are <strong>tritone substitutes</strong> for the chords{" "}
        {rom("V/V")} and {rom("V")} typically resolving to {rom("V")} and{" "}
        {rom("i")}. In sheet music you may find the 7th notated as an augmented
        6th.
      </p>

      <ChordSet
        els={[
          f7(
            "V 7#9",
            "http://mrclay.org/piano/songs/C300C3c2qC3f2uC432vD3060D3f68D3c6aD436eC378cC3b8eC418fC468gD46fxC44h4D44j2C43juD3blqD37m4D41m6C30n0C37n6C3fnaD37ywD3fyyD43z2D30z4",
            <>
              {note("i")}m - <b>{note("V")}7#9</b> - {note("i")}m
            </>
          ),
          f7(
            "subV 7b5",
            "http://mrclay.org/piano/songs/C300C37sC3ctC3f1eC4322D30boD37ceD3cd5D3fdaD43dgC32e3C38erC3cfaC41fyD32mgD38moD3cn0D41niC31nkC37o6C3bomC41p4D31w9D37x8D3bxgC30xiD41xqC33zlC37113C3b13yC3e160C431amD331nqD301nsD371nxD3b1o2D3e1o6D431oa",
            <>
              {note("i")}m - {note("ii")}ø7 - <b>{note("bII")}7b5</b> -{" "}
              {note("i")}m(maj9)
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
          f(
            "bI",
            "http://mrclay.org/piano/songs/C300C33eC37wC3c1gC431kD437aC4384C44acD43amC43d4D44diC41gaD43gkD33isD30iyD37j4D3cjeC2fk4C33keC36kmC3bl0C3fl2D41l2D3fzsD36zwD33zyD3bzyD2f102",
            <>
              {note("i")}m - <b>{note("bI")}</b>
            </>
          ),
        ]}
      />

      <p>
        A borrowed chord from {note("bIII")} minor, the parallel minor mode of
        the relative major. It usually follows the tonic {note("i")}m to provide
        a mysterious change.
      </p>
    </section>
  );
}

export default MinorKeyChords;
