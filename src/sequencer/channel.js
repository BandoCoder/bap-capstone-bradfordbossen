import React, { PropTypes } from "react";

const Channel = (props) => {
  function makeRow(v, i) {
    const channelClasses = v ? "lighton" : "lightof";

    return (
      <div
        className="stepbutton"
        data-channel={props.channelNum}
        data-stepindx={props.i}
        onClick={props.updateSeq}
        key={`c${v}s${i}`}
      >
        <div className={channelClasses} />
      </div>
    );
  }
  return <div className="sequenceRow">{props.channel.map(makeRow, this)}</div>;
};

Channel.propTypes = {
  channelNum: PropTypes.number.isRequired,
  bside: PropTypes.bool.isRequired,
  updateSeq: PropTypes.func.isRequired,
  channel: PropTypes.array.isRequired,
};

export default Channel;
