import React from "react";
import { FaGithub } from "react-icons/fa";

function Navbar(props) {
  return (
    <div>
      <div className="flex w-full py-2 px-5 mt-5 overflow-hidden justify-between">
        <div>
          <p className="text-2xl font-semibold">NPM Analysis</p>
        </div>
        <a target="_" href="https://github.com/Anubhav-Ghosh1/NPM-Analysis">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-2xl">Star</p>
            <FaGithub className="text-3xl" />
          </div>
        </a>
      </div>
    </div>
  );
}

export default Navbar;