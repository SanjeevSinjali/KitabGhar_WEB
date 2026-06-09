import Logo from "./logo";
import Navbar from "./navbar";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <Navbar />
      </div>
    </header>
  );
}