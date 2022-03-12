import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import rest from "../../../../utils/rest";
import { showToast } from "../../../../utils/toast";

const fetchApi = async (token, tag, router) => {
  const [res, err] = await rest.get(
    "/api",
    { tag: "#" + tag },
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

export default function Tag({ tag }) {
  const [items, setItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetchApi(token, tag).then((data) => {
      setItems(data);
    });
  }, [tag]);

  return (
    <div className="container mx-auto pt-5 mb-10 px-4">
      <h1 className="text-4xl font-bold my-5 mb-10">{tag}</h1>
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
  const { tag } = context.query;

  return {
    props: {
      tag,
    },
  };
}
