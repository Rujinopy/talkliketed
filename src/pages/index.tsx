import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import type { NextPage } from "next";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import useIntersection from "~/components/useIntersection";
const Home: NextPage = (props) => {
  const sec2Ref = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  const [isIntersecting, setIsIntersecting] = useState(false);

  const scrollToRef = () => {
    if (ref.current) {
      //to the top of the div
      ref.current.scrollIntoView({ behavior: "smooth",block: "nearest" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if(entry === undefined) return;
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: "-100px"}
    );
    console.log(isIntersecting)
    observer.observe(sec2Ref.current!);
    return () => {
      observer.disconnect();
    }
  }, [isIntersecting]);
  

  

  return (
    <>
      <NavbarWithoutCam style="sticky top-0 z-50" />
      <div className="flex min-h-screen flex-col items-center justify-center border-b-2 border-black bg-pink-300">
        <main
          className="flex h-screen w-screen flex-col items-center justify-center border-black 
        bg-yellow-200 text-center font-mono md:w-[70vw] md:border-x-2 md:pb-10"
        >
          <div className="flex h-full w-full flex-col py-10 md:flex-row md:pb-5">
            <div className="flex flex-col justify-center px-5 pb-10 md:w-3/6 md:pb-0">
              <h2 className="fomt-mono ml-5 mr-auto rounded-2xl border-2 border-black bg-pink-200 px-5 py-1 font-bold md:mb-2">
                AI as a trainer
              </h2>
              <h1 className="text-stroke-2 py-2 text-left text-4xl font-bold text-black md:pl-5 md:text-6xl">
                Goodbye{" "}
                <span className="mt-2 inline-block">Procrastination.</span>
              </h1>
              <h1 className="text-stroke-2 py-2 pl-5 text-left text-4xl font-bold text-black md:text-5xl"></h1>
              <p className="text-left text-xl md:pl-5">
                Pledge your money. Finish your goal and Get it back.
              </p>
              <div className="mt-2 flex space-x-2 md:ml-5">
                <Link
                  href="/pushup"
                  className="mt-3 self-center rounded-lg border-2 border-black bg-white px-5 py-5 text-lg duration-200 hover:translate-y-2 hover:bg-pink-300 hover:shadow-neo"
                >
                  Push up
                </Link>
                <button className=" mt-3 rounded-lg border-2 border-black bg-white px-5 py-2 text-lg duration-200 hover:translate-y-2 hover:bg-pink-300 hover:shadow-neo">
                  Squat <span className="block text-xs">Coming soon...</span>
                </button>
                <button className=" mt-3 rounded-lg border-2 border-black bg-white px-5 py-2 text-lg duration-200 hover:translate-y-2 hover:bg-pink-300 hover:shadow-neo">
                  Reading <span className="block text-xs">Coming soon...</span>
                </button>
              </div>
              <p onClick={scrollToRef} className="mt-5 pl-5 text-left text-sm hover:cursor-pointer hover:underline">
                What&apos;s this?
              </p>
            </div>
            <div className="flex items-center justify-center md:w-3/6">
              <Image
                src="https://media4.giphy.com/media/ZCZfmutKBmEVgSN3NE/giphy.gif?cid=6c09b952903v0n1w95th53wg35gml0c4u271h4c4gl3r2jtp&ep=v1_stickers_related&rid=giphy.gif&ct=s"
                alt="nextjs logo"
                className="z-0 transform hover:-scale-x-100"
                priority={true}
                width={600}
                height={600}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onLoadingComplete={() => toast.success}
              />
            </div>
          </div>
        </main>
      </div>
      <div ref={sec2Ref}  className="flex h-[50vh] flex-col items-center justify-center border-black md:h-[70vh]">
        <h1 className={`${isIntersecting === true ? "translate-y-0 transition delay-100" : "translate-y-56 opacity-0"}  block text-center font-mono text-xl leading-loose md:max-w-4xl md:text-3xl`}>
          Pledge money to overcome procrastination and achieve your goals 🎯{" "}
          <span className="mt-10 block"> or risk losing it !</span>
        </h1>
      </div>
      <div ref={ref} className="flex h-[15vh] items-center justify-center border-y-2 border-black bg-purple-200 p-2">
        <h1 className="text-center font-mono text-3xl">
          How does Motiflex works?
        </h1>
      </div>
      <div className="flex h-[100vh] relative flex-col divide-y-2 divide-black border-b-2 border-black bg-pink-300 font-mono text-xl md:divide-y-0 md:text-2xl">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
                src={`https://images.squarespace-cdn.com/content/v1/55e5dbc1e4b08f65bc69d96d/1579710354488-RH6N1143AKJ42UJQ5NVO/halterJommeke.gif?format=500w`}
                className="z-40 md:max-w-none hidden md:flex"
                alt="Motiflex setup"
                // breakpoint sizes
                width={300}
                height={300}
              />
            <div className="w-full md:w-[95vw] h-[90vh] bg-yellow-200 z-0 md:rounded-full absolute md:border-2 border-y-2 border-black">

            </div>
        </div>
        <div className=" flex h-1/2 w-full flex-col divide-y-2 divide-black md:flex-row  md:divide-y-0 z-10">
          <div className="flex flex-col h-1/2 w-full items-center justify-center p-2 md:h-full  md:w-1/2">
            <h1 className="text-center">1. Set your custom goal.</h1>
            
          </div>
          <div className="flex h-1/2 w-full items-center justify-center p-2 md:h-full md:w-1/2">
            <h1 className="text-center">
              2. Make a pledge or go without pledge
            </h1>
          </div>
        </div>
        <div className=" flex h-1/2 w-full flex-col divide-y-2 divide-black md:flex-row-reverse md:divide-y-0 md:divide-x-reverse z-10">
          <div className="flex h-1/2 w-full items-center justify-center p-2 md:h-full md:w-1/2">
            <h1 className=" text-center">
              3. Begin exercising on webcam.{" "}
              <span className="block">
                Our AI tracks and counts your push-ups.
              </span>
            </h1>
          </div>
          <div className="flex h-1/2 w-full items-center justify-center p-2 md:h-full md:w-1/2">
            <h1 className="  text-center">
              4. Retrieve your result{" "}
              <span className="block"> and reclaim your pledge.</span>
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
