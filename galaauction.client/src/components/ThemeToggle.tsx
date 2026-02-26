import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "retro");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <select
            className="select select-bordered border-base-content/20 bg-base-200 shadow-sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
        >
            <option value="retro">Retro</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="cupcake">Cupcake</option>
            <option value="corporate">Corporate</option>
            <option value="emerald">Emerald</option>
            <option value="valentine">Valentine</option>
            <option value="luxury">Luxury</option>
            <option value="dracula">Dracula</option>
        </select>
    );
}
