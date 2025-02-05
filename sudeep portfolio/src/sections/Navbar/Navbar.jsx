import React from "react";
import styles from "./NavbarStyles.module.css"; // Import CSS Module
import { useTheme } from "../../common/ThemeContext"; // Import ThemeContext

function Navbar() {
  const { theme } = useTheme(); // Get theme from context

  return (
    <nav id="navbar" className={styles.container}>
      {/* Navigation Links */}
      <ul className={styles.navLinks}>
        <li>
          <a href="#home"><h3>Home</h3></a>
        </li>
        <li>
          <a href="#projects"><h3>Projects</h3></a>
        </li>
        <li>
          <a href="#skills"><h3>Skills</h3></a>
        </li>
        <li>
          <a href="#contact"><h3>ContactMe</h3></a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
