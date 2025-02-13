import React, { useState, useEffect } from "react";
import { FaMicrophone } from "react-icons/fa";
import { RiRecordCircleLine } from "react-icons/ri";
import { BiSolidMicrophoneOff } from "react-icons/bi";
import { GiSoundWaves } from "react-icons/gi";

const DisplayBox = () => {
  const [listening, setListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    if (listening) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [listening]);

  const toggleListening = () => {
    setListening(!listening);
    console.log(listening ? "Stopped Listening" : "Listening");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          sendChunkToBackend(event.data);
        }
      };

      recorder.start(1000); // Collect audio data in 1-second chunks
    } catch (error) {
      console.error("Failed to start recording:", error);
      toggleListening();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const sendChunkToBackend = (audioChunk) => {
    const formData = new FormData();
    formData.append("audio", audioChunk, "chunk.wav");

    fetch("https://your-backend-url.com/upload-audio", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Chunk uploaded successfully:", data);
      })
      .catch((error) => {
        console.error("Failed to upload chunk:", error);
      });
  };

  return (
    <div>
      <div className="text-center max-w-[90%] md:max-w-[700px] mx-auto mt-[70px] md:mt-[110px] p-4 hidden">
        <div className="text-xl md:text-2xl font-semibold">
          Romans 8:28 <span>(NIV)</span>
        </div>
        <div className="text-lg md:text-2xl">
          And we know that in all things God works for the good of those who
          love him, who have been called according to his purpose.
        </div>
      </div>

      <div
        className={`flex flex-col justify-center items-center space-y-4 bg-white p-4 rounded-3xl w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] mt-4 text-center text-sm md:text-base mx-auto`}
        style={{
          position: "absolute",
          top: "80%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="p-4 rounded-full bg-[#ECECEC] my-2 text-3xl">
          {listening ? <GiSoundWaves /> : <RiRecordCircleLine />}
        </div>
        <p className="w-[80%] md:w-[70%] lg:w-[60%] text-sm md:text-md">
          {listening
            ? "Listening and detecting Bible quotations in real time..."
            : "Transcribing and detecting Bible quotations in real time."}
        </p>
        <button
          className={`flex items-center justify-center text-sm md:text-md rounded-full py-2 px-6 transition-transform transform hover:scale-105 focus:outline-none duration-400 hover:shadow-lg ${
            listening
              ? "bg-[#FFDCDB] text-[#FF6259]"
              : "bg-[#1A1A1A] text-white"
          }`}
          onClick={toggleListening}
        >
          {listening ? (
            <>
              <BiSolidMicrophoneOff className="mr-1" /> Stop Listening
            </>
          ) : (
            <>
              <FaMicrophone className="mr-1" /> Start Listening
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DisplayBox;
