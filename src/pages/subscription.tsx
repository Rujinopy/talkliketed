/* eslint-disable @typescript-eslint/no-unused-vars */
import DatePicker from "react-datepicker";
import React, { ChangeEvent, use, useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import LoginButton from "~/components/Loginbutton";
import Link from "next/link";
import { useStore } from "store/stores";
import { parseISO } from "date-fns";
import CheckoutForm from "~/components/CheckoutForm";
import { api } from "~/utils/api";
import {ArrowBigLeft} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import Title from "~/components/Title";
interface storeProps {
  startDate: Date;
  endDate: Date;
  repsPerDay: number;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setRepsPerDay: (reps: number) => void;
}

export default function Subs() {

  const { userId } = useAuth();
  //startdate and enddate from zustand's store
  const startDate = useStore((state: unknown) => (state as storeProps).startDate);
  const endDate = useStore((state: unknown) => (state as storeProps).endDate);
  const repsPerDay = useStore((state: unknown) => (state as storeProps).repsPerDay);
  const setRepsPerDay = useStore(
    (state: unknown) => (state as storeProps).setRepsPerDay
  );
  const setStartDate = useStore(
    (state: unknown) => (state as storeProps).setStartDate
  );
  const setEndDate = useStore(
    (state: unknown) => (state as storeProps).setEndDate
  );

  //check if user's role is 'MEM' according to Users table in db
  const role = api.reps.checkUserRoleWithoutId.useQuery();
  //disable datepicker if user is MEM
  const [picker, setPicker] = useState(false);
  const [pledgeLayout, setPledgeLayout] = useState(false);
  useEffect(() => {
    if (role.data === "MEM") {
      setPicker(true);
    }
    if(role.data === "SUBS"){
      setPledgeLayout(true);
      setPicker(true);
    }
  }, [role]);

  //set startdate and enddate
  const handleChange = (date: Date) => {
    setStartDate(date);
  };
  const handleChange2 = (date: Date) => {
    setEndDate(date);
  };
  const handleChange3 = (e: any) => {
    setRepsPerDay(e.target.value)
  };

  useEffect(() => {
    if (typeof startDate === "string") {
      setStartDate(parseISO(startDate));
    }
    if (typeof endDate === "string") {
      setEndDate(parseISO(endDate));
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (typeof repsPerDay === "string") {
      setRepsPerDay(parseInt(repsPerDay));
    }
  }, [repsPerDay]);

  const [checkoutForm, setCheckoutForm] = useState(false);
  const toggleCheckoutForm = () => {
    setCheckoutForm(!checkoutForm);
  };

  const useMutation = api.reps.updateStartEndDates.useMutation();
  
  //turn repsPerDay into number
  const updateDatesToDb = async () => {
    if (startDate && endDate) {
      await useMutation.mutateAsync({
        userId: userId ?? "",
        startDate: startDate,
        endDate: endDate,
        repPerDay: repsPerDay,
      });
    }
  };

  const checkOut = () => {
    if (startDate && endDate) {
      const diff = endDate.getTime() - startDate.getTime();
      const days = diff / (1000 * 3600 * 24);
      //day selected can't be yesterday or before
      if (days < 0) {
        alert("Please select a valid date range");
      } else {
        if (days > 30) {
          alert("Please select a date range less than 30 days");
        } else {
          if(startDate < new Date()) {
            alert("Please select startDate today or after");
          }
          else {

          toggleCheckoutForm();
          updateDatesToDb();
          }
        }
      }
    } else {
      alert("Please select a valid date range");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col justify-center bg-[#a388ee]">
      <NavbarWithoutCam />
     <Title title={"set up your challenge"}/>

      <SignedIn>
        <div className="flex flex-col h-screen items-center justify-center">
          {checkoutForm ? <ArrowBigLeft color="white" size={60} onClick={toggleCheckoutForm} 
          className="absolute bottom-5 md:top-20 left-5 hover:cursor-pointer"/> : null}        
          {!checkoutForm ? 
            (!picker ? (
          
          <section className="w-full border-black md:border-r-2 justify-center items-center flex flex-col">

            <h1 className="text-black font-mono text-5xl text-center pt-0 md:pb-10">Set Your <span className="text-[#fdfd96] flex mt-3">Deadline</span> </h1>
            <div className="mx-auto w-full md:w-1/3">
              <h2 className="py-1 font-mono text-2xl">start</h2>
              <DatePicker
                className="w-full rounded-lg border-2 border-black py-5 text-center font-mono text-2xl "
                selected={new Date(startDate)}
                onChange={(date: Date) => handleChange(date)}
              />
            </div>
            <div className="mx-auto w-full md:w-1/3">
              <h2 className="py-1 font-mono text-2xl">end</h2>
              <DatePicker
                className="w-full rounded-lg border-2 border-black py-5 text-center font-mono text-2xl "
                selected={new Date(endDate)}
                onChange={(date: Date) => handleChange2(date)}
              />
              <h2 className="py-1 font-mono text-2xl w-full">reps per day</h2>
              <input type="number" value={repsPerDay} onChange={(e) => handleChange3(e)} className="w-full rounded-lg border-2 border-black py-5 text-center font-mono text-2xl"/>
            </div>

            <p
              onClick={checkOut}
              className="mx-auto mt-8 w-2/3 md:w-1/3 rounded-lg border-2 border-black  bg-[#fdfd96] p-2 text-center font-mono text-xl shadow-neo hover:cursor-pointer hover:bg-[#ffdb58]"
            >
              Confirm deadline and reps
            </p>
          </section>):  
          <div className="flex flex-col">
            <p className="mb-5 text-3xl md:text-4xl text-center font-mono">You have set dates range! Check your profile.</p> 
            {/* 2 buttons 1.toggle checkOutForm 2.Go to profile */}
            <div className="flex flex-col md:flex-row mx-auto w-full md:w-auto">
              <button className="md:px-10 py-3 text-xl font-mono shadow-neo border-2
               border-black bg-white hover:bg-amber-300" onClick={toggleCheckoutForm}>Pledge(optional)</button>
              <Link href="user-profile">
                <button className="w-screen md:w-auto md:px-10 py-3 text-xl font-mono shadow-neo border-2 
                border-black bg-white hover:bg-amber-300">Go to profile
                </button>
              </Link> 
            </div>

          </div>) : null
          }
          {checkoutForm ?
          (!pledgeLayout ? <CheckoutForm Toggle={checkoutForm} startDate={startDate} endDate={endDate} repsPerDay={repsPerDay}/>
          : 
          <div className="flex flex-col">
          <p className="mb-5 text-3xl md:text-4xl text-center font-mono">You have already pledged!</p>
          <div className="flex flex-col md:flex-row mx-auto w-full md:w-auto">
          <Link href="user-profile">
              <button className="w-screen md:w-auto md:px-10 py-3 text-xl font-mono shadow-neo 
              border-2 border-black bg-white hover:bg-amber-300">Go to profile</button>
             </Link>
            </div>
           
          </div>) : null
          }
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
