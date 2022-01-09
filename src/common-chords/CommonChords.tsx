import React, { FC } from "react";
import Key from "../music-theory/Key";
import { useStore } from "../store";
import { getRenderers } from "./renderers";
import { SeventhTeaser } from "./SeventhTeaser";

interface Keyed {
  musicKey: Key;
}

export const Intro: FC<Keyed> = ({ musicKey }) => (
  <>
    <p>
      This is a non-exhaustive roundup of chords songwriters often employ in{" "}
      {musicKey.getQuality()} keys.
    </p>
    <p>
      If you usually think of a key as having <i>seven chords</i>, for writing
      purposes I encourage you to add these to your collection and get to know
      the sound of them within the key. Consider them ready-for-use while
      writing in {musicKey + ""}.
    </p>
  </>
);

function CommonChords({ musicKey }: Keyed) {
  const [relative] = useStore.relative();
  const { chords, f, f7, rom, note, Sep } = getRenderers(musicKey);

  return (
    <section>
      <h2>
        {chords(
          f("I maj7"),
          f("ii m7"),
          f("iii m7"),
          f("IV maj7"),
          f("V 7"),
          f("vi m7")
        )}
      </h2>
      <p>
        Many major key songs are made only from the first six{" "}
        <strong>diatonic chords</strong> (built solely with scale tones).
      </p>

      <h2>
        {chords(
          f7(
            "V/IV 7",
            "http://mrclay.org/piano/songs/C300C376C40iC466dD40f5D37f6D30f8D46fkC35gbC3cgfC45gqD45roD35rqD3crs"
          ),
          f(
            "V/V 7",
            "http://mrclay.org/piano/songs/C4c0C4a3bD4c3mC345jD4a5nC3760C3c6kC486oD48buC40csD37hqD34hsD3chxD40igC32iuC39iyC3cjgC42joD39oiD32okD42omD3cooC37pnC3bpnC3epoC43puD4310kD3e10oD3710qD3b10q"
          ),
          f(
            "V/vi 7",
            "http://mrclay.org/piano/songs/C300C37aC40yC437qD379kD309mD409qD43a6C34agC3baqC3ebaC44bmC47j8D3blsD34luD3elwD44m0D47mcC39mqC3cmsC40n6C45niD40yeD39yiD45yiD3cyk"
          ),
          f(
            "V/ii 7",
            "http://mrclay.org/piano/songs/C300C37aC4011C3e74D4078D308kD378mD3e9mC2d9mC349oC37aoC3dayC40guD34isD37iuD2diwD3djaD40jeC32jmC39jqC41k8D41viD32viD39vl"
          )
        )}
      </h2>
      <p>
        These are <strong>secondary dominants</strong> of the {rom("IV")},{" "}
        {rom("V")}, {rom("vi")} and {rom("ii")} chords.
      </p>
      <p>
        The secondary dominant of {rom("iii")}, {note("V/iii")}7, is pretty
        rarely used.
      </p>

      <h2>
        {chords(
          f(
            "ii m7b5",
            "http://mrclay.org/piano/songs/C340C3caC43yC406gD436sD3ca8D34aaD40b6C32bgC38byC41ccC3chsD32n8D38n8C30o4C37o8D3coaD41oeC40p4D40yiD30yoD37ys"
          ),
          f(
            "bIII maj7",
            "http://mrclay.org/piano/songs/C300C37aC40pC4153D405kD378iD308kD418qC339iC3a9lC43afC41d0D43dfC3efiD41fzC35iwD33jbD3ajcC39jmC3cjnD3ejqD35z3D39z7D3cze"
          ),
          f(
            "iv m7",
            "http://mrclay.org/piano/songs/C350C3cqC45wD35atD3cayD45bgC35bvC3ccpC44cyD35nkD3cnxD44o5C30owC37pjC40poC43q3D4011qD3711sD4311xD3011y"
          ),
          f(
            "v m7",
            "http://mrclay.org/piano/songs/C300C378C40hD409gD309sD379zC37auC3aawC3eayC41b2D37k8D3akaD3ekiD41kkC35lqC39lsC3cluC43lvD35xsD39xwD3cxyD43y0"
          ),
          f(
            "bVI maj7",
            "http://mrclay.org/piano/songs/C350C399C3cmC43qC416yD3c76D359sD39a8D43aqD41caC38ccC3ccgC3fd2C43d6C41iyD43j6D38luD3clwD3fmaC37ngC3bniD41nmC3eo6C43omD3bwwD37x4D3exmC30yuC37z4C40zoD43zyD3018oD4018sD3718y"
          ),
          f(
            "bVII 7",
            "http://mrclay.org/piano/songs/C300C372C404D378mD408oD308uC2e9wC35a2C3ea4D3eh4D35h8D2ehaC35ioC39isC3ciwD39syD35t1D3ct8"
          )
        )}
      </h2>
      <p>
        These are <strong>borrowed chords</strong> from the minor (aeolian)
        mode.
      </p>

      <h2>
        {chords(
          f7(
            "I 7",
            "http://mrclay.org/piano/songs/C400C3adC37pC301bC2b5vD305xC2eahD2basC30cyD2ed5C33feD30frD33gsC30ifD40tiD3atnD30tpD37tt"
          ),
          f7(
            "IV 7",
            "http://mrclay.org/piano/songs/C300C352sC392uC3c30D3032C3f3aD35aeC30aiC35d2D30d4D35fsC35hqD35k2D39k4D3fk4D3ck6C30kgC37kiC3akkC40kmD30xgD37xkD3axqD40xs"
          ),
          f7(
            "v m",
            "http://mrclay.org/piano/songs/C300C372C404C434D379rD439sD309sD409sC359sC3c9tC419tC459uD3ce6D45e8D41ecD35eeC37fiC3efkC43fkC46flD3eliD43lmD37lnD46loC35mgC3cmgC41mhC45miD45tuD35u0D41u2D3cu3 "
          ),
          f7(
            "bVI 7",
            "http://mrclay.org/piano/songs/C300C372C3a3C404D377uD4081D3a82D3086C2c9cC339gC369jC3c9kD3cb8C3cc7D36fpD33fuD3cfvD2cg5C33h0C35h1C39h2C3ch3D3ctyD33u2D35u6D39ua"
          ),
          f7(
            "bVII 7",
            "http://mrclay.org/piano/songs/C300C371C3aaC40mC434aD406jD309tD379uD3aa3D43auC2eayC35b6C3ebkC44ccC41lrD2em6D35m7D3embD44mcC35nwD41nwC39o2C3coiC3fojD3czxD3f107D3510bD3910c"
          )
        )}
      </h2>
      <p>
        These are often used in rock &amp; blues with the 7th notes just for
        color rather than serving a dominant function.
      </p>

      <h2>
        {chords(
          f(
            "vii m7b5",
            "http://mrclay.org/piano/songs/C300C374C406D30bcD37bcD40biC2fc2C35ccC39ckC3ecmD35jiD39jmD3ejuD2fk5C34kiC38kmC3bkmD34scD38scD3bskC35tcC39teC3ctfD3514zD3c152D3915c"
          )
        )}
      </h2>
      <p>
        The 7th diatonic chord is far less popular and generally only used for
        leading into {rom("V/vi")} ({note("III")}7).
      </p>

      <h2>
        {chords(
          f(
            "I +",
            "http://mrclay.org/piano/songs/C300C374C406D30bcD37bcD40biC2fc2C35ccC39ckC3ecmD35jiD39jmD3ejuD2fk5C34kiC38kmC3bkmD34scD38scD3bskC35tcC39teC3ctfD3514zD3c152D3915c"
          ),
          f(
            "V/vi + /#V",
            "http://mrclay.org/piano/songs/C390C3c6C40sD396yD3c7cD407pC388nC3c93C409pD38ktD3ckxD40l7C37maC3cmjC40n1D37u5D3cudD40umC32v2C36vhC39vsC3cwdD3216rD3616xD39171D3c178"
          )
        )}
      </h2>
      <p>
        These are often used as passing chords between {note("I")} and{" "}
        {note("vi")}m to harmonize the note {note("#v")}.
      </p>

      <h2>
        {chords(
          f7(
            "#i dim7",
            "http://mrclay.org/piano/songs/C300C374C3c6C408D3c87D308cD408jD378uC319kC379wC3aa0C40a2D37i2D31i4D3ai7D40ieC32jkC39joC3cjqC41jsD32twD39u0D41u1D3cu8"
          ),
          f7(
            "#iv dim7",
            "http://mrclay.org/piano/songs/C350C392C3ceC41xD416oD357aC368aC3f8eD3ffuD39g8D3cgeD36goC37heC3chsC40i8D37qaC2dqeD3cqkD40quC34reC37ryC3ds8D37128D3412aD2d12iD3d12k"
          ),
          f7(
            "#v dim7",
            "http://mrclay.org/piano/songs/C300C375C4012D309xD37afC2cahD40ahC35avC3bbfC3ebtD2ckdD35kpD3bkvD3ekzC2dlfC34ltC39m5C3cmnD34y9D2dyfD39ylD3cyr"
          )
        )}
      </h2>
      <p>
        These are <strong>secondary leading-tone diminished</strong> chords,
        functioning as {rom("vii")} of the chords {rom("ii")}, {rom("V")}, and{" "}
        {rom("vi")}.
      </p>
      <p>
        {note("#ii")}dim7 is sometimes called a "passing-tone" diminished 7th
        with {note("ii")} passing to {note("iii")}
        —or vice versa—but it may be clearer to think of it as an inversion of{" "}
        {note("#iv")}dim7.
      </p>

      <SeventhTeaser>
        <h2>
          {chords(
            f7(
              "bVII maj7",
              "http://mrclay.org/piano/songs/C300C379C3biC40pD4058C4062D4074C407vD30b0D37b6D3bboD40ccC2eceC35ciC39d0C3edfD3eizC3ejyD3eoaC41pmD2eroD35rqD39s1D41saC30slC37syC3btcC40tgD3013yD40141D3b142D37144"
            )
          )}
        </h2>
        <p>
          This is borrowed from the mixolydian mode due to the presence of the
          note {note("vi")}.
        </p>

        <h2>
          {chords(
            f7(
              "V 7b9",
              "http://mrclay.org/piano/record/C320C39hC3cjC4111C4517D3c9hD329xD39ahD41ajD45apC2bavC32bdC3bbjC41c0C44chD2bmnD32mwD3bn9D41nfD44nlC30o3C37ojC40oxC43p5D40x9D37xdD43xdD30xj"
            ),
            f7(
              "vii dim7",
              "http://mrclay.org/piano/songs/C300C378C3cdC40kC485fC477jD487qC489pD47a3D37ajD30aqD3carD40azD48b9C2fbkC35btC38bxC3ec8C4ac9C41fdD4afhC43hhD41hpC44kpD43kzD35pdD2fpfD38plD3epsD44qqC30qrC37qxC3cr2C40rfD37111D3c114D40114D30115"
            )
          )}
        </h2>
        <p>
          These are from the harmonic minor mode, and usually go to {rom("I")}.
        </p>

        <h2>
          {chords(
            f7(
              "iv mMaj7",
              "http://mrclay.org/piano/songs/C300C34eC3718C3c7yC3eakD3cb2D34c4D30c6D37c8D3ecwC35d4C38diC3cdsC40eiC3eo8D40ogD38q0D35q1D3cqaC34rcC37rgD3eroC3cs8D3c12bD3412qD3712r"
            ),
            f7(
              "bVII 7#11",
              "http://mrclay.org/piano/songs/C320C35cC39rC3c16C415wC3e91D4194D35a9D32aaD39alD3cayD3ebcC2ebnC35bzC38c0C3ackC40d2C3eliD40ltD2emhD35mkD38moD3amzC30o6D3eo8C34oaC37odC3cosD3010wD3c10zD37110D34112"
            )
          )}
        </h2>
        <p>
          The notes {note("bVI")} and {note("iii")} in these chords help evoke
          the altered mode <em>mixolydian b6</em>, which is basically aeolian
          but with a distinctive major 3rd.
        </p>

        <h2>
          {chords(
            f7(
              "subV/V 7",
              "http://mrclay.org/piano/songs/C300C37kC3coC40xD307oD3c7wD3782D408kC2c8nC3399C3c9aC429lD2ch0D33hcD3ci2C2bi5D42i9C32iuC3bj7C43jnD32s4D3bs5D2bsaD43sh"
            ),
            f7(
              "subV 7",
              "http://mrclay.org/piano/songs/C320C39vC3cyC411gD3293D3996D3c9gC319uD41a0C38agC3bayC41bgD38lmD31loD3bmaC30mkD41muC37ngC3bnwC40oaD3011eD3711eD3b11gD4011u"
            )
          )}
        </h2>
        <p>
          These are <strong>tritone substitutes</strong> for the chords{" "}
          {rom("V/V")} and {rom("V")} typically resolving to {rom("V")} and{" "}
          {rom("I")}. In sheet music you may find the 7th notated as an
          augmented 6th.
        </p>

        <h2>{chords(f7("bII maj7"))}</h2>
        <p>
          Borrowed from phrygian, {rom("bII")} most often appears following{" "}
          {rom("V/V")}, {rom("ii")}, or {rom("bVI")} and often goes to{" "}
          {rom("I")} or {rom("V")}.
        </p>

        <h2>{chords(f("ii/ii m7b5"), f("ii/IV m7b5"), f("ii/vi m7"))}</h2>
        <p>
          These sometimes function as "secondary predominants", appearing before
          secondary dominants {rom("V/ii")}, {rom("V/IV")}, or {rom("V/vi")} (or
          before their equivalent secondary leading-tone diminished chords).
        </p>

        <h2>
          {chords(f("V 7b9"), f("V 7#9"), f("subV 7b5"))}
          <Sep /> etc.
        </h2>
        <p>
          In jazz, dominant 7th chords are often "altered" with their 5th and/or
          9th chord tones lowered or raised. These are just some examples.
        </p>
      </SeventhTeaser>
    </section>
  );
}

export default CommonChords;
