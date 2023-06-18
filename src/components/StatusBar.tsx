interface StatusBarProps {
  role: string;
}

const StatusBar = (props: StatusBarProps) => {
  const role = props.role;
  return (
    <div className="flex space-x-3 font-mono z-0">
      {(role === "MEM" || role === "SUBS") && (
        <div className="relative group">
        <h2 className="tex-center h-10 rounded-lg border-2 border-black bg-white px-3 py-2 font-mono">
          promised
        </h2>
        <h3 className="absolute bg-white rounded-md h-auto w-48 mt-1 p-2 hidden group-hover:block"> 
        Start and end dates have been set, claim your result after the end date.</h3>
        </div>
      )}
      {role === "SUBS" && (
        <div className="relative group">
        <h2 className="tex-center h-10 rounded-lg border-2 border-black bg-white px-3 py-2 font-mono">
          pledged
        </h2>
        <h3 className="absolute bg-white rounded-md h-auto w-48 mt-1 p-2 hidden group-hover:block"> 
        Pledged with some money, get it back after the promise end at the "claim pledge" button.</h3>
        </div>
      )}
      {role === "USER" && (
        <div className="relative group">
        <h2 className="tex-center h-10 rounded-lg border-2 border-black bg-white px-3 py-2 font-mono">
            no promised
            </h2>
            <h3 className="absolute bg-white rounded-md h-auto w-48 mt-1 p-2 hidden group-hover:block"> 
            You will get your daily goal to be displayed but it will not be recorded. Try set your custom goal!</h3>
            </div>
    )}

    </div>
  );
};

export default StatusBar;
