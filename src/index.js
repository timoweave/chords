import React from "react";
import ReactDOM from "react-dom";
import { C, B, E, F, G, A, D } from "./chord";
import { C6, ChordContextProvider, Amin, Chord } from "./chord";

export const App = () => {
  const intro1 = [
    <C6 label="C 6" />,
    <Chord label="E min" fret={[4, 4, 3, 0]} capo={2} />,
    <B label="B" />,
    <C label="C" />
  ];
  const chorus1 = [
    <C6 label="C6" />,
    <A label="A" />,
    <B label="B" />,
    <G label="G" />
  ];
  const chorus2 = [
    <C label="C" capo={1} />,
    <F label="F" />,
    <Amin label="A minor" />,
    <F label="F Major" />
  ];
  const outro1 = [
    <D label="D" />,
    <E label="E" />,
    <F label="F" />,
    <F label="F" fret={[4, 3, 0, -1]} />
  ];
  return (
    <ChordContextProvider>
      {
        <div style={{ textAlign: "center" }}>
          {intro1.map((chord, bar) => (
            <span key={bar}>{chord}</span>
          ))}
        </div>
      }
      {
        <div style={{ textAlign: "center" }}>
          {chorus1.map((chord, bar) => (
            <span key={bar}>{chord}</span>
          ))}
        </div>
      }
      {
        <div style={{ textAlign: "center" }}>
          {chorus2.map((chord, bar) => (
            <span key={bar}>{chord}</span>
          ))}
        </div>
      }
      {
        <div style={{ textAlign: "center" }}>
          {outro1.map((chord, bar) => (
            <span key={bar}>{chord}</span>
          ))}
        </div>
      }
    </ChordContextProvider>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
