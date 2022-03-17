import Link from "next/link";
import { useState } from "react";

export default function Profile() {
  const [name, setName] = useState("");
  const [dataurl, setDataurl] = useState("");
  const [filename, setFilename] = useState("");
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  const handleSubmit = async () => {};

  return (
    <div className="container mx-auto pt-5 mb-10 px-4">
      <div className="flex justify-start flex-wrap">
        <div className="w-2/5 flex items-center">
          <div
            className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl ease-in-out duration-500 flex-1"
            style={{ maxWidth: 340 }}
          >
            <div className="flex justify-center my-3">
              <div
                onClick={() => {
                  pickFile().then(([err, f]) => {
                    setDataurl(f.dataurl);
                    setFilename(f.file.name);
                  });
                }}
                style={{ backgroundImage: `url(${dataurl})` }}
                className="shadow-lg bg-cover rounded-full w-60 h-60 bg-blue-400 justify-center items-center flex text-4xl cursor-pointer text-white"
              >
                {dataurl ? "" : "P"}
              </div>
            </div>
            <div className="mb-3">
              <div className="text-sm mb-1">Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                className=" bg-gray-100 px-4 py-2 rounded-lg text-sm w-full ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
              />
            </div>
            <div className="mb-3">
              <div className="text-sm mb-1">Old Password</div>
              <input
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                type="password"
                className=" bg-gray-100 px-4 py-2 rounded-lg text-sm w-full ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
              />
            </div>
            <div className="mb-3">
              <div className="text-sm mb-1">Password</div>
              <input
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className=" bg-gray-100 px-4 py-2 rounded-lg text-sm w-full ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
              />
            </div>
            <div className="flex justify-center items-center mb-3">
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white text-sm rounded-lg py-2 px-4 my-3 active:scale-90 ease-in-out duration-300 shadow-sm w-full"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
