import Link from 'next/link'

export default function CreateButton({ onClick }: { onClick: () => void }) {
    const handleCreateSession = () => {
        onClick()
    }
    return (
    <div onClick={handleCreateSession}>
        <div className="text-[2rem] font-bold font-mono w-40
        text-white text-center bg-[#fdfd96] 
        rounded-2xl border-2 border-black hover:bg-yellow-400 text-stroke-1">create pushups session
        </div>
    </div>)
}