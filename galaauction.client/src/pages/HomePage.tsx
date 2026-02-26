import ThemeToggle from "../components/ThemeToggle";

const HomePage = () => {
    return (<>
        <h1>Home Page</h1>

        <div className="flex flex-col items-center gap-4 p-10">
            <h1 className="text-3xl font-bold">
                Hello React + daisyUI!
            </h1>
            <button className="btn btn-primary w-40">Click Me</button>
            <ThemeToggle />
        </div>
    </>);
}

export default HomePage;