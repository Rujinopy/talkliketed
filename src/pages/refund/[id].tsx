import type { NextPage } from "next";
import { useRouter } from "next/router";
import { env } from '~/env.mjs'
import { api } from "../../utils/api";
import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "store/stores";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
})



const Result: NextPage = () => {

    //
    

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#a388ee]">
     
    </div>
  );
};

export default Result;
