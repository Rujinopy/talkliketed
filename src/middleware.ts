import { withClerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

export default withClerkMiddleware((req: NextRequest) => {
  //add userId to prisma if user is signed up and not already in prisma  
  return NextResponse.next();
});

// Stop Middleware running on static files
export const config = { matcher:  '/((?!_next/image|_next/static|favicon.ico).*)',};
