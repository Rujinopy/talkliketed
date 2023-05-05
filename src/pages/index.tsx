import { type NextPage } from "next";
import { useState } from "react";
import Head from "next/head";

// import Link from "next/link";

import { api } from "~/utils/api";
import Trpc from "./api/trpc/[trpc]";
// import { number, set } from "zod";

const Home: NextPage = () => {
  const { data } = api.posts.getAll.useQuery();
  const [isChecked, setChecked] = useState(false)
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  //trpc useContext
  const ctx = api.useContext()

  // const itemm = checkedItems[0]
  const { mutate } = api.posts.delete.useMutation({
    onSuccess: () => {
      //refresh the data
      void ctx.posts.getAll.invalidate()
    }
  });
  


  const handleCheck = (e: string) => {
    //set isChecked to true and add to checkedItems
    setChecked(!isChecked)
    //if checkedItems already has the item, remove it
    if (checkedItems.includes(e)) {
      setCheckedItems(checkedItems.filter((item) => item !== e))
      return
    }
    //if checkedItems does not have the item, add it
    setCheckedItems([...checkedItems, e])
    

  }

  const handleDelete = () => {
    //delete all checked items
    checkedItems.map((item) => mutate(item))
    //set checkedItems to empty array
    setCheckedItems([])
    
  }



  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black to-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          
         
          <p className="text-2xl text-white">
            {data?.map((post) => (
              <div key={post.id} onChange={() => handleCheck(post.id)} className="p-3 bg-black border-solid border-2 border-indigo-600">
                <input type="checkbox" className="form-checkbox mx-5 h-5 w-5 text-indigo-600 transition duration-150 ease-in-out" />
                <a className="text-white">{post.content}</a>
                
              </div>
            ))}
            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-300 px-5 py-2 font-medium text-white border border-b-4 border-r-4 border-black rounded-lg shadow-lg transition duration-200 transform hover:shadow-sm">Delete</button>
          </p>
          {/* <div className="flex items-center justify-topp">
            <div className="space-x-6">
                <button
                    className="bg-white hover:scale-125 px-5 py-2 font-medium border border-b-4 border-r-4 border-black rounded-lg shadow-lg hover:shadow-sm transition duration-200 transform">Outline Button</button>
                <button
                    className="bg-white hover:scale-125 px-5 py-2 font-medium text-green-900 border border-b-4 border-r-4 border-green-600 rounded-lg shadow-lg transition duration-200 transform hover:shadow-sm">Outline Button</button>
                <button
                    className="bg-white hover:scale-125 px-5 py-2 font-medium text-red-900 border border-b-4 border-r-4 border-red-600 rounded-lg shadow-lg transition duration-200 transform hover:shadow-sm">Outline Button</button>
                <button
                    className="bg-white hover:scale-125 px-5 py-2 font-medium text-blue-900 border border-b-4 border-r-4 border-blue-600 rounded-lg shadow-lg transition duration-200 transform hover:shadow-sm">Outline Button</button>
            </div>

        </div> */}
        </div>
      </main>
    </>
  );
};

export default Home;
