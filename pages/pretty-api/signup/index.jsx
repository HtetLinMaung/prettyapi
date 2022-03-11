import Link from "next/link";
import { useState } from "react";
import { pickFile } from "@jst_htet/file-picker";
import rest from "../../../utils/rest";
import { showToast } from "../../../utils/toast";
import { useRouter } from "next/router";

export default function Signup() {
  const router = useRouter();
  const [ownerid, setOwnerId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [dataurl, setDataurl] = useState("");
  const [filename, setFilename] = useState("");

  const register = async (profile = "") => {
    const [res, err] = await rest.post("/auth/register", {
      ownerid,
      name,
      password,
      profile,
    });

    if (!err) {
      router.push("/pretty-api/login");
    } else {
      showToast(err.response.data.message, "error", 10000);
    }
  };

  const handleSignup = async () => {
    if (dataurl) {
      const [res, err] = await rest.post("/file/upload-image", {
        dataurl,
        filename,
      });

      if (err) {
        showToast(err.response.data.message, "error", 10000);
      } else {
        register(res.data.url);
      }
    } else {
      register();
    }
  };

  return (
    <div className="h-screen">
      <div className="flex h-screen flex-wrap">
        <div className="flex-1 flex items-center justify-center">
          <div
            className="bg-white p-10 rounded-2xl shadow-md hover:shadow-xl ease-in-out duration-500 flex-1"
            style={{ maxWidth: 340 }}
          >
            <h1 className="text-center text-2xl mb-3">Sign Up</h1>
            <div className="flex justify-center my-3">
              <div
                onClick={() => {
                  pickFile().then(([err, f]) => {
                    console.log(f.file.name);
                    setDataurl(f.dataurl);
                    setFilename(f.file.name);
                  });
                }}
                style={{ backgroundImage: `url(${dataurl})` }}
                className="shadow-lg bg-cover rounded-full w-20 h-20 bg-blue-400 justify-center items-center flex text-4xl cursor-pointer text-white"
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
              <div className="text-sm mb-1">User ID</div>
              <input
                value={ownerid}
                onChange={(e) => setOwnerId(e.target.value)}
                type="text"
                className=" bg-gray-100 px-4 py-2 rounded-lg text-sm w-full ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
              />
            </div>
            <div className="mb-3">
              <div className="text-sm mb-1">Password</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className=" bg-gray-100 px-4 py-2 rounded-lg text-sm w-full ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
              />
            </div>
            <div className="flex justify-center items-center mb-3">
              <button
                onClick={handleSignup}
                className="bg-green-500 text-white text-sm rounded-lg py-2 px-4 my-3 active:scale-90 ease-in-out duration-300 shadow-sm w-full"
              >
                Create an account
              </button>
            </div>
            <div
              className="text-sm text-gray-500 text-center"
              style={{ fontSize: 12 }}
            >
              Alreay have an account?{" "}
              <Link href="/pretty-api/login" passHref>
                <a>Log in</a>
              </Link>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center">
          <div style={{ minHeight: 450 }} className="p-10">
            <h1
              className="text-6xl font-bold mb-5"
              style={{ lineHeight: "5rem" }}
            >
              Sign up to <br /> PrettyApi
            </h1>
            <p className="w-2/3 text-left">
              Share beautiful API with other developers, consumers and become
              part of the open source community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
