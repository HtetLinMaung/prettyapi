export default function Modal({ children, open, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        transform: open ? "scale(1)" : "scale(0)",
      }}
      className="fixed top-0 left-0 w-screen h-screen z-50 flex justify-center items-center ease-in-out duration-300 overflow-auto"
    >
      {children}
    </div>
  );
}
