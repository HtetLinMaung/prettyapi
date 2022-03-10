import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getBeautifulJson } from "../../../../../utils/pretty-json";
import rest from "../../../../../utils/rest";

function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (var lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range);

        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
}

function setCurrentCursorPosition(chars) {
  if (chars >= 0) {
    var selection = window.getSelection();

    const range = createRange(
      document.getElementById("jsonEditor").parentNode,
      {
        count: chars,
      }
    );

    if (range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

const defaultJson = {
  name: "API Name",
  description: "",
  visibility: "public",
  tags: [],
  host: "http://localhost:3000",
  groups: [
    {
      name: "Group Name",
      description: "",
      items: [
        {
          url: "/todos",
          method: "GET",
          query: {
            page: "1",
          },
          headers: {},
          body: {},
          description: "",
        },
      ],
    },
  ],
};

const fetchApi = async (ref, access_key = "") => {
  return rest.get(
    `/api/${ref}`,
    { access_key },
    { Authorization: `Bearer ${localStorage.getItem("token") || ""}` }
  );
};

const saveApi = async (ref, router) => {
  try {
    let promise = null;
    const data = JSON.parse(
      document.getElementById("jsonEditor").innerText.trim()
    );
    data.json = JSON.stringify(data);
    delete data.groups;
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    };
    if (ref == "new") {
      promise = rest.post("/api", data, headers);
    } else {
      promise = rest.put(`/api/${ref}`, data, headers);
    }
    const [res, err] = await promise;
    if (err) {
      alert(err.response.data.message);
    } else {
      router.push(
        `/pretty-api/api/editor/${res.data.data.ref}?access_key=${
          data.access_key || ""
        }`
      );
      if (ref != "new") {
        document.querySelector("iframe").contentWindow.location.reload();
      }
    }
  } catch (err) {
    console.log(err.message);
  }
};

export default function ApiForm({ id, access_key }) {
  const router = useRouter();
  const [json, setJson] = useState({});
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    fetchApi(id, access_key).then(([res, err]) => {
      setJson(
        !err
          ? {
              name: res.data.data.name,
              description: res.data.data.description,
              visibility: res.data.data.visibility,
              tags: res.data.data.tags,
              access_key: res.data.data.access_key,
              ...JSON.parse(res.data.data.json),
            }
          : defaultJson
      );
      setTimeout(() => {
        beautifyClickHandler();
      }, 100);
    });
    const ce = document.querySelector("[contenteditable]");
    ce.addEventListener("paste", function (e) {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });
  }, []);

  const beautifyClickHandler = () => {
    try {
      const element = document.getElementById("jsonEditor");
      let text = getBeautifulJson(JSON.parse(element.innerText.trim()));

      element.innerHTML = `<pre class="font-code outline-none">${text}</pre>`;
      setJson(JSON.parse(element.innerText.trim()));
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2">
        {/* <button
          onClick={() => beautifyClickHandler()}
          className="text-sm bg-pink-500 text-white py-2 px-4 ease-in-out duration-300 rounded-xl mx-3 active:scale-90 shadow-sm fixed bottom-5 left-5"
          style={{ fontSize: 12 }}
        >
          Beautify
        </button> */}
        <div
          onCut={() => {
            clearTimeout(timeoutId);
          }}
          onCopy={() => {
            clearTimeout(timeoutId);
          }}
          onKeyDown={(e) => {
            console.log(e.key);
            if (e.key != "Meta" && e.key != "Control") {
              clearTimeout(timeoutId);
              setTimeoutId(
                setTimeout(() => {
                  beautifyClickHandler();
                  saveApi(id, router);
                }, 1000)
              );
            }
          }}
          id="jsonEditor"
          className="overflow-auto text-sm p-4 pt-36 h-full"
          style={{
            backgroundColor: "#22262F",
            color: "#B2BECD",
          }}
          contentEditable="true"
        >
          <pre className="font-code outline-none h-full">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      </div>
      <div className="w-1/2">
        <iframe
          className="h-full w-full"
          src={`/pretty-api/api/${id}?access_key=${access_key}`}
        ></iframe>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;

  return {
    props: {
      id,
      access_key: context.query.access_key || "",
    },
  };
}
