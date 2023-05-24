/* eslint-disable @typescript-eslint/no-unused-vars */
import DatePicker from "react-datepicker";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import LoginButton from "~/components/Loginbutton";
import Link from "next/link";
import { useStore } from "store/stores";
import { parseISO } from "date-fns";
import CheckoutForm from "~/components/CheckoutForm";
import { api } from "~/utils/api";

interface storeProps {
  startDate: Date;
  endDate: Date;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
}

export default function Subs() {
  //startdate and enddate from zustand's store
  const startDate = useStore(
    (state: unknown) => (state as storeProps).startDate
  );
  const endDate = useStore((state: unknown) => (state as storeProps).endDate);
  const setStartDate = useStore(
    (state: unknown) => (state as storeProps).setStartDate
  );
  const setEndDate = useStore(
    (state: unknown) => (state as storeProps).setEndDate
  );

  //set startdate and enddate
  const handleChange = (date: Date) => {
    setStartDate(date);
  };
  const handleChange2 = (date: Date) => {
    setEndDate(date);
  };

  const [hoverColor, setHoverColor] = useState('');
  const handleHoverColorChange = (color: string) => {
    setHoverColor(color);
  };

  useEffect(() => {
    if(typeof startDate === 'string'){
        setStartDate(parseISO(startDate));
    }
    if(typeof endDate === 'string'){
        setEndDate(parseISO(endDate));
    }
    }, [startDate, endDate]);

  const checkOut = () => {
    if (startDate && endDate) {
      const diff = endDate.getTime() - startDate.getTime();
      const days = diff / (1000 * 3600 * 24);
      if (days < 0) {
        alert("Please select a valid date range");
      } else {
        if (days > 30) {
          alert("Please select a date range less than 30 days");
        } else {
          alert("You have selected " + startDate.toDateString() + " as start date");
          alert("You have selected " + endDate.toDateString() + " as end date");
        }
      }
    } else {
      alert("Please select a valid date range");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col justify-center bg-[#ffa07a]">
        {/* logo */}
        {/* <Link>
            <h1 className="py-5 text-2xl px-5 mr-auto">pushup</h1>
        </Link> */}
        
      <div className="justify-center py-5 text-center bg-white border-b-2 border-black">
        <h1 className="font-mono text-2xl text-black">Set up your challenge</h1>
      </div>
      
      <SignedIn>
        <div className="flex h-screen items-center justify-center">
         
          <CheckoutForm />
          <section className="w-1/2">
          <div className="mx-auto w-full md:w-1/3">
            <h2 className="py-1 font-mono text-xl">from</h2>
            <DatePicker
              className="w-full border rounded-lg border-black py-5 text-center font-mono text-2xl shadow-neo"
              selected={startDate}
              onChange={(date: Date) => handleChange(date)}
            />
          </div>
          <div className="mx-auto w-full md:w-1/3">
            <h2 className="py-1 font-mono text-xl">to</h2>
            <DatePicker
              className=" w-full border rounded-lg border-black py-5 text-center font-mono text-2xl shadow-neo"
              selected={endDate}
              onChange={(date: Date) => handleChange2(date)}
            />
          </div>
          <p
            onClick={checkOut}
            className="border-2 mx-auto w-1/3 rounded-lg mt-8 border-black  p-2 text-center font-mono text-xl shadow-neo hover:cursor-pointer bg-[#fdfd96] hover:bg-[#ffdb58]"
          >
            Set deadline and continue
          </p>
          </section>
        </div>
        
      </SignedIn>
      <SignedOut>
        <div className="container flex flex-col items-center mx-auto">
          <p className="py-5 font-mono text-3xl">
            You need to sign in! &#128512;
          </p>
          <Link href={"/sign-in"}>
            <LoginButton label="Sign in" hoverColor={hoverColor} onColorChange={setHoverColor} />
          </Link>
        </div>
      </SignedOut>
      
    </div>
  );
}
