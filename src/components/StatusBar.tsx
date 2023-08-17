interface StatusBarProps {
  role: string;
}

const StatusBar = (props: StatusBarProps) => {
  const role = props.role;
  return (
    <div className="z-0 flex space-x-3 font-mono ">
      {(role === "MEM" || role === "SUBS") && (
        <StatusModal
          title="On Challenge"
          description="You are on challenge, record your result at the end of challenge."
        />
      )}
      {role === "SUBS" && (
        <StatusModal
          title="On Challenge with pledge"
          description='Pledged with some money, get it back after the promise end at the "claim pledge" button.'
        />
      )}
      {role === "USER" && (
        <StatusModal title="no ongoing challenge" description="You will get your daily goal to be displayed but it will not be
        recorded. Try set your custom goal!" />
      )}
    </div>
  );
};

export default StatusBar;

export const StatusModal = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div className="z-0 flex space-x-3 font-mono">
      <div className="group relative">
        <h2 className="h-10 rounded-lg border-2 border-black bg-[#fdfd96] px-3 py-2 text-center font-mono">
          {title}
        </h2>
        <h3 className="absolute mt-1 hidden h-auto w-48 rounded-md bg-white p-2 group-hover:block border border-black">
          {description}
        </h3>
      </div>
    </div>
  );
};
