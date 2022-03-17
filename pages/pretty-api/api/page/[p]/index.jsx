import { useRouter } from "next/router";
import { useState, useEffect, useContext } from "react";
import Modal from "../../../../../components/Modal";
import { appContext } from "../../../../../context/AppProvider";
import rest from "../../../../../utils/rest";
import { showToast } from "../../../../../utils/toast";

const fetchApi = async (page, token, search, router) => {
  const [res, err] = await rest.get(
    "/api",
    {
      page,
      per_page: 20,
      search,
      screen: "library",
    },
    { Authorization: `Bearer ${token}` }
  );

  if (!err) {
    return res.data.data;
  }
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

  return [];
};

export default function Api({ p }) {
  const [state, dispatch] = useContext(appContext);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [nameModal, setNameModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchApi(p, token, search, router).then((data) => {
      setItems(data);
      console.log(data);
    });
  }, [search]);

  useEffect(() => {
    if (nameModal) {
      dispatch({
        type: "SET_STATE",
        payload: { api_name: "" },
      });
    }
  }, [nameModal]);

  return (
    <div className="container mx-auto pt-5 mb-10 px-4">
      <div className="flex mb-10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          type="text"
          className=" bg-white shadow-lg px-4 py-2 rounded-lg text-sm w-3/4 sm:w-1/2 lg:w-1/4 ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
        />
        <button
          onClick={() => {
            setNameModal(true);
          }}
          className="bg-green-500 text-white text-sm rounded-lg py-2 px-4 active:scale-90 ease-in-out duration-300 w-20 mx-3 shadow-lg"
        >
          New
        </button>
      </div>
      <div className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-items-center gap-5">
        {items.map((item) => (
          <div
            onClick={() => {
              router.push(`/pretty-api/api/editor/${item.ref}`);
            }}
            style={{ minHeight: 200 }}
            key={item._id}
            className="bg-white text-black shadow-lg rounded-xl p-4 flex flex-col justify-between ease-in-out duration-300 hover:shadow-2xl mb-4 cursor-pointer w-full"
          >
            <div>
              <h1 className="text-lg font-bold">{item.name}</h1>
              <p className="text-gray-500 mt-3 text-ellipsis">
                {item.description}
              </p>
            </div>
            <div className="flex flex-wrap">
              {item.tags.map((tag, i) => (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/pretty-api/tag/${tag.replace("#", "")}`);
                  }}
                  style={{ backgroundColor: "#E5EAFD", color: "#0084C7" }}
                  className="mr-2 p-1 rounded-md cursor-pointer text-sm"
                  key={i}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Modal
        open={nameModal}
        onClick={() => {
          setNameModal(false);
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white shadow-lg rounded-xl p-4"
          style={{ minWidth: "25vw" }}
        >
          <div className="text-center">Document Name</div>
          <input
            value={state.api_name}
            onInput={(e) =>
              dispatch({
                type: "SET_STATE",
                payload: { api_name: e.target.value },
              })
            }
            type="text"
            className="bg-gray-100 px-4 py-2 rounded-lg text-sm ease-in-out duration-300 outline-none text-gray-600 focus:text-blac w-full mt-3 mb-4"
          />
          <div className="flex justify-center">
            <button
              onClick={() => {
                setNameModal(false);
                router.push("/pretty-api/api/editor/new");
              }}
              className="bg-blue-500 text-white text-sm rounded-lg py-1 px-5 mx-2 active:scale-90 ease-in-out duration-300 shadow-sm "
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { p } = context.query;

  return {
    props: {
      p,
    },
  };
}
