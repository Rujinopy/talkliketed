import { proseWrap } from "prettier.config.cjs";

interface TitleProps {
    title: string;
}

export const Title = (props: TitleProps) => {
    
    return  <div className="justify-center border-b-2 border-black bg-white py-5 text-center">
    <h1 className="font-mono text-2xl text-black">{props.title}</h1>
  </div>
}

export default Title;