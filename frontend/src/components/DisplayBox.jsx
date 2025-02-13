import React from 'react'
import { FaMicrophone } from "react-icons/fa";
import { RiRecordCircleLine } from "react-icons/ri";

const DisplayBox = () => {
return (
    <div>
    <div className='text-center max-w-[90%] md:max-w-[700px] mx-auto mt-[70px] md:mt-[110px] p-4 hidden'>
            <div className='text-xl md:text-2xl font-semibold'>Romans 8:28 <span>(NIV)</span></div>
            <div className='text-lg md:text-2xl'>And we know that in all things God works for the good of those who love him, who have been called according to his purpose.</div>
    </div>

    <div
            className="flex flex-col justify-center items-center space-y-4 bg-white p-4 rounded-3xl w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] mt-4 text-center text-sm md:text-base mx-auto"
            style={{ position: "absolute", top: "80%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
            <div className="p-4 rounded-full bg-[#ECECEC] my-2"><RiRecordCircleLine /></div>
            <p className="w-[80%] md:w-[70%] lg:w-[60%] text-sm md:text-md">
                Transcribing and detecting Bible quotations in real time.
            </p>
            <button className="flex items-center justify-center text-sm md:text-md bg-[#1A1A1A] rounded-full text-white py-2 px-6"><FaMicrophone className="mr-1"/> Start Listening</button>
        </div>

    </div>
)
}

export default DisplayBox