import { Char } from "../../music-theory/constants";
import React, { PropsWithChildren, ReactNode } from "react";

interface LabelProps extends PropsWithChildren {
  inKey?: true;
  lg?: true;
}

const Label = ({ children, inKey, lg }: LabelProps) => (
  <span className={[lg ? "lg" : "sm", inKey ? "in" : "out"].join(" ")}>
    {children}
  </span>
);

export const allScaleDegrees = [
  <Label lg inKey>
    1
  </Label>,
  <Label>
    <i>{Char.SHARP}</i>1/<i>{Char.FLAT}</i>2
  </Label>,
  <Label lg inKey>
    2
  </Label>,
  <Label>
    <i>{Char.SHARP}</i>2/<i>{Char.FLAT}</i>3
  </Label>,
  <Label lg inKey>
    3
  </Label>,
  <Label lg inKey>
    4
  </Label>,
  <Label>
    <i>{Char.SHARP}</i>4/<i>{Char.FLAT}</i>5
  </Label>,
  <Label lg inKey>
    5
  </Label>,
  <Label>
    <i>{Char.SHARP}</i>5/<i>{Char.FLAT}</i>6
  </Label>,
  <Label lg inKey>
    6
  </Label>,
  <Label>
    <i>{Char.FLAT}</i>7
  </Label>,
  <Label lg inKey>
    7
  </Label>,
] as const;

export const minorScaleDegrees = [
  <Label lg inKey>
    1
  </Label>,
  "",
  <Label lg inKey>
    2
  </Label>,
  <Label lg inKey>
    <i>{Char.FLAT}</i>3
  </Label>,
  "",
  <Label lg inKey>
    4
  </Label>,
  "",
  <Label lg inKey>
    5
  </Label>,
  <Label lg inKey>
    <i>{Char.FLAT}</i>6
  </Label>,
  "",
  <Label lg inKey>
    <i>{Char.FLAT}</i>7
  </Label>,
  "",
] as const;
