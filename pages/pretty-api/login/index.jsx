import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useContext } from "react";
import { appContext } from "../../../context/AppProvider";
import rest from "../../../utils/rest";
import { showToast } from "../../../utils/toast";

export default function Login() {
  const [_, dispatch] = useContext(appContext);
  const router = useRouter();
  const [ownerid, setOwnerId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const [res, err] = await rest.post(`/auth/login`, {
      ownerid,
      password,
    });

    if (!err) {
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("username", res.data.data.name);
      localStorage.setItem("profile", res.data.data.profile);
      dispatch({
        type: "SET_STATE",
        payload: {
          token: res.data.data.token,
          username: res.data.data.name,
          profile: res.data.data.profile,
        },
      });
      router.push("/pretty-api/api/page/1");
    } else {
      showToast(err.response.data.message, "error", 10000);
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
            <h1 className="text-center text-2xl mb-3">Login</h1>
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
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className=" bg-gray-100 px-4 py-2 rounded-lg text-sm w-full ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
              />
            </div>
            <div className="flex justify-center items-center mb-3">
              <button
                onClick={handleLogin}
                className="bg-green-500 text-white text-sm rounded-lg py-2 px-4 my-3 active:scale-90 ease-in-out duration-300 shadow-sm w-full"
              >
                Login
              </button>
            </div>
            <div
              className="text-sm text-gray-500 text-center"
              style={{ fontSize: 12 }}
            >
              {"Don't have an account?"}{" "}
              <Link href="/pretty-api/signup" passHref>
                <a>Sign up</a>
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
              Login to <br /> PrettyApi
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
