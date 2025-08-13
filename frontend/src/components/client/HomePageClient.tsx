'use client'

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/supabaseClient";
import { User } from '@supabase/supabase-js';
import Membership from "@/components/membership";

interface HomePageClientProps {
  children: React.ReactNode;
}

export default function HomePageClient({ children }: HomePageClientProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkUser();
  }, []);

  return (
    <>
      {children}
      {!user && <Membership />}
    </>
  );
}