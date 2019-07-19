import React, { useState } from "react";
import { createContext, useContext } from "react";
import PropTypes from "prop-types";

export const chords = {
  // chord in fret numbers
  A: [2, 1, 0, 0],
  B: [4, 3, 2, 2],
  C: [0, 0, 0, 3],
  D: [2, 2, 2, 0],
  E: [4, 4, 4, 2],
  F: [2, 0, 1, 0],
  G: [0, 2, 3, 2],

  C6: [0, 0, 0, 0],

  Amin: [2, 0, 0, 0],
  EMin: [4, 4, 3, 2]
};

export const chordsInitState = {
  margin: 5,
  padding: 8, // chord padding
  width: 100, // chord width
  height: 150, // chord height
  radius: 6, // dot/cross/circle radius
  tunning: ["G", "C", "E", "A"],
  line: { stroke: "black", strokeWidth: 1 },
  cross: {
    stroke: "black",
    fill: "transparent",
    strokeLinecap: "round",
    strokeWidth: 3
  },
  circle: {
    stroke: "black",
    strokeWidth: "1",
    fill: "transparent"
  }
};

export const useChord = () => {
  const [state] = useState(chordsInitState);

  const getChordSize = frets => {
    const { width, height, padding, tunning } = state;

    return {
      width, // chord width
      height, // chord height
      w: (width - 2 * padding) / (tunning.length - 1), // string-string width
      h: (height - 2 * padding) / (frets - 1 + 0.5) // fret-fret height
    };
  };
  const getStrings = frets => {
    const { w, h, height } = getChordSize(frets);
    const { padding, tunning, line } = state;
    const x = i => i * w;

    return tunning
      .map((note, i) => ({
        note,
        style: line,
        x1: x(i),
        y1: 0,
        x2: x(i),
        y2: height - 2 * padding
      }))
      .map(note => ({
        ...note,
        x1: note.x1 + padding,
        y1: note.y1 + padding + h / 3,
        x2: note.x2 + padding,
        y2: note.y2 + padding - h / 6
      }));
  };
  const getFrets = frets => {
    const { line, padding } = state;
    const { width, h } = getChordSize(frets);
    const y = i => i * h + h / 3;

    return Array(frets)
      .fill(0)
      .map((_, i) => ({
        fret: i,
        style: line,
        x1: 0,
        y1: y(i),
        x2: width - 2 * padding,
        y2: y(i)
      }))
      .map((note, i) => {
        if (i !== 0) {
          return note;
        }
        return {
          ...note,
          x1: note.x1 - 0.5,
          x2: note.x2 + 0.5,
          style: {
            ...note.style,
            strokeWidth: 5
          }
        };
      })
      .map(note => ({
        ...note,
        x1: note.x1 + padding,
        y1: note.y1 + padding,
        x2: note.x2 + padding,
        y2: note.y2 + padding
      }));
  };
  const getCapo = (capo, frets) => {
    const { line, padding } = state;
    const { width, h } = getChordSize(frets);
    const y = (capo - 1 + 0.5) * h + h / 3;
    const style = {
      ...line,
      strokeWidth: 6,
      strokeLinecap: "round",
      display: capo === 0 ? "none" : "inherit"
    };

    return {
      style,
      x1: 0 + padding,
      y1: y + padding,
      x2: width - padding,
      y2: y + padding
    };
  };
  const getFingerTips = (fret = chords.C6, frets = 5) => {
    const { tunning, radius, padding } = state;
    const { w, h } = getChordSize(frets);
    const fingers = fret
      .map((f, i) => {
        const r = radius;
        const cx = i * w;
        const cy = f <= 0 ? -h / 3 : f * h - h / 2;
        return { key: tunning[i], f, r, cx, cy };
      })
      .map(f => ({
        ...f,
        cx: f.cx + padding,
        cy: f.cy + padding + h / 3
      }));
    return fingers;
  };
  return {
    ...state,
    getCapo,
    getStrings,
    getChordSize,
    getFrets,
    getFingerTips
  };
};

export const ChordContext = createContext(null);

export const ChordContextProvider = props => {
  const value = useChord();
  return (
    <ChordContext.Provider value={value}>
      {props.children}
    </ChordContext.Provider>
  );
};

export const Strings = ({ frets = 5 }) => {
  const { getStrings } = useContext(ChordContext);
  const verticals = getStrings(frets);

  return verticals.map(({ note, style, x1, y1, x2, y2 }, i) => (
    <line key={note} x1={x1} y1={y1} x2={x2} y2={y2} style={style} />
  ));
};

export const Frets = ({ frets = 5 }) => {
  const { getFrets } = useContext(ChordContext);
  const horizontals = getFrets(frets);

  return horizontals.map(({ fret, style, x1, y1, x2, y2 }) => (
    <line key={fret} x1={x1} y1={y1} x2={x2} y2={y2} style={style} />
  ));
};

export const Capo = ({ capo = 0, frets = 5 }) => {
  const { getCapo } = useContext(ChordContext);
  const { x1, y1, x2, y2, style } = getCapo(capo, frets);

  return <line x1={x1} y1={y1} x2={x2} y2={y2} style={style} />;
};

export const Dot = ({ cx, cy, r }) => {
  return <circle {...{ cx, cy, r }} />;
};

export const Circle = ({ cx, cy, r }) => {
  const { circle } = useContext(ChordContext);
  return <circle {...{ cx, cy, r: 0.775 * r }} {...circle} />;
};

export const Cross = ({ cx, cy, r }) => {
  const { cross } = useContext(ChordContext);
  const x = cx - r / 2;
  const y = cy - r / 2;
  const fall = `M ${x},${y} L ${x + r},${y + r}`;
  const raise = `M ${x},${y + r} L ${x + r},${y}`;
  return <path d={`${fall} ${raise}`} style={cross} />;
};

export const FingerTips = ({ fret, frets, capo = 0 }) => {
  const { getFingerTips } = useContext(ChordContext);
  const FingerTips = getFingerTips(fret, frets);

  return FingerTips.map(({ key, cx, cy, r, f }) => {
    const has_capo = capo > 0;
    switch (f) {
      case -1:
        return has_capo ? null : <Cross {...{ key, cx, cy, r }} />;
      case 0:
        return has_capo ? null : <Circle {...{ key, cx, cy, r }} />;
      default:
        return <Dot {...{ key, cx, cy, r }} />;
    }
  });
};

export const Label = ({ label = null }) => {
  const style = { textAlign: "center", fontFamily: "sans-serif" };
  return <div style={style}>{label}</div>;
};

export const Chord = ({ fret, capo = 0, frets = 5, label = null }) => {
  const { getChordSize, margin } = useContext(ChordContext);
  const { width, height } = getChordSize(frets);

  return (
    <div style={{ display: "inline-block", margin }}>
      <Label label={label} />
      <div style={{ width, height }}>
        <svg width={width} height={height}>
          <Strings frets={frets} />
          <Frets frets={frets} />
          <Capo capo={capo} frets={frets} />
          <FingerTips fret={fret} frets={frets} capo={capo} />
        </svg>
      </div>
    </div>
  );
};

Chord.propTypes = {
  label: PropTypes.string,
  chord: PropTypes.string,
  fret: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  frets: PropTypes.number
};

export const A = props => <Chord fret={chords.A} {...props} />;
export const B = props => <Chord fret={chords.B} {...props} />;
export const C = props => <Chord fret={chords.C} {...props} />;
export const D = props => <Chord fret={chords.D} {...props} />;
export const E = props => <Chord fret={chords.E} {...props} />;
export const F = props => <Chord fret={chords.F} {...props} />;
export const G = props => <Chord fret={chords.G} {...props} />;

export const C6 = props => <Chord fret={chords.C6} {...props} />;

export const Amin = props => <Chord fet={chords.Amin} {...props} />;
export const Emin = props => <Chord fet={chords.Emin} capo={2} {...props} />;
