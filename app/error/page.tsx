"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BugIcon } from "lucide-react";
import Link from "next/link";

 const ErrorPage = () => {

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <BugIcon />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>Sorry, an unexpected error occurred.</CardDescription>
        </CardHeader>
        <CardFooter className="gap-3 justify-center">
          <Link href="/admin/dashboard">
            <Button variant="outline">Go home</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
export default ErrorPage;