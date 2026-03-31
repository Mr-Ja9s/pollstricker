import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [poll, setPoll] = useState(null);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  // Create a new poll
  const createPoll = async () => {
    const res = await axios.post("http://localhost:5000/create", {
      question,
      options: options.map((text) => ({ text, votes: 0 })),
    });
    setPoll(res.data);
  };

  // Fetch a poll by id (you can later add an input for poll id)
  const getPoll = async (id) => {
    const res = await axios.get(`http://localhost:5000/poll/${id}`);
    setPoll(res.data);
  };

  // Vote for an option
  const vote = async (index) => {
    if (!poll) return;
    await axios.post(`http://localhost:5000/vote/${poll._id}`, {
      optionIndex: index,
    });
  };

  useEffect(() => {
    socket.on("voteUpdate", (updatedPoll) => {
      if (poll && updatedPoll._id === poll._id) {
        setPoll(updatedPoll);
      }
    });
    return () => socket.off("voteUpdate");
  }, [poll]);

  return (
    <div style={{ padding: 30 }}>
      <h1>🗳 Real-Time Polling System</h1>

      {!poll ? (
        <div>
          <h3>Create a Poll</h3>
          <input
            placeholder="Enter question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <br />
          {options.map((opt, i) => (
            <input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {
                const newOpts = [...options];
                newOpts[i] = e.target.value;
                setOptions(newOpts);
              }}
            />
          ))}
          <br />
          <button onClick={() => setOptions([...options, ""])}>+ Add Option</button>
          <br />
          <button onClick={createPoll}>Create Poll</button>
        </div>
      ) : (
        <div>
          <h2>{poll.question}</h2>
          {poll.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => vote(i)}
              style={{ display: "block", margin: "10px 0" }}
            >
              {opt.text} — {opt.votes} votes
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

