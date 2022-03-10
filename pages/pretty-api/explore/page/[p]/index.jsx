import { useRouter } from "next/router";
import rest from "../../../../../utils/rest";

export default function Explore({ items, p }) {
  const router = useRouter();

  return (
    <div className="container mx-auto pt-5 mb-10 px-4">
      <div className="grid md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 justify-items-center gap-5">
        {items.map((item) => (
          <div
            onClick={() => {
              router.push(`/pretty-api/api/${item.ref}`);
            }}
            style={{ minHeight: 200 }}
            key={item._id}
            className="bg-white text-black shadow-lg rounded-xl p-4 flex flex-col justify-between ease-in-out duration-300 hover:shadow-2xl mb-4 cursor-pointer"
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
  const { p } = context.query;
  let items = [];

  const [res, err] = await rest.get("/api", {
    page: p,
    per_page: 20,
  });

  if (!err) {
    items = res.data.data;
  }

  return {
    props: {
      items,
      p,
    },
  };
}
