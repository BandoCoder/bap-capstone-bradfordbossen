import { Component } from "react";
import Tone from "tone";
import position from "./utilities/position";
//import { demoTrack } from "./utilities/demoTrack";
import { nullTrack } from "./utilities/nullTrack";

export default class Sequencer extends Component {
  constructor(props) {
    super(props);
    this.abswitch = this.abswitch.bind(this);
    this.updatePattern = this.updatePattern.bind(this);
    this.startStop = this.startStop.bind(this);
    this.changeTempo = this.changeTempo.bind(this);
    this.clearPattern = this.clearPattern.bind(this);
    this.positionMarker = this.positionMarker.bind(this);

    this.state = {
      bpm: 94,
      position: 0,
      playing: false,
      bside: false,
      currentPattern: nullTrack,
    };

    this.sampleOrder = [
      "kick",
      "snare",
      "closedHat",
      "openHat",
      "shaker",
      "shout",
    ];

    const multiSampler = new Tone.MultiPlayer({
      urls: {
        kick: "./samples/Kick.wav",
        snare: "./samples/snare.wav",
        closedHat: "./samples/closed-hat.wav",
        openHat: "./samples/open-hat.wav",
        shaker: "./samples/shaker.wav",
        shout: "./samples/shout.wav",
      },
    }).toMaster();

    const steps = Array(32)
      .fill(1)
      .map((v, i) => {
        return i;
      });

    const getColumns = (track) => {
      const result = [];
      for (let i = 0; i < 32; i += 1) {
        result.push(
          track
            .map((v, idx) => {
              return v[i] ? this.sampleOrder[idx] : null;
            })
            .filter((v) => v)
        );
      }
      return result;
    };
    this.columnPattern = getColumns(this.state.currentPattern);

    this.playSeq = new Tone.Sequence(
      (time, value) => {
        this.columnPattern[value].forEach((v) => {
          return multiSampler.start(v, time, 0, "16n", 0);
        });
      },
      steps,
      "16n"
    );
    this.playSeq.start();
    this.playSeq.loop = true;

    Tone.Transport.setLoopPoints(0, "2m");
    Tone.Transport.loop = true;
    Tone.Transport.scheduleRepeat(this.positionMarker, "16n");
    Tone.Transport.bpm.value = this.state.bpm;
  }
  componentDidMount() {
    document.addEventListener("keydown", (e) => {
      const pressed = e.key;
      if (pressed === " ") {
        this.startStop();
      }
    });
  }

  clearPattern() {
    this.setState({ currentPattern: nullTrack });
  }

  positionMarker() {
    this.setState({
      position: position[Tone.Transport.position.slice(0, 5)],
    });
  }

  startStop() {
    if (this.state.playing) {
      Tone.Transport.stop();
      this.setState({ playing: false });
    } else {
      Tone.Transport.start("+0.25");
      this.setState({ playing: true });
    }
  }

  changeTempo(e) {
    let newTempo = parseInt(e.currentTarget.value, 10);
    if (isNaN(newTempo)) {
      newTempo = 10;
    }
    if (newTempo > 200) {
      newTempo = 200;
    }
    Tone.Transport.bpm.value = newTempo;
    this.setState({ bpm: newTempo });
  }

  updatePattern(event) {
    const channelNum = parseInt(event.currentTarget.dataset.channel, 10);
    const stepNum = parseInt(event.currentTarget.dataset.stepindx, 10);
    const cpattern = this.state.currentPattern;
    if (cpattern[channelNum][stepNum]) {
      cpattern[channelNum][stepNum] = null;
      const colpattemp = this.columnPattern[stepNum].slice();
      const target = colpattemp.indexOf(this.sampleOrder[channelNum]);
      colpattemp.splice(target, 1);
      this.columnPattern[stepNum] = colpattemp;
      this.setState({ currentPattern: cpattern });
    } else {
      const newSamp = this.sampleOrder[channelNum];
      this.columnPattern[stepNum].push(newSamp);
      cpattern[channelNum][stepNum] = true;
      this.setState({ currentPattern: cpattern });
    }
    this.setState({ currentPattern: cpattern });
  }

  render() {
    return <div className="sequencer"></div>;
  }
}
