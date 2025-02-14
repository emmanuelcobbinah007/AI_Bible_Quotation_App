import React, { useState, useEffect, useRef } from "react";
import { FaMicrophone } from "react-icons/fa";
import { RiRecordCircleLine } from "react-icons/ri";
import { BiSolidMicrophoneOff } from "react-icons/bi";
import { GiSoundWaves } from "react-icons/gi";

const DisplayBox = () => {
  const [listening, setListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [verses, setVerses] = useState([]);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    if (listening) {
      startRecording();
    } else {
      stopRecording();
    }
    return () => {
      stopRecording();
    };
  }, [listening]);

  const toggleListening = () => setListening((prev) => !prev);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          sendChunkToBackend(event.data);
        }
      };

      recorder.start(5000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setListening(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      setMediaRecorder(null);
    }
  };

  const sendChunkToBackend = async (audioChunk) => {
    if (!audioChunk || audioChunk.size === 0) {
      console.error("Audio chunk is empty or invalid.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioChunk, "chunk.wav");

    setIsUploading(true);

    try {
      const response = await fetch("http://localhost:5000/upload-chunk", {
        method: "POST",
        body: formData,
      });

      setIsUploading(false);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from backend:", errorData);
      } else {
        const data = await response.json();
        console.log("Chunk uploaded successfully:", data);
        if (data.verses && data.verses.length > 0) {
          setVerses(data.verses);
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.error("Failed to upload chunk:", error);
    }
  };

  return (
    <div>
      {/* Bible Verse Section */}
      <div className="text-center max-w-[90%] md:max-w-[700px] mx-auto mt-[70px] md:mt-[110px] p-4">
        {verses.length > 0 ? (
          verses.map((verse, index) => (
            <div key={index}>
              <div className="text-xl md:text-2xl font-semibold">
                {verse.reference} <span>(KJV)</span>
              </div>
              <div className="text-lg md:text-2xl">{verse.text}</div>
            </div>
          ))
        ) : (
          <div className="hidden text-lg md:text-2xl text-gray-500">
            No verses detected yet.
          </div>
        )}
      </div>

      {/* Main Content */}
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

        {isUploading && (
          <div className="text-sm text-gray-500">Uploading...</div>
        )}

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