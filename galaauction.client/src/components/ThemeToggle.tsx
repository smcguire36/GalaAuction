import { useContext } from "react";
import EventContext from "../store/EventContext";
import { daisyThemes } from "../data/daisyThemes";

const ThemeToggle = () => {
    const context = useContext(EventContext);

    return (
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Select Theme:</legend>
        <select
          className="select select-sm select-bordered border-base-content/20 bg-base-200 shadow-sm"
          value={context.theme}
          onChange={(e) => context.setTheme(e.target.value)}
        >
          {daisyThemes.map((theme) => (
            <option key={theme} value={theme}>
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </fieldset>
    );
}

export default ThemeToggle;