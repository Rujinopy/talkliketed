/* eslint-disable @typescript-eslint/no-unused-vars */
import DatePicker from "react-datepicker";
import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import LoginButton from "~/components/Loginbutton";
import Link from "next/link";
import { useStore } from "store/stores";
import { parseISO } from "date-fns";
import CheckoutForm from "~/components/CheckoutForm";
import { api } from "~/utils/api";
import { ArrowBigLeft } from "lucide-react";
import NavbarWithoutCam from "~/components/NavbarWithoutCam";
import Title from "~/components/Title";
import toast, { Toaster } from "react-hot-toast";

export const SelectExcerciseDropDown = () => {
  
  return (
    <div className="font-mono">
      <label htmlFor="HeadlineAct" className="block text-xl  text-gray-900">
        Type
      </label>

      <select
        name="HeadlineAct"
        id="HeadlineAct"
        className="mt-1.5 w-full rounded-lg border-2 border-black px-2 py-3 text-gray-700 sm:text-sm"
      >
        <option className="" value="">
          Please select
        </option>
        <option className="" value="Push-Ups">
          Push-Ups
        </option>
        <option className="" value="Sit-Ups">
          Sit-Ups
        </option>
        <option className="" value="Both">
          Both
        </option>
      </select>
    </div>
  );
};

interface storeProps {
  mode: string;
  startDate: Date;
  endDate: Date;
  repsPerDay: number;
  situpsPerDay: number;
  weightLiftingPerDay: number;
  refundResponse: Record<string, null>;
  setStartDate: (date: Date) => void;
  setEndDate: (date: Date) => void;
  setRepsPerDay: (reps: number) => void;
  setSitupsPerDay: (situps: number) => void;
  setWeightLiftingPerDay: (weightLifting: number) => void;
  setMode: (mode: string) => void;
  setRefundResponse: (data: Record<string, null>) => void;
}

export default function Subs() {
  const { userId } = useAuth();
  //startdate and enddate from zustand's store
  const startDate = useStore(
    (state: unknown) => (state as storeProps).startDate
  );
  const endDate = useStore((state: unknown) => (state as storeProps).endDate);
  const pushupPerDay = useStore(
    (state: unknown) => (state as storeProps).repsPerDay
  );
  const situpPerDay = useStore(
    (state: unknown) => (state as storeProps).situpsPerDay
  );
  const setRepsPerDay = useStore(
    (state: unknown) => (state as storeProps).setRepsPerDay
  );
  const setSitupsPerDay = useStore(
    (state: unknown) => (state as storeProps).setSitupsPerDay
  );
  const setStartDate = useStore(
    (state: unknown) => (state as storeProps).setStartDate
  );
  const setEndDate = useStore(
    (state: unknown) => (state as storeProps).setEndDate
  );

  //check if user's role is 'MEM' according to Users table in db
  const role = api.reps.checkUserRoleWithoutId.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  //disable datepicker if user is MEM
  const [picker, setPicker] = useState(false);
  const [pledgeLayout, setPledgeLayout] = useState(false);
  useEffect(() => {
    if (role.data === "MEM") {
      setPicker(true);
    }
    if (role.data === "SUBS") {
      setPledgeLayout(true);
      setPicker(true);
    }
  }, [role]);

  //set startdate and enddate
  const handleChange = (date: Date) => {
    //convert date to have only yyyy-mm-dd
    setStartDate(date);
  };
  const handleChange2 = (date: Date) => {
    setEndDate(date);
  };
  const handleChange3 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepsPerDay(parseInt(e.target.value));
  };
  const handleChange4 = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSitupsPerDay(parseInt(e.target.value));
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
    if (typeof pushupPerDay === "string") {
      setRepsPerDay(parseInt(pushupPerDay));
    }
  }, [pushupPerDay]);

  useEffect(() => {
    if (typeof pushupPerDay === "string") {
      setSitupsPerDay(situpPerDay);
    }
  }, [situpPerDay]);

  const [checkoutForm, setCheckoutForm] = useState(false);
  const toggleCheckoutForm = () => {
    setCheckoutForm(!checkoutForm);
  };

  const checkOut = () => {
    if (startDate && endDate) {
      const diff = endDate.getTime() - startDate.getTime();
      const days = diff / (1000 * 3600 * 24);
      //day selected can't be yesterday or before
      if(pushupPerDay < 0 || situpPerDay < 0){
        toast.error("Please select a valid number");
        return;
      }
      if (pushupPerDay == 0 && situpPerDay == 0) {
        toast.error("At least one exercise must be more than 0");
        return;
      }
      if (days < 0) {
        toast.error("Please select a valid date range");
        return;
      } else {
        if (days > 30) {
          toast.error("Please select a date range less than 30 days");
          return;
        } else {
          if (startDate.getDate() < new Date().getDate()) {
            toast.error("Please select startDate at least today or after");
          } else {
            toggleCheckoutForm();
          }
        }
      }
    } else {
      toast.error("Please select a valid date range");
    }
  };

  return (
    <div
      className=" flex 
    min-h-screen w-screen flex-col justify-center border-b-2 border-black bg-[#ffb2ef] pb-10 "
    >
      <Toaster
        toastOptions={{
          className: "font-mono border-2 border-black",
        }}
      />
      <NavbarWithoutCam />
      <Title title={"set up your challenge"} />

      <SignedIn>
        <div className="flex relative min-h-screen flex-col items-center pt-16 md:justify-center md:pt-0">
          {checkoutForm ? (
            <ArrowBigLeft
              color="white"
              size={40}
              onClick={toggleCheckoutForm}
              className="absolute top-2 left-3 rounded-lg border-2 border-black bg-yellow-300 hover:shadow-neo 
              duration-150 hover:-translate-x-2 hover:cursor-pointer hover:bg-yellow-200 md:top-2 md:left-5"
            />
          ) : null}
          {!checkoutForm ? (
            !picker ? (
              <section className="flex w-[80%] flex-col items-center justify-center">
                <h1 className="pt-0 text-center font-mono text-5xl font-bold text-black md:mt-10 md:pb-10">
                  Set Your <span className="mt-3 flex">Deadline</span>{" "}
                </h1>
                <div className="font-mono text-md bg-yellow-100 rounded-xl border-black border-2 p-3 px-10 mt-5 mb-5 w-full md:w-1/3">
                  <h2>- Select start date and end date of your challenge.</h2>
                  <p>- At least one exercise must be at least 1</p>
                  <p>- Leave any exercise you don&apos;t want it to be in challenge as 0</p>
                </div>
                {/* <SelectExcerciseDropDown /> */}
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
                  <h2 className="mt-5 w-full py-1 font-mono text-2xl">
                    Push-ups per day
                  </h2>
                  <input
                    type="number"
                    value={pushupPerDay}
                    onChange={(e) => handleChange3(e)}
                    className="w-full rounded-lg border-2 border-black py-5 text-center font-mono text-2xl"
                  />
                  <h2 className="w-full py-1 font-mono text-2xl">
                    Sit-ups per day
                  </h2>
                  <input
                    type="number"
                    value={situpPerDay}
                    onChange={(e) => handleChange4(e)}
                    className="w-full rounded-lg border-2 border-black py-5 text-center font-mono text-2xl"
                  />
                </div>

                <p
                  onClick={checkOut}
                  className="mx-auto mt-8 w-2/3 rounded-lg border-2 border-black bg-[#fdfd96]  p-2 text-center font-mono text-2xl shadow-neo hover:cursor-pointer hover:bg-[#ffdb58] md:w-1/3"
                >
                  Next
                </p>
              </section>
            ) : (
              <div className="flex flex-col ">
                <p className="mb-5 text-center font-mono text-3xl md:text-4xl">
                  You have set dates range! Check your profile.
                </p>
                {/* 2 buttons 1.toggle checkOutForm 2.Go to profile */}
                <div className="mx-auto flex w-full flex-col md:w-auto md:flex-row">
                  <button
                    className="border-2 border-black bg-white py-3 font-mono text-xl
               shadow-neo hover:bg-amber-300 md:px-10"
                    onClick={toggleCheckoutForm}
                  >
                    Pledge(optional)
                  </button>
                  <Link href="user-profile">
                    <button
                      className="w-screen border-2 border-black bg-white py-3 font-mono text-xl shadow-neo 
                hover:bg-amber-300 md:w-auto md:px-10"
                    >
                      Go to profile
                    </button>
                  </Link>
                </div>
              </div>
            )
          ) : null}
          {checkoutForm ? (
            !pledgeLayout ? (
              <div>
                <CheckoutForm
                  Toggle={checkoutForm}
                  Id={userId ?? ""}
                  RepsPerDay={pushupPerDay}
                  SitupsPerDay={situpPerDay}
                />
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="mb-5 text-center font-mono text-3xl md:text-4xl">
                  You have already pledged!
                </p>
                <div className="mx-auto flex w-full flex-col md:w-auto md:flex-row">
                  <Link href="user-profile">
                    <button
                      className="w-screen border-2 border-black bg-white py-3 font-mono text-xl 
              shadow-neo hover:bg-amber-300 md:w-auto md:px-10"
                    >
                      Go to profile
                    </button>
                  </Link>
                </div>
              </div>
            )
          ) : null}
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex h-screen flex-col items-center justify-center">
          <p className="py-5 font-mono text-3xl">
            You need to sign in! &#128512;
          </p>
          <Link href={"/sign-in"}>
            <LoginButton label="Sign in" />
          </Link>
        </div>
      </SignedOut>
    </div>
  );
}
