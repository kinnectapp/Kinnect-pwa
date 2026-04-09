import "./typing.css";
export default function TypingIndicator() {
  return (
    <div className="flex bg-[#F3F5F8] py-3 px-4 rounded-full w-fit space-x-1">
      <span className="dot"></span>
      <span className="dot delay-150"></span>
      <span className="dot delay-300"></span>
    </div>
  );
}