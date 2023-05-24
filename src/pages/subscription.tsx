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

  const [hoverColor, setHoverColor] = useState("");
  const handleHoverColorChange = (color: string) => {
    setHoverColor(color);
  };

  useEffect(() => {
    if (typeof startDate === "string") {
      setStartDate(parseISO(startDate));
    }
    if (typeof endDate === "string") {
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
          alert(
            "You have selected " + startDate.toDateString() + " as start date"
          );
          alert("You have selected " + endDate.toDateString() + " as end date");
        }
      }
    } else {
      alert("Please select a valid date range");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col justify-center bg-[#a388ee]">
      <div className="justify-center border-b-2 border-black bg-white py-5 text-center">
        <h1 className="font-mono text-2xl text-black">Set up your challenge</h1>
      </div>

      <SignedIn>
        <div className="flex flex-col md:flex-row h-screen">
          <section className="w-full md:w-1/2 -border-5 border-black justify-center items-center flex flex-col">
            <h1 className="text-black font-mono text-5xl text-center pt-20 md:pb-20">Set your <span className="text-[#fdfd96] flex mt-3">deadline</span> </h1>
            <div className="mx-auto w-full md:w-1/3">
              <h2 className="py-1 font-mono text-xl">from</h2>
              <DatePicker
                className="w-full rounded-lg border border-black py-5 text-center font-mono text-2xl shadow-neo"
                selected={startDate}
                onChange={(date: Date) => handleChange(date)}
              />
            </div>
            <div className="mx-auto w-full md:w-1/3">
              <h2 className="py-1 font-mono text-xl">to</h2>
              <DatePicker
                className=" w-full rounded-lg border border-black py-5 text-center font-mono text-2xl shadow-neo"
                selected={endDate}
                onChange={(date: Date) => handleChange2(date)}
              />
            </div>
            <p
              onClick={checkOut}
              className="mx-auto mt-8 w-2/3 md:w-1/3 rounded-lg border-2 border-black  bg-[#fdfd96] p-2 text-center font-mono text-xl shadow-neo hover:cursor-pointer hover:bg-[#ffdb58]"
            >
              Confirm deadline
            </p>
          </section>
          <CheckoutForm />

        </div>
      </SignedIn>
      <SignedOut>
        <div className="container mx-auto flex flex-col items-center">
          <p className="py-5 font-mono text-3xl">
            You need to sign in! &#128512;
          </p>
          <Link href={"/sign-in"}>
            <LoginButton
              label="Sign in"
            />
          </Link>
        </div>
      </SignedOut>
    </div>
  );
}
