export default function ConfirmDelete({ onConfirm, onCancel }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 px-8">
      <h1 className=" text-center text-lg mt-2 mb-10">
        Are you sure you want to delete?
      </h1>
      <div className="flex justify-evenly">
        <button
          className="bg-green-500 text-white text-sm rounded-lg py-1 px-4 mx-2 active:scale-90 ease-in-out duration-300 shadow-sm"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="bg-red-500 text-white text-sm rounded-lg py-1 px-4 mx-2 active:scale-90 ease-in-out duration-300 shadow-sm"
          onClick={onConfirm}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
