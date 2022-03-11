import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import ConfirmDelete from "../../../../../components/ComfirmDelete";
import Modal from "../../../../../components/Modal";
import { appContext } from "../../../../../context/AppProvider";
import { getBeautifulJson } from "../../../../../utils/pretty-json";
import rest from "../../../../../utils/rest";
import { showToast } from "../../../../../utils/toast";

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
  name: "Todo API",
  description: "Mock Todo API for learning & testing purpose.",
  visibility: "public",
  access_key: "",
  tags: ["#todo"],
  host: "https://jsonplaceholder.typicode.com",
  groups: [
    {
      name: "Todo",
      description: "Todo list",
      items: [
        {
          url: "/todos",
          method: "GET",
          query: {},
          headers: {},
          body: {},
          description: "Get todos",
        },
        {
          url: "/todos/[id]",
          method: "GET",
          query: {},
          headers: {},
          body: {},
          description: "Get todo by id",
        },
        {
          url: "/todos",
          method: "POST",
          query: {},
          headers: {},
          body: {
            userId: 0,
            id: 0,
            title: "",
            completed: false,
          },
          description: "Create new todo",
        },
        {
          url: "/todos/[id]",
          method: "PUT",
          query: {},
          headers: {},
          body: {
            userId: 0,
            id: 0,
            title: "",
            completed: false,
          },
          description: "Update todo by id",
        },
        {
          url: "/todos/[id]",
          method: "DELETE",
          query: {},
          headers: {},
          body: {},
          description: "Delete todo by id",
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
      if (
        ["No auth header", "Invalid Token", "Not authenticated!"].includes(
          err.response.data.message
        )
      ) {
        showToast("Please login first", "error", 10000);
        localStorage.clear();
        router.push("/pretty-api/login");
      } else {
        showToast(err.response.data.message, "error", 10000);
      }
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
    showToast(err.message, "error", 10000);
  }
};

const deleteApi = async (ref, router) => {
  const [res, err] = await rest.delete(`/api/${ref}`, {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  });
  if (err) {
    if (
      ["No auth header", "Invalid Token", "Not authenticated!"].includes(
        err.response.data.message
      )
    ) {
      showToast("Please login first", "error", 10000);
      localStorage.clear();
      router.push("/pretty-api/login");
    } else {
      showToast(err.response.data.message, "error", 10000);
    }
  } else {
    router.push("/pretty-api/api/page/1");
  }
};

export default function ApiForm({ id, access_key }) {
  const [state, _] = useContext(appContext);
  const router = useRouter();
  const [json, setJson] = useState({
    ...defaultJson,
    name: state.api_name || "Todo API",
  });
  const [timeoutId, setTimeoutId] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (id == "new") {
      saveApi(id, router).then(() => {
        setTimeout(() => {
          beautifyClickHandler();
        }, 100);
      });
    } else {
      fetchApi(id, access_key).then(([res, err]) => {
        if (err) {
          if (
            ["No auth header", "Invalid Token", "Not authenticated!"].includes(
              err.response.data.message
            )
          ) {
            showToast("Please login first", "error", 10000);
            localStorage.clear();
            router.push("/pretty-api/login");
          } else {
            showToast(err.response.data.message, "error", 10000);
          }
        }
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
            : { ...defaultJson, name: state.api_name || "Todo API" }
        );

        setTimeout(() => {
          beautifyClickHandler();
        }, 100);
      });
    }

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
      showToast(err.message, "error", 10000);
    }
  };

  return (
    <div className="flex h-screen flex-wrap">
      <div className="w-full h-3/5 lg:w-1/2 lg:h-full">
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
      <div className="w-full h-2/5 lg:h-full lg:block lg:w-1/2 lg:pt-24">
        <iframe
          className="h-full w-full"
          src={`/pretty-api/api/${id}?access_key=${access_key}&fullscreen=y`}
        ></iframe>
      </div>
      <button
        onClick={() => setOpen(true)}
        className="justify-center items-center fixed bottom-10 right-10 z-40 bg-red-500 p-3 rounded-full shadow-lg ease-in-out duration-300 active:scale-90 border-0"
      >
        <svg
          width="22"
          height="24"
          viewBox="0 0 22 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 10V18C8 18.2652 8.10536 18.5196 8.29289 18.7071C8.48043 18.8946 8.73478 19 9 19C9.26522 19 9.51957 18.8946 9.70711 18.7071C9.89464 18.5196 10 18.2652 10 18V10C10 9.73478 9.89464 9.48043 9.70711 9.29289C9.51957 9.10536 9.26522 9 9 9C8.73478 9 8.48043 9.10536 8.29289 9.29289C8.10536 9.48043 8 9.73478 8 10ZM13 9C13.2652 9 13.5196 9.10536 13.7071 9.29289C13.8946 9.48043 14 9.73478 14 10V18C14 18.2652 13.8946 18.5196 13.7071 18.7071C13.5196 18.8946 13.2652 19 13 19C12.7348 19 12.4804 18.8946 12.2929 18.7071C12.1054 18.5196 12 18.2652 12 18V10C12 9.73478 12.1054 9.48043 12.2929 9.29289C12.4804 9.10536 12.7348 9 13 9ZM15 4H21C21.2652 4 21.5196 4.10536 21.7071 4.29289C21.8946 4.48043 22 4.73478 22 5C22 5.26522 21.8946 5.51957 21.7071 5.70711C21.5196 5.89464 21.2652 6 21 6H19.894L18.39 19.552C18.2541 20.7751 17.672 21.9051 16.755 22.7258C15.838 23.5465 14.6506 24.0001 13.42 24H8.58C7.3494 24.0001 6.16197 23.5465 5.24498 22.7258C4.32799 21.9051 3.74586 20.7751 3.61 19.552L2.104 6H1C0.734784 6 0.48043 5.89464 0.292893 5.70711C0.105357 5.51957 0 5.26522 0 5C0 4.73478 0.105357 4.48043 0.292893 4.29289C0.48043 4.10536 0.734784 4 1 4H7C7 2.93913 7.42143 1.92172 8.17157 1.17157C8.92172 0.421427 9.93913 0 11 0C12.0609 0 13.0783 0.421427 13.8284 1.17157C14.5786 1.92172 15 2.93913 15 4V4ZM11 2C10.4696 2 9.96086 2.21071 9.58579 2.58579C9.21071 2.96086 9 3.46957 9 4H13C13 3.46957 12.7893 2.96086 12.4142 2.58579C12.0391 2.21071 11.5304 2 11 2V2ZM4.118 6L5.598 19.332C5.6797 20.0657 6.02906 20.7435 6.57923 21.2358C7.12941 21.728 7.84176 22.0001 8.58 22H13.42C14.1579 21.9996 14.8698 21.7273 15.4195 21.2351C15.9693 20.7429 16.3183 20.0654 16.4 19.332L17.884 6H4.12H4.118Z"
            fill="white"
          />
        </svg>
      </button>
      <Modal open={open}>
        <ConfirmDelete
          onCancel={() => setOpen(false)}
          onConfirm={() => {
            deleteApi(id, router);
          }}
        />
      </Modal>
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
