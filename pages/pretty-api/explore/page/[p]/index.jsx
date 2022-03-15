import { useRouter } from "next/router";
import rest from "../../../../../utils/rest";
import { useState, useEffect } from "react";
import { showToast } from "../../../../../utils/toast";

const fetchApi = async (page, token, search, router) => {
  const [res, err] = await rest.get(
    "/api",
    {
      page,
      per_page: 20,
      search,
      screen: "explore",
    },
    { Authorization: `Bearer ${token || ""}` }
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

export default function Explore({ p }) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchApi(p, token, search, router).then((data) => {
      setItems(data);
    });
  }, [search]);

  return (
    <div className="container mx-auto pt-5 mb-10 px-4">
      <div className="flex mb-10 justify-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          type="text"
          className=" bg-white shadow-lg px-4 py-2 rounded-lg text-xl w-full sm:w-2/3 lg:w-2/5 ease-in-out duration-300 outline-none text-gray-600 focus:text-black"
        />
        {/* <button
          onClick={() => {
            setNameModal(true);
          }}
          className="bg-green-500 text-white text-sm rounded-lg py-2 px-4 active:scale-90 ease-in-out duration-300 w-20 mx-3 shadow-lg"
        >
          New
        </button> */}
      </div>
      <div className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-items-center gap-5">
        {items.map((item) => (
          <div
            onClick={() => {
              router.push(`/pretty-api/api/${item.ref}`);
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
