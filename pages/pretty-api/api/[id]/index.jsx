import { useState, useEffect } from "react";
import axios from "axios";
import rest from "../../../../utils/rest";
import { useRouter } from "next/router";
import { getBeautifulJson } from "../../../../utils/pretty-json";
import Modal from "../../../../components/Modal";
import { showToast } from "../../../../utils/toast";
import Head from "next/head";
import Script from "next/script";

const Method = ({ method }) => {
  let className =
    "rounded-lg text-white py-1 text-sm flex justify-center items-center w-16 ";
  if (method == "GET") {
    className += "bg-green-500";
  } else if (method == "POST") {
    className += "bg-orange-500";
  } else if (method == "PUT") {
    className += "bg-blue-400";
  } else if (method == "DELETE") {
    className += "bg-red-500";
  }
  return <div className={className}>{method == "DELETE" ? "DEL" : method}</div>;
};

const Tab = ({ tabs, item, i, i2, host, beautifyClickHandler }) => {
  const [timeoutId, setTimeoutId] = useState(null);

  return (
    <div>
      <div
        onCut={() => {
          clearTimeout(timeoutId);
        }}
        onCopy={() => {
          clearTimeout(timeoutId);
        }}
        onKeyDown={(e) => {
          clearTimeout(timeoutId);
          setTimeoutId(
            setTimeout(() => {
              beautifyClickHandler(i, i2);
            }, 1000)
          );
        }}
        id={`gp${i}_${i2}_tab_body`}
        className="bg-gray-100 mb-5 rounded-2xl p-4 text-sm overflow-x-auto outline-none w-full sm:w-5/6 md:w-2/3"
        style={{
          minHeight: 128,
          display: tabs.includes(`gp${i}_${i2}_body`) ? "block" : "none",
        }}
        contentEditable={true}
      >
        <pre className="font-code">{JSON.stringify(item.body, null, 2)}</pre>
      </div>
      <div
        onCut={() => {
          clearTimeout(timeoutId);
        }}
        onCopy={() => {
          clearTimeout(timeoutId);
        }}
        onKeyDown={(e) => {
          clearTimeout(timeoutId);
          setTimeoutId(
            setTimeout(() => {
              beautifyClickHandler(i, i2);
            }, 1000)
          );
        }}
        id={`gp${i}_${i2}_tab_headers`}
        className="bg-gray-100 mb-5 rounded-2xl p-4 text-sm overflow-x-auto outline-none w-full sm:w-5/6 md:w-2/3"
        style={{
          minHeight: 128,
          display: tabs.includes(`gp${i}_${i2}_headers`) ? "block" : "none",
        }}
        contentEditable={true}
      >
        <pre className="font-code">{JSON.stringify(item.headers, null, 2)}</pre>
      </div>
      <div
        onCut={() => {
          clearTimeout(timeoutId);
        }}
        onCopy={() => {
          clearTimeout(timeoutId);
        }}
        onKeyDown={(e) => {
          clearTimeout(timeoutId);
          setTimeoutId(
            setTimeout(() => {
              beautifyClickHandler(i, i2);
              document.getElementById(`gp${i}_${i2}_input`).value = `${host}${
                item.url
              }?${Object.entries(
                JSON.parse(
                  document
                    .getElementById(`gp${i}_${i2}_tab_params`)
                    .innerText.trim()
                )
              )
                .map(([k, v]) => `${k}=${v}`)
                .join("&")}`;
            }, 1000)
          );
        }}
        id={`gp${i}_${i2}_tab_params`}
        className="bg-gray-100 mb-5 rounded-2xl p-4 text-sm overflow-x-auto outline-none w-full sm:w-5/6 md:w-2/3"
        style={{
          minHeight: 128,
          display: tabs.includes(`gp${i}_${i2}_params`) ? "block" : "none",
        }}
        contentEditable={true}
      >
        <pre className="font-code">{JSON.stringify(item.query, null, 2)}</pre>
      </div>
    </div>
  );
};

const fetchApi = async (ref, access_key = "", router = null) => {
  const [res, err] = await rest.get(
    `/api/${ref}`,
    { access_key },
    {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    }
  );
  if (err) {
    if (
      ["No auth header", "Invalid Token", "Not authenticated!"].includes(
        err.response.data.message
      )
    ) {
      showToast("Please login first", "error", 10000);
      localStorage.clear();
      router.push("/pretty-api/login");
    }
    return null;
  } else {
    return res.data.data;
  }
};

export default function Api({ id, access_key }) {
  const router = useRouter();
  const [expands, setExpands] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [ak, setAk] = useState("");
  const [openGlobal, setOpenGlobal] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [globalHeaders, setGlobalHeaders] = useState("{}");
  const [json, setJson] = useState({ groups: [] });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const tabClickHandler = (selected) => {
    const s = selected.split("_");
    s.pop();
    const t = [...tabs].filter((e) => !e.startsWith(s.join("_")));
    if (t.includes(selected)) {
      t.splice(t.indexOf(selected), 1);
    } else {
      t.push(selected);
    }
    setTabs(t);
  };

  const beautifyClickHandler = (i, i2) => {
    try {
      const body_tag = document.getElementById(`gp${i}_${i2}_tab_body`);
      body_tag.innerHTML = `<pre class="font-code">${getBeautifulJson(
        JSON.parse(body_tag.innerText.trim())
      )}</pre>`;
      const headers_tag = document.getElementById(`gp${i}_${i2}_tab_headers`);
      headers_tag.innerHTML = `<pre class="font-code">${getBeautifulJson(
        JSON.parse(headers_tag.innerText.trim())
      )}</pre>`;
      const params_tag = document.getElementById(`gp${i}_${i2}_tab_params`);
      params_tag.innerHTML = `<pre class="font-code">${getBeautifulJson(
        JSON.parse(params_tag.innerText.trim())
      )}</pre>`;
    } catch (err) {
      showToast(err.message, "error", 10000);
    }
  };

  const sendClickHandler = async (method, i, i2) => {
    const element = document.getElementById(`gp${i}_${i2}_result`);

    try {
      const url = document.getElementById(`gp${i}_${i2}_input`).value;
      const body = JSON.parse(
        document.getElementById(`gp${i}_${i2}_tab_body`).innerText.trim()
      );
      let headers = JSON.parse(
        document.getElementById(`gp${i}_${i2}_tab_headers`).innerText.trim()
      );
      let res = null;
      if (method == "GET") {
        res = await axios.get(url, { headers });
      } else if (method == "POST") {
        res = await axios.post(url, body, { headers });
      } else if (method == "PUT") {
        res = await axios.put(url, body, { headers });
      } else if (method == "DELETE") {
        res = await axios.delete(url, { headers });
      } else if (method == "PATCH") {
        res = await axios.patch(url, body, { headers });
      }

      element.innerHTML = `<pre class="font-code">${getBeautifulJson(
        res.data
      )}</pre>`;
    } catch (err) {
      element.innerHTML = `<pre class="font-code">${getBeautifulJson(
        err.response
      )}</pre>`;
    }
  };

  const beautifyGlobalHeaders = () => {
    try {
      const element = document.getElementById("global_headers_modal");
      const text = getBeautifulJson(JSON.parse(element.innerText.trim()));
      element.innerHTML = `<pre class="font-code">${text}</pre>`;
      setGlobalHeaders(text);
    } catch (err) {
      showToast(err.message, "error", 10000);
    }
  };

  const init = () => {
    if (json) {
      const ts = [];

      let i = 0;
      for (const group of json.groups) {
        let i2 = 0;
        for (const item of group.items) {
          const input = document.getElementById(`gp${i}_${i2}_input`);
          input.value = json.host + item.url;
          const params = Object.entries(item.query);
          if (params.length) {
            input.value += "?" + params.map(([k, v]) => `${k}=${v}`).join("&");
          }

          if (item.method == "GET") {
            ts.push(`gp${i}_${i2}_params`);
          } else {
            ts.push(`gp${i}_${i2}_body`);
          }

          const header_modal = document.getElementById("global_headers_modal");
          header_modal.innerHTML = `<pre class="font-code" >${getBeautifulJson({
            "Content-Type": "application/json",
          })}</pre>`;

          beautifyClickHandler(i, i2);

          i2++;
        }
        i++;
      }

      setTabs(ts);
      setGlobalHeaders(
        getBeautifulJson({ "Content-Type": "application/json" })
      );
      const ce = document.querySelector("[contenteditable]");
      ce.addEventListener("paste", function (e) {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, text);
      });
    }
  };

  useEffect(() => {
    fetchApi(id, access_key, router).then((res) => {
      if (res) {
        setName(res.name);
        setDescription(res.description);
        setJson(JSON.parse(res.json));
      } else {
        setJson(null);
      }
    });
  }, [access_key]);

  useEffect(() => {
    init();
  }, [json]);

  useEffect(() => {
    if (json) {
      let i = 0;
      for (const group of json.groups) {
        let i2 = 0;
        for (const item of group.items) {
          const headers_tag = document.getElementById(
            `gp${i}_${i2}_tab_headers`
          );
          headers_tag.innerHTML = `<pre class="font-code">${globalHeaders}</pre>`;

          // const j = headers_tag.innerText.trim();
          // const options = {};
          // const editor = new JSONEditor(headers_tag, options);
          // const initialJson = {
          //   Array: [1, 2, 3],
          //   Boolean: true,
          //   Null: null,
          //   Number: 123,
          //   Object: { a: "b", c: "d" },
          //   String: "Hello World",
          // };
          // editor.set(initialJson);
          i2++;
        }
        i++;
      }
    }
  }, [globalHeaders, json]);

  return (
    <div className="container mx-auto pt-5 mb-10 px-4">
      <Head>
        {/* <link rel="stylesheet" href="/pretty-api/jsoneditor.min.css" /> */}
      </Head>
      {/* <Script src="/pretty-api/jsoneditor.min.js" /> */}
      {json ? (
        <div>
          <div className="p-3 mb-5">
            <h1 className="text-4xl text-black my-5">{name}</h1>
            <p className="text-gray-500">{description}</p>
          </div>
          <hr />
          <div className="flex py-2 justify-end mt-5">
            <button
              onClick={() => {
                setOpenGlobal(true);
              }}
              style={{ borderWidth: 1 }}
              className=" border-blue-500 text-blue-500 text-sm rounded-lg py-2 px-4 mx-2 active:scale-90 ease-in-out duration-300 shadow-sm"
            >
              Global Headers
            </button>
            <Modal
              onClick={() => {
                setOpenGlobal(false);
              }}
              open={openGlobal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                onCut={() => {
                  clearTimeout(timeoutId);
                }}
                onCopy={() => {
                  clearTimeout(timeoutId);
                }}
                onKeyDown={(e) => {
                  clearTimeout(timeoutId);
                  setTimeoutId(
                    setTimeout(() => {
                      beautifyGlobalHeaders();
                    }, 500)
                  );
                }}
                style={{
                  minWidth: 280,
                  height: 400,
                  width: "40vw",
                }}
                id="global_headers_modal"
                className="bg-gray-100 rounded-2xl shadow-xl p-4 w-full text-sm overflow-auto outline-none"
                contentEditable={true}
              >
                <pre className="font-code"></pre>
              </div>
            </Modal>
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="flex justify-center flex-col">
        {json ? (
          json.groups.map((gp, i) => (
            <div key={`gp${i}`} className="mb-3">
              <h1 className="mb-3 px-3 text-lg">
                {gp.name}
                <span className="text-gray-500 mx-3">{gp.description}</span>
              </h1>
              {gp.items.map((item, i2) => (
                <div
                  style={{
                    maxHeight: expands.includes(`gp${i}_${i2}`) ? 3000 : 52,
                  }}
                  key={`gp${i}_${i2}`}
                  className="bg-white shadow-lg rounded-2xl mb-4 overflow-hidden ease-in-out duration-300"
                >
                  <div
                    onClick={() => {
                      const items = [...expands];
                      if (expands.includes(`gp${i}_${i2}`)) {
                        items.splice(items.indexOf(`gp${i}_${i2}`), 1);
                      } else {
                        items.push(`gp${i}_${i2}`);
                      }
                      setExpands(items);
                    }}
                    className="flex items-center cursor-pointer p-3 hover:bg-slate-100 ease-in-out duration-300"
                  >
                    <Method method={item.method} />
                    <span className="ml-3 sm:mx-3 text-sm">{item.url}</span>
                    <span className="hidden sm:inline text-sm text-gray-500">
                      {item.description}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="flex mb-3">
                      <input
                        id={`gp${i}_${i2}_input`}
                        type="text"
                        className=" bg-gray-100 px-4 py-2 rounded-lg text-sm w-3/4 sm:w-2/3 md:w-1/2 ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
                      />
                      <button
                        onClick={() => sendClickHandler(item.method, i, i2)}
                        className="bg-blue-500 text-white text-sm rounded-lg py-2 px-6 mx-2 active:scale-90 ease-in-out duration-300 shadow-sm"
                      >
                        Send
                      </button>
                    </div>
                    <div className="flex items-center">
                      <div
                        id={`gp${i}_${i2}_btn_group`}
                        className="inline-flex my-5 text-sm rounded-2xl  cursor-pointer border-gray-500 p-1"
                        style={{ fontSize: 12, borderWidth: 1 }}
                      >
                        <div
                          onClick={() => tabClickHandler(`gp${i}_${i2}_params`)}
                          className={`py-1 px-3 ease-in-out duration-300 rounded-lg ${
                            tabs.includes(`gp${i}_${i2}_params`)
                              ? "bg-black text-white"
                              : ""
                          }`}
                        >
                          Params
                        </div>
                        <div
                          onClick={() => tabClickHandler(`gp${i}_${i2}_body`)}
                          className={`py-1 px-3 ease-in-out duration-300 rounded-lg ${
                            tabs.includes(`gp${i}_${i2}_body`)
                              ? "bg-black text-white"
                              : ""
                          }`}
                        >
                          Body
                        </div>
                        <div
                          onClick={() =>
                            tabClickHandler(`gp${i}_${i2}_headers`)
                          }
                          className={`py-1 px-3 ease-in-out duration-300 rounded-lg ${
                            tabs.includes(`gp${i}_${i2}_headers`)
                              ? "bg-black text-white"
                              : ""
                          }`}
                        >
                          Headers
                        </div>
                      </div>
                      <button
                        onClick={() => beautifyClickHandler(i, i2)}
                        className="text-sm bg-pink-500 text-white py-2 px-4 ease-in-out duration-300 rounded-xl mx-3 active:scale-90 shadow-sm"
                        style={{ fontSize: 12 }}
                      >
                        Beautify
                      </button>
                    </div>
                    <Tab
                      host={json.host}
                      tabs={tabs}
                      item={item}
                      i={i}
                      i2={i2}
                      beautifyClickHandler={beautifyClickHandler}
                    />
                    <div
                      id={`gp${i}_${i2}_result`}
                      className="rounded-lg overflow-auto text-sm p-4"
                      style={{
                        height: 128 * 2,
                        backgroundColor: "#22262F",
                        color: "#B2BECD",
                      }}
                    >
                      <pre className="font-code"></pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <Modal open={true}>
            <div
              className="bg-white shadow-lg rounded-xl p-4"
              style={{ minWidth: "25vw" }}
            >
              <div className="text-center">Access Key</div>
              <input
                value={ak}
                onChange={(e) => setAk(e.target.value)}
                type="text"
                className="bg-gray-100 px-4 py-2 rounded-lg text-sm ease-in-out duration-300 outline-none text-gray-600 focus:text-blac w-full mt-3 mb-4"
              />
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    router.push(`/pretty-api/api/${id}?access_key=${ak}`);
                  }}
                  className="bg-blue-500 text-white text-sm rounded-lg py-1 px-5 mx-2 active:scale-90 ease-in-out duration-300 shadow-sm "
                >
                  Next
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;

  const access_key = context.query.access_key || "";

  return {
    props: {
      id,
      access_key,
    },
  };
}
