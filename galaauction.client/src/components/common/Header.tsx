const Header = ({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) => {
  return (
    <th className="py-1">
      <div className="flex flex-row gap-2 items-center">
        <span className="flex-1">{label}</span>
        {children}
      </div>
    </th>
  );
};

export default Header;
